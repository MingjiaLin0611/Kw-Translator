# keyword-translator

`keyword-translator` 是一个浏览器扩展，用来做“术语注释式翻译”，而不是整页翻译。

它会维护一份可编辑词库，在网页中命中关键词后以内联形式显示：

```text
keyword(翻译)
```

## 当前阶段

当前仓库处于 `M1 项目骨架`，已经包含：

- Manifest V3 扩展结构
- React + TypeScript + Vite 工程配置
- popup / options / background / content script 入口
- 本地词库存储模型
- 第一版文本匹配与页面注释骨架
- Vitest 与 Playwright 测试入口

## 开发命令

```bash
corepack pnpm install
corepack pnpm build
corepack pnpm test:unit
corepack pnpm test:e2e
```

## 目录结构

```text
src/
  background/
  content/
  options/
  popup/
  shared/
  test/
tests/
  e2e/
docs/
  process.md
```
