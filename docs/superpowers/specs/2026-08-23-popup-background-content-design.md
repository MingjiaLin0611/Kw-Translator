# Popup 到 Background 到 Content Script 注释链路设计

## 目标

打通当前扩展的最小运行链路：用户在 Popup 中输入一个词汇和翻译，点击按钮后，由 Background 找到当前活动标签页并将请求交给 Content Script，Content Script 将网页文本节点中的匹配词汇改成 `词汇(翻译)`。

## 范围

本阶段只实现一次手动注释请求和文本内容修改：

- Popup 继续负责输入、去除首尾空格和表单反馈。
- Background Service Worker 负责接收消息、查询活动标签页、注入 Content Script、转发请求和返回结果。
- Content Script 负责监听请求、遍历当前页面文本节点并替换匹配文本。
- Vite 生成 Popup、Background 和 Content Script 三类构建产物。
- Manifest 配置 Background Service Worker。

本阶段不实现词库、自动注释、持久化存储、动态 DOM 监听、iframe、Shadow DOM、复杂词形还原、样式注释、撤销和重复注释治理。页面范围仅限用户通过扩展 Popup 主动触发后获得的当前标签页权限。

## 架构

```text
Popup
  └─ chrome.runtime.sendMessage(ANNOTATE_CURRENT_PAGE)
       └─ Background Service Worker
            ├─ 查询当前活动标签页
            ├─ 动态注入 dist/assets/content.js
            └─ chrome.tabs.sendMessage(ANNOTATE_CURRENT_PAGE)
                 └─ Content Script
                      └─ 修改页面文本节点
```

使用动态注入而不是全站静态 `content_scripts`，以继续使用 `activeTab` 和 `scripting` 的最小权限组合，不新增全站 host 权限。Background 和 Content Script 作为 Vite 的独立入口构建，Manifest 只引用构建后的 Background 文件；Background 在收到用户主动请求后注入 Content Script 文件。

## 消息契约

Popup 到 Background、Background 到 Content Script 使用同一请求结构：

```ts
type AnnotationMessage = {
  type: "ANNOTATE_CURRENT_PAGE";
  source: string;
  translation: string;
};
```

Content Script 返回：

```ts
type AnnotationResult = {
  annotatedCount: number;
};
```

Background 将 Content Script 的结果作为 `sendResponse` 返回给 Popup。任一层无法查询标签页、注入脚本、发送消息或修改页面时，都返回可识别的错误；Popup 继续显示现有的连接失败反馈。

## 文本修改规则

Content Script 只处理文本节点，不改变元素标签、属性或 CSS：

- 从 `document.body` 开始遍历文本节点。
- 跳过 `SCRIPT`、`STYLE`、`NOSCRIPT`、`PRE`、`CODE`、`TEXTAREA`、`INPUT`、`SELECT` 和 `contenteditable` 区域。
- 对文本节点中出现的 `source` 进行字符串替换，结果为 `source(translation)`。
- `source` 或 `translation` 为空时不修改页面。
- 本阶段不承诺重复执行、动态内容和跨文本节点的高级处理。

## 构建与 Manifest

Vite 保留现有 `index.html` Popup 入口，并增加：

- `src/background/main.ts` → `dist/assets/background.js`
- `src/content/main.ts` → `dist/assets/content.js`

Manifest 增加 MV3 Background 配置，使用构建后的 `assets/background.js`。Content Script 不在 Manifest 的静态 `content_scripts` 中声明，而由 Background 使用 `chrome.scripting.executeScript({ files: ["assets/content.js"] })` 动态注入。

## 验收标准

在 Chrome 中加载新的 `dist/` 后：

1. 打开一个普通 `http` 或 `https` 页面，例如包含 `API` 文本的测试页。
2. 打开扩展 Popup，输入 `API` 和 `应用程序接口`。
3. 点击“注释当前页面”。
4. 页面中的普通文本显示为 `API(应用程序接口)`。
5. Popup 显示成功状态，不再因为缺少接收端显示连接错误。
6. 构建、ESLint、Stylelint、单元测试和格式检查全部通过。

Chrome 内部页面、扩展商店页面和其他受浏览器保护的页面不在本阶段验收范围内。
