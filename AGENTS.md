# Kw-Translator 项目协作规则

## 项目定位

Kw-Translator 是面向技术文档阅读的浏览器扩展，核心能力是维护本地术语词库，并在网页中将命中的术语以内联形式显示为：

```text
keyword(translation)
```

它是“术语注释式阅读增强工具”，不是默认的整页翻译器。实现和需求评审都应优先保护以下产品原则：

- 保留网页原文和原有结构。
- 只处理用户主动维护或启用的术语。
- 结果可预测、可关闭、可重复执行而不产生重复注释。
- 初始版本以本地词库和浏览器存储为核心，不引入数据库、后端或云端同步。
- AI 翻译、选中文本翻译和页面替换属于后续扩展，必须经过单独的需求确认。

## 当前仓库状态

当前 `main` 分支只包含仓库初始化文件和本规则文件。完整的 Manifest V3、React、TypeScript、Vite 实现位于远端分支 `codex/m1-project-scaffold`，其最新已知提交为 `f4d8fb1 feat: close out M2 milestone`。

因此：

- 不要把开发分支中的功能描述成已经存在于 `main` 的功能。
- 在 `main` 上实现功能前，应先明确是否要合并或迁移开发分支内容。
- 合并完成后，应同步更新 README、分支说明、里程碑报告和交接文档，避免继续保留“M1”或过期分支状态。
- 不要覆盖、重置或丢弃用户已有改动。

开发分支当前代表的实现阶段是 M2 基础闭环，而不是完整产品发布版：词库集合、动态页面兼容、AI 能力、真实扩展 E2E 和发布准备仍属于后续工作。

## 技术架构

目标技术栈为：

- Chrome Manifest V3。
- React + TypeScript + Vite。
- pnpm，版本由 `package.json` 的 `packageManager` 字段约束。
- Vitest + Testing Library，用于单元和组件测试。
- Playwright，用于页面级和后续扩展级 E2E 测试。

完整实现按以下边界组织：

- `src/popup/`：查看当前站点、扩展开关、词库数量，触发当前页注释。
- `src/options/`：管理词库和扩展设置，执行本地导入导出。
- `src/background/`：处理扩展消息、活动标签页查询和 popup/content script 通信。
- `src/content/`：读取配置、扫描文本节点、执行术语注释。
- `src/shared/`：类型、默认值、存储、匹配、域名规则、DOM 过滤和主题等纯领域能力。
- `public/manifest.json`：扩展权限、入口和 content script 配置。

共享领域逻辑应尽量不直接依赖 Chrome API。浏览器 API 访问集中在 storage、background 和入口适配层中，消息请求和响应保持明确的类型契约。

## 当前数据模型约束

当前 M2 数据模型是单一扁平 `glossary` 数组，配合 `domainRules` 和 `settings` 保存于统一存储键。词条至少包含：

- `id`
- `source`
- `translation`
- `enabled`
- `caseSensitive`
- `createdAt`
- `updatedAt`

后续 M3 计划引入 `GlossaryCollection` 和活动词库。迁移时必须：

- 保留旧的所有词条、设置和域名规则。
- 为旧扁平词库创建安全的默认集合。
- 明确活动集合删除或失效时的回退策略。
- 不让导入一个集合覆盖用户的其他集合。

如果未来加入 AI 配置，API key 必须只保存在本地，并且绝不能进入词库导出数据、日志、测试快照或提交记录。

## 核心行为要求

修改注释引擎时必须保持：

- 只匹配启用、非空且有翻译的词条。
- 长术语优先于包含它的短术语。
- 尊重 `caseSensitive`。
- 跳过 `code`、`pre`、`script`、`style`、`textarea`、`input`、`contenteditable` 和已有注释根节点。
- 自动注释受 `annotateOnLoad` 控制，popup 手动触发仍应有清晰且独立的行为。
- 重复执行不能在已有 `data-kwt-root` 节点内部再次注释。
- 处理失败时不能让后续手动注释永久失效，也不能静默破坏原始文本。

当前实现边界包括动态页面、iframe、Shadow DOM、复杂词形还原和跨文本节点匹配。新增这些能力时应先补充设计和测试，不要在一次改动中隐式扩大范围。

## 存储、权限和隐私

