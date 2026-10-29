# BeeCount Design

蜜蜂记账的页面设计、可交互 HTML、组件规范与历史评审。App 源码在 [TNT-Likely/BeeCount](https://github.com/TNT-Likely/BeeCount)。

设计资源统一在 `card-refresh/`，保留原相对树，App 仓不再重复提交这些大图与 HTML。最初快照来自 App `v4` / `0bbc79c86e278ccb6a07c8baa2e4fc2f842956a3` 的设计树，随后包含目录整理与已确认组件同步；旧设计历史仍可在原 App 仓追溯。

## 浏览

```sh
python3 -m http.server 8374 --bind 127.0.0.1 --directory card-refresh
```

- `http://127.0.0.1:8374/`：设计资源，可平铺或分组，展示方式持久化。
- `/prototype/demo.html`：可交互主稿。
- `/components/ui-components.html`：基础与业务组件目录。
- `/boards/`：专项评审与里程碑大图。

已提交 HTML 和里程碑图可直接查看。`screens/` 逐页 PNG、`figma/` 批量 SVG、QA 与 Flutter-web renderer bundle 是可重建的本机生成物，不进入每次 review；未生成时目录索引中的逐页图片/导出链接不可用，但交互页面仍可打开。完整导出使用后述 `npm run export`。

## 从源重建

设计构建显式读取公共 App checkout，普通 App 构建和回归不需要此设计仓。

```sh
git clone https://github.com/TNT-Likely/BeeCount.git ../BeeCount
cd card-refresh
npm ci
BEECOUNT_APP_ROOT=/absolute/path/to/BeeCount npm run build
BEECOUNT_APP_ROOT=/absolute/path/to/BeeCount npm run guide:html
npm run index
npm run check:app
```

默认 App 目录是与本仓相邻的 `BeeCount`；其他位置通过 `BEECOUNT_APP_ROOT` 指定。唯一解析器为 `card-refresh/scripts/app-paths.cjs`，禁止新增多级 `../../` 猜测 App 根。`app-source.lock.json` 记录源基线与实际输入 hash；`npm run check:app` 明确检查输入一致，不能把任意 App checkout 当作锁定版本。源码改变后先审阅输入差异再重建并更新锁。

完整浏览器检查用 `npm run check`，分项检查见 `package.json`。完整 PNG/SVG 用 `npm run export`，组件图片用 `npm run guide`。原始动态皮肤 renderer 使用 App 的固定历史源码与 Flutter SDK，由 App 的 `tool/v4/build_*skin*_renderer.py` 显式指定本设计根重建，不从设计仓 Git 读取 App tag。

几何校验的 `--freeze` 只输出 `qa/contract-candidates/` 候选，不静默写回 App 测试。批准后再将小型契约作为 App 实现改动审阅。

## 同步与范围

App 的 `tool/design/design.lock.json` 指向经审阅的设计 commit，`tool/design/contracts`、合成 test fixture 与 `tool/vendor/lucide` 提供离线回归。组件变更同时维护真实 Flutter 样例和 HTML，HTML/PNG 均为合成数据，不用于证明 Cloud、模型、导入或系统分享已经验收。

本机迁移进度 `card-refresh/migration-progress.html` 由 App 工具生成并保持 ignored，只有本地执行环境提供该入口；它不是公开设计版本的一部分。

设计仓保留现有素材与许可证；Lucide vendor 许可证位于 `card-refresh/prototype/vendor/LUCIDE-LICENSE`。凭据、真实数据库、私有QA、签名和执行进度不上传本仓。
