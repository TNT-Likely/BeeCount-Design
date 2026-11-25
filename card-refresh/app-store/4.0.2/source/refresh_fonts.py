"""Refresh the Google Fonts subsets after editing locales.json."""
import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

SOURCE = Path(__file__).resolve().parent


def subset(family, text):
    query = urlencode({'family': family, 'text': text})
    with urlopen('https://fonts.googleapis.com/css2?' + query, timeout=30) as response:
        css = response.read().decode()
    result = re.search(r'url\((https://fonts\.gstatic\.com/[^)]+)\)\s*format\([\'"]truetype[\'"]\)', css)
    if not result:
        raise ValueError(f'No TrueType subset in Google Fonts response for {family}')
    with urlopen(result.group(1), timeout=30) as response:
        data = response.read()
    if data[:4] != b'\x00\x01\x00\x00':
        raise ValueError(f'Unexpected font format for {family}')
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--offline', action='store_true', help='Refresh the offline treatment title subsets')
    args = parser.parse_args()
    destination = args.output or (SOURCE / 'fonts' / ('offline' if args.offline else ''))
    headline = 'offlineHeadline' if args.offline else 'headline'
    copy = json.loads((SOURCE / 'locales.json').read_text(encoding='utf-8'))
    english = copy['en-US']
    fonts = {english['titleFont']: subset('Bricolage Grotesque:opsz,wght@64,800', english[headline])}
    for locale, script in [('zh-Hans', 'SC'), ('zh-Hant', 'TC')]:
        edition = copy[locale]
        if args.offline:
            fonts[edition['titleFont']] = subset(f'Noto Sans {script}:wght@800', edition[headline])
            continue
        row = edition['transaction']
        text = edition[headline] + row['title'] + row['account'] + row['tag']
        for weight in (400, 500, 800):
            fonts[f'NotoSans{script}-{weight}.ttf'] = subset(f'Noto Sans {script}:wght@{weight}', text)
    destination.mkdir(parents=True, exist_ok=True)
    for name, data in fonts.items():
        (destination / name).write_bytes(data)


if __name__ == '__main__':
    main()
