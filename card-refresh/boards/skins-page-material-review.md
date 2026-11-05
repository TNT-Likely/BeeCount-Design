# 页面皮肤与通透卡片评审

入口：`boards/skins-page-material-review.html`。Beta.4 的皮肤发布开关继续保持关闭。

## 本稿

- 页面背景统一承载渐变和完整图案，核心卡、图表与账户分组共享透明材质。没有文字矩形挖洞或卡片局部渐变窗口。
- 页面结构来自主 Demo，是可交互 HTML 原型。免费皮肤画层使用已有独立 Flutter CanvasKit renderer；没有修改 App，不宣称此稿是真机或最终 Flutter 布局。
- 一岁星座、生日蛋糕、静态山峦三款；支持首页、洞察、资产、我的，320/398/414，日夜、播放/暂停/静态和无皮肤对照。
- 沿用已有认可的渐变。两款周年底栏使用 3.9.0 原版 Flutter Tab 装饰；指针事件仍传给主 Demo。
- 页头、首卡、列表和底栏保留原有坐标。材质只改变颜色、透明度和视觉层，不增加顶部占位。
- 默认卡片覆盖 40%，可在评审工具中调节。是否向最终用户暴露该选项，仍待确认。

## 资源边界

页面承载与材质参考现有本地商业化预览的组织方式。本稿只消费公开 App 已有免费皮肤的渲染资源，没有复制付费皮肤、购买逻辑、商业模块或专用接入点。

场景画层：`renderers/build/skin-content-integration/`，原版元素哈希见该目录 `source-manifest.json`；Tab 画层：`renderers/build/original-skins-390/`。两个独立 renderer 均来自公开 App 的免费 3.9.0 源码，可使用 App 工具 `tool/v4/build_skin_integration_renderer.py` 和 `tool/v4/build_original_skin_renderer.py` 重建。

材质层见 `skins-page-material-product.css`，页面状态与几何对照见 `skins-page-material-review.js`。主 Demo 顶部预览工具和组件规范顶部已提供本稿入口。

## 已检查与后续

16 组页面/外观/屏幕组合（3 款同时显示），有无皮肤几何差异为 0；没有传入文字裁切区域。检查了无皮肤对照、暂停、真实底栏点击和 390 宽评审页无横向溢出。截图及机读结果只保留在 App 忽略目录 `.docs/v4-beta4/skin-material-layout`。

常规分类、标签文案沿用主 Demo 的合法短名称。极长账户、账本或备注需在后续 Flutter 落地中继续验证。浏览器抗锯齿、字体和页面数据均不能代替 Android 真机验收。

## 用户确认与 Flutter 对应

2026-11-05 用户已确认按本稿落地。基础材质由 `beecount_ui/BeePageMaterial` 承载，F27 和 App 基础组件第24组同步提供开关与不透明弹层示例。透明度固定40%，不新增用户偏好；画层、生命周期与原皮肤选择保留在 App 适配层。历史 Beta.4 APK 仍为皮肤关闭版，不能将此稿视为已发布。