- 优先使用 `chrome.storage.sync`，不可用时才回退到 `chrome.storage.local`。
- 修改存储结构时必须提供兼容旧数据的读取或迁移逻辑。
- 导入 JSON 必须校验结构、字段类型和版本；拒绝无效数据，不直接信任任意对象。
- `public/manifest.json` 当前使用较宽的网页权限。新增权限必须说明用途，并优先缩小权限范围。
- 不提交 `.env`、API key、个人笔记、浏览器数据、测试产物或其他秘密。
- 未经明确需求，不添加数据库、后端、云端同步或远程数据采集。

## 开发和验证

在完整实现分支中使用以下命令：

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm build
corepack pnpm test:unit
corepack pnpm test:e2e
```

其中：

- `build` 必须同时通过 TypeScript 检查和 Vite 生产构建。
- 修改共享逻辑、content script、background 消息或存储结构时，必须补充对应单元测试。
- 修改 options/popup 用户流程时，至少更新对应组件测试或 Playwright 测试。
- 当前 E2E 主要是 Vite preview 上的页面级测试，并 mock 了 `chrome.storage`；它不能替代真实安装扩展、background、popup 和 content script 的集成验证。
- 涉及扩展加载、页面注释、动态网页或权限的改动，完成前应增加真实扩展 E2E 或明确记录未覆盖的风险。
- 只有在验证命令实际通过后，才能声称改动完成。

构建目录、Playwright 报告、测试结果和依赖安装目录不得提交；应继续由 `.gitignore` 管理。

## 代码风格和 Git Hooks

- 每个函数最多 20 行，由 ESLint 的 `max-lines-per-function` 强制检查。
- 函数必须使用表达意图的语义化名称，避免 `doSomething`、`handleData` 等无法说明职责的命名。
- 一个函数只负责一个清晰动作；如果超过 20 行，应按真实职责拆分，不要为了过规则制造无意义的包装函数。
- 优先选择直接、易读的实现。没有实际复用、隔离或测试价值时，不要增加抽象层、配置层或通用工具。
- `pre-commit` 会对暂存文件执行 ESLint 自动修复和 Prettier 格式化。
- `pre-push` 会执行完整 ESLint 和 `prettier --check`；检查失败时不得绕过 hook 推送。
- 本地安装依赖后，Husky 会通过 `prepare` 配置 Git hooks。手动执行验证时使用 `corepack pnpm lint:fix` 和 `corepack pnpm format:check`。

## 文档和路线图

代码、文档和实际分支状态必须保持一致。涉及功能或里程碑的改动，应检查并按需同步：

- `README.md`
- `docs/architecture.md`
- `docs/process.md`
- `docs/plans/`
- `docs/reports/`
- `docs/session-handoff.md`

文档要求：

- 不使用开发者本机的绝对路径，使用仓库相对路径。
- 不把 M1、M2 或未开始的 M3-M7 功能混写成已发布能力。
- Mermaid 源文件和生成的 SVG 必须同步更新，并在修改后验证语法。
- 测试报告应包含日期、环境、命令、通过/失败/跳过数量和残余风险。
- README 应说明当前默认分支实际可运行状态、安装方式、权限用途和已知限制。

产品路线应保持分阶段：

1. M1：扩展工程骨架和最小可运行入口。
2. M2：单词库、稳定注释、主题、导入导出和 popup/background 闭环。
3. M3：多词库集合、活动集合和透明的行业预设导入。
4. M4：本地 AI provider/model/API 配置和连接测试。
5. M5：带词库上下文的 AI 校准与人工翻译预览。
6. M6：选中文本快捷翻译及带预览/撤销的受控替换。
7. M7：隐私说明、错误恢复、兼容性、真实 E2E 和发布准备。

不要因为用户提出 AI 需求就跳过词库迁移、权限、隐私、错误处理、限流、预览和撤销设计。

## Git 约定

- 使用清晰的 Conventional Commit 风格提交信息，例如 `feat: add glossary collections`。
- 不重写历史，不强制推送，不执行破坏性 reset/checkout，除非用户明确要求。
- 提交前检查 `git status`、`git diff --check` 和相关测试结果。
- 变更应小而聚焦；不要把无关的格式化、依赖升级或目录重构混入功能提交。
