"""Prepare the poster fonts and optional Flutter UI fonts for this page."""
import argparse
import json
import string
import sys
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen

SOURCE = Path(__file__).resolve().parent
ROOT = SOURCE.parent
sys.path.insert(0, str(ROOT.parents[1] / "source"))
from refresh_fonts import subset


def ui_fonts(script, destination, text):
    from fontTools import subset as font_subset
    from fontTools.ttLib import TTFont
    from fontTools.varLib.instancer import instantiateVariableFont

    name = f"NotoSans{script}"
    variable = destination / f"{name}-Variable.ttf"
    if not variable.exists():
        file_name = quote(f"{name}[wght].ttf")
        url = f"https://raw.githubusercontent.com/google/fonts/main/ofl/{name.lower()}/{file_name}"
        with urlopen(url, timeout=120) as response:
            variable.write_bytes(response.read())
    font = TTFont(variable)
    sub = font_subset.Subsetter()
    sub.populate(text=text)
    sub.subset(font)
    for weight in (400, 500, 700):
        result = instantiateVariableFont(font, {"wght": weight}, inplace=False)
        result.save(destination / f"{name}-{weight}.ttf")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ui", type=Path, help="Directory for optional Flutter capture fonts")
    parser.add_argument("--app", type=Path, help="BeeCount source checkout for its localized UI strings")
    args = parser.parse_args()
    if args.ui and not args.app:
        parser.error("--ui needs --app")
    locales = json.loads((ROOT / "copy.json").read_text())["localizations"]
    destination = SOURCE / "fonts"
    destination.mkdir(exist_ok=True)
    if args.ui:
        args.ui.mkdir(parents=True, exist_ok=True)
    for locale, script in [("en-US", None), ("zh-Hans", "SC"), ("zh-Hant", "TC")]:
        content = locales[locale]
        title = "".join("".join(lines) for lines in content["headlines"].values())
        tagline = "".join(content["details"].values())
        family = f"Noto Sans {script}" if script else "Bricolage Grotesque"
        title_axis = ":wght@800" if script else ":opsz,wght@64,800"
        (destination / f"{locale}-title.ttf").write_bytes(subset(family + title_axis, title))
        (destination / f"{locale}-caption.ttf").write_bytes(subset(family + ":wght@500", tagline))
        if args.ui and script:
            filename = "app_zh.arb" if script == "SC" else "app_zh_TW.arb"
            strings = json.loads((args.app / "lib/l10n" / filename).read_text())
            localized = "".join(v for k, v in strings.items() if not k.startswith("@") and isinstance(v, str))
            fixture = json.dumps(content["transaction"], ensure_ascii=False)
            ui_fonts(script, args.ui, localized + fixture + string.printable + "−¥＄€")


if __name__ == "__main__":
    main()
