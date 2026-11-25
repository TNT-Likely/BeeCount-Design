# BeeCount 4.0.2 · App Store 创意素材

![左为通用产品页标题图，右为简体中文搜索结果图](preview.png)

产品页标题用纸雕蜜蜂、账本和连续的小票表现记账。搜索结果放大一笔咖啡支出，用 BeeCount 的真实 Flutter 账单行呈现对应语言和币种的示例数据。

## 上传成品

| 位置 | 本地化 | 尺寸 | PNG |
| --- | --- | --- | --- |
| 产品页标题 | 英语（美国）、简体中文、繁体中文共用 | 3840 × 1646 | [通用标题图](exports/BeeCount-Header.png) |
| 搜索结果 | 英语（美国） | 3840 × 2560 | [Coffee, logged.](exports/BeeCount-Search-en-US.png) |
| 搜索结果 | 简体中文 | 3840 × 2560 | [咖啡钱，记一笔](exports/BeeCount-Search-zh-Hans.png) |
| 搜索结果 | 繁體中文 | 3840 × 2560 | [咖啡錢，記一筆](exports/BeeCount-Search-zh-Hant.png) |

四份原图均为不带透明通道的 sRGB PNG。[SHA-256 清单](exports/SHA256SUMS)对应 4.0.2 上传文件的原始字节。

## 搜索结果 A/B 测试

默认页 A 用一杯咖啡举例。方案 B 在同一张图上强调离线记账。两组共用产品页标题图、桌面背景和本地化账单行，三种语言各自的 A、B 成品只有标题文字区域存在像素差异。

![从左到右为英语、简体中文和繁体中文的离线记账搜索图](treatments/offline/preview.png)

| 本地化 | 默认页 A | 方案 B · 3840 × 2560 PNG |
| --- | --- | --- |
| 英语（美国） | Coffee, logged. | [Log it offline.](treatments/offline/BeeCount-Search-Offline-en-US.png) |
| 简体中文 | 咖啡钱，记一笔 | [离线也能记账](treatments/offline/BeeCount-Search-Offline-zh-Hans.png) |
| 繁體中文 | 咖啡錢，記一筆 | [離線也能記帳](treatments/offline/BeeCount-Search-Offline-zh-Hant.png) |

测试设计为默认页与方案 B 各占 50%。4.0.2 发版时，将版本和这项产品页面优化测试放入同一份审核草稿，核对版本号后一起送审。[Apple 联合送审说明](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/overview-of-submitting-for-review/)

在 `source/` 安装下方列出的依赖后，执行以下命令可重新导出并校验方案 B。导出器将[三种语言的标题图层](source/art/offline-headlines/)叠在各自已归档的 A 图上，保证标题以外的像素一致。

```sh
npm run render:offline
cd ../build/offline
shasum -a 256 -c ../../treatments/offline/SHA256SUMS
```

修改 B 文案时，编辑 `source/locales.json` 中的 `offlineHeadline`。在 `source/` 执行 `python3 refresh_fonts.py --offline` 更新字形，再运行 `npm run refresh:offline-headlines`，即可通过同一份 HTML 模板生成新的标题图层和三张搜索图。

## 自定产品页面

「开源记账 · 离线与自托管」页面归档了三种语言的推广文本、真实 App 画面和两种 iPhone 尺寸的 18 张截图。[设计与成品](custom-pages/offline-self-hosted/README.md)

## 构图与安全区

坐标以成品左上角为原点，单位为像素。蜂和账本、搜索文案和账单行均完整落在相应安全区内。[Apple 素材规格](https://developer.apple.com/help/app-store-connect/reference/app-information/creative-assets-specifications/) · [Apple 设计指南与模板](https://developer.apple.com/app-store/asset-best-practices/)

| 成品 | 安全区起点 (x, y) | 安全区宽 × 高 | 画面构成 |
| --- | --- | --- | --- |
| 标题 | (1097, 493) | 1646 × 661 | [主画面](source/art/header-scene.png)从 (320, 174) 裁取 1200 × 514，再放大至成品尺寸 |
| 搜索结果 | (836, 765) | 2168 × 1030 | [桌面背景](source/art/search-background.png)、标题和[本地化账单行](source/rows/)按 [HTML 模板](source/search.html)合成 |

[制作提示词](source/artwork-prompts.txt)保留了内置 ImageGen 的原始提示。标题以 [App 蜜蜂标记](https://github.com/TNT-Likely/BeeCount/blob/2a5b53fbccca67905f7df6bb8e890c5a3fcab9a0/assets/logo_512.png)为参考，先制作[构图初稿](source/art/header-study.png)，再调整蜜蜂和账本的相对位置。

## 重新导出

在设计仓根目录执行以下命令。排版使用本机 Google Chrome，依赖版本由 npm 锁文件固定。归档 PNG 使用 macOS、Metal 图形后端、Node.js 20.20.2 和 Chrome 158.0.8127.37 导出。其他图形后端的字体抗锯齿和阴影像素可能略有不同。

```sh
cd card-refresh/app-store/4.0.2/source
npm ci
npm run render
cd ../build
shasum -a 256 -c ../exports/SHA256SUMS
```

导出器从归档的底图、字体和账单行生成四张 PNG，输出到 `build/`。更换素材时，更新[三种语言的文案和示例账单](source/locales.json)以及相应底图。标题字体按当前文字子集收录，新增汉字或英文字母时，在 `source/` 运行 `python3 refresh_fonts.py` 从 Google Fonts 更新字形。[标题及账单字体与授权](source/fonts/) · [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) · [Noto Sans SC](https://fonts.google.com/noto/specimen/Noto+Sans+SC) · [Noto Sans TC](https://fonts.google.com/noto/specimen/Noto+Sans+TC)

修改账单内容时，可从 App 的 [BeeTransactionRow](https://github.com/TNT-Likely/BeeCount/blob/2a5b53fbccca67905f7df6bb8e890c5a3fcab9a0/packages/beecount_business_ui/lib/src/transactions/transaction_row.dart) 重新渲染三个语言版本。原稿使用 Flutter 3.27.3。准备好对应的 App checkout 和 Flutter 依赖后，在本素材的 `source/` 目录运行以下命令，再重新导出成品。

```sh
export BEECOUNT_CREATIVE_SOURCE="$PWD"
cd "$BEECOUNT_APP_ROOT"
flutter test --no-pub "$BEECOUNT_CREATIVE_SOURCE/export_rows_test.dart"
```

该组件测试使用合成账单，在本机生成 `source/rows/` 中的图片。可通过 `BEECOUNT_ROW_OUTPUT` 指定单独的比对目录。
