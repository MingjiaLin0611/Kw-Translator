# Kw Translator

Kw Translator 是一个面向技术文档阅读的浏览器扩展 Demo。

当前已完成 Popup → Background → Content Script 的手动注释链路：输入一个词汇和翻译后，扩展会将当前网页普通文本中的匹配内容改为 `词汇(翻译)`。当前只处理文本节点，不修改网页元素样式或结构。

当前运行流程：

```text
Popup → Background Service Worker → Content Script → 当前网页文本
```

当前限制：只支持一次手动输入的单个词汇，不包含持久化词库、自动注释、动态 DOM、iframe、Shadow DOM、复杂匹配、撤销和重复注释处理。

## 开发

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

## 构建扩展

```bash
corepack pnpm build
```

构建完成后，在 Chrome 的“扩展程序”页面开启开发者模式，选择“加载已解压的扩展程序”，载入 `dist/` 目录。

构建产物包含：

- `dist/index.html`：Popup 页面。
- `dist/assets/background.js`：Manifest V3 Background Service Worker。
- `dist/assets/content.js`：由 Background 动态注入的 Content Script。
