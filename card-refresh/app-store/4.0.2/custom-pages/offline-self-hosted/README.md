# 开源记账 · 离线与自托管

这张 BeeCount 自定产品页面面向希望在本机记账、按需自建同步服务的人。页面使用独立的 App Store 链接。英语（美国）、简体中文和繁體中文各有推广文本及三张截图，依次演示一笔本地咖啡账单、BeeCount Cloud 连接设置和可选备份服务。[推广文本、标题和示例数据](copy.json)

![自定产品页面。上、中、下三排依次为英语、简体中文、繁体中文](preview.png)

| 截图 | 英语（美国） | 简体中文 | 繁體中文 |
| --- | --- | --- | --- |
| 1206 × 2622 | [英语成品](exports/1206x2622/en-US/) | [简中成品](exports/1206x2622/zh-Hans/) | [繁中成品](exports/1206x2622/zh-Hant/) |
| 1284 × 2778 | [英语成品](exports/1284x2778/en-US/) | [简中成品](exports/1284x2778/zh-Hans/) | [繁中成品](exports/1284x2778/zh-Hant/) |

上传顺序与文件名前缀一致。三种语言共用纸雕蜜蜂产品页标题图，搜索结果页按语言使用「离线也能记账」系列。页面还可通过专属链接用于 GitHub 或官网的下载入口。[通用标题图](../../exports/BeeCount-Header.png) · [三语搜索结果图](../../treatments/offline/) · [Apple 自定产品页面说明](https://developer.apple.com/app-store/custom-product-pages/)

## 重新导出

商店排版使用真实 Flutter 页面采集图。三种语言分别从 App 加载对应本地化，示例账本存于内存数据库，云配置表单只显示 App 自带的占位符。排版源码、原始画面和标题字体均已归档。[真实界面](source/screens/) · [HTML 模板](source/poster.html) · [排版和导出脚本](source/render.cjs) · [字体授权](../../source/fonts/)

在本页目录执行以下命令。先用 SHA-256 清单核对提交给 Apple 的原始文件，再将重新渲染的结果写入独立目录。导出使用本机 Google Chrome 和上级设计源稿锁定的 Playwright、Sharp 版本。Chrome 的阴影和颜色渐变在重复渲染时可能出现一个色阶的像素差异。

```sh
npm --prefix ../../source ci
(cd exports && shasum -a 256 -c SHA256SUMS)
BEECOUNT_CPP_OUTPUT="$PWD/../../build/custom-pages/offline-self-hosted" node source/render.cjs
```

更换外层标题或说明时，编辑 `copy.json`，运行 `python3 source/prepare_fonts.py` 更新用到的字形后重新导出。App 界面有变化时，可用下面的流程重新采集。原稿使用 BeeCount `4.0.1` 的 Flutter 页面和 Flutter 3.27.3。设置 `BEECOUNT_APP_ROOT` 和 `FLUTTER_ROOT` 指向已安装依赖的 App checkout 和 Flutter SDK，在当前目录运行以下命令。[对应 App 源码](https://github.com/TNT-Likely/BeeCount/tree/7dde20e6f6124f40f8fb12efc22df541ab37d03b) · [采集脚本](source/capture_screens_test.dart)

```sh
export BEECOUNT_CPP_SOURCE="$PWD"
export BEECOUNT_CPP_CAPTURES="$PWD/source/screens"
export BEECOUNT_CPP_FONTS="$(mktemp -d)"
export BEECOUNT_MATERIAL_FONTS="$FLUTTER_ROOT/bin/cache/artifacts/material_fonts"
python3 -m venv "$BEECOUNT_CPP_FONTS/venv"
"$BEECOUNT_CPP_FONTS/venv/bin/pip" install fonttools==4.59.2
"$BEECOUNT_CPP_FONTS/venv/bin/python" source/prepare_fonts.py --app "$BEECOUNT_APP_ROOT" --ui "$BEECOUNT_CPP_FONTS"
(cd "$BEECOUNT_APP_ROOT" && flutter test --no-pub "$BEECOUNT_CPP_SOURCE/source/capture_screens_test.dart")
node source/render.cjs
```
