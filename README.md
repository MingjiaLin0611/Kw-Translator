# Kw Translator

Kw Translator 是一个面向技术文档阅读的浏览器扩展 Demo。

当前已完成 popup 页面：可以输入词汇和翻译，并提交当前页面注释请求。页面注释执行逻辑将在后续开发中接入。

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
