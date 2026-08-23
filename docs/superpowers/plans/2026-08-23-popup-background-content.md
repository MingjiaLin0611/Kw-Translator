# Popup to Background to Content Script Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 打通 Popup → Background Service Worker → Content Script 的手动注释链路，让当前网页文本中的匹配词汇显示为 `词汇(翻译)`。

**Architecture:** Popup 发送共享消息契约；Background 查询当前活动标签页，动态注入构建后的 Content Script，再通过 `chrome.tabs.sendMessage` 转发请求；Content Script 遍历文本节点并只修改文本值。Vite 保留 Popup HTML 入口并增加 Background、Content Script 两个构建入口。

**Tech Stack:** Chrome Manifest V3, React, TypeScript, Vite, Vitest, Testing Library, Chrome `activeTab`/`scripting`/`tabs` APIs.

**Spec:** `docs/superpowers/specs/2026-08-23-popup-background-content-design.md`

## Global Constraints

- 只实现一次手动注释请求和文本内容修改。
- 使用动态注入 Content Script，不新增全站 host 权限。
- Content Script 只处理文本节点，不修改元素标签、属性或 CSS。
- 跳过 `SCRIPT`、`STYLE`、`NOSCRIPT`、`PRE`、`CODE`、`TEXTAREA`、`INPUT`、`SELECT` 和 `contenteditable` 区域。
- 本阶段不实现词库、自动注释、持久化存储、动态 DOM、iframe、Shadow DOM、复杂词形还原、撤销和重复注释治理。
- 不引入新的运行时依赖；保持每个函数不超过 20 行。

## File Map

- Create `src/shared/messages.ts`: shared message and response types.
- Create `src/content/annotate.ts` and `src/content/annotate.test.ts`: DOM text replacement and tests.
- Create `src/content/main.ts`: Content Script message listener.
- Create `src/background/main.ts` and `src/background/main.test.ts`: Background forwarding and tests.
- Create `src/popup/chrome.test.ts`: Popup-to-Background response tests.
- Modify `src/popup/chrome.ts`, `vite.config.ts`, `public/manifest.json`, and `README.md`.
- Include the approved design at `docs/superpowers/specs/2026-08-23-popup-background-content-design.md`.

### Task 1: Add the shared message contract

**Files:** Create `src/shared/messages.ts`; modify `src/popup/chrome.ts`.

**Interfaces:**

```ts
export type AnnotationMessage = {
  type: "ANNOTATE_CURRENT_PAGE";
  source: string;
  translation: string;
};

export type AnnotationResult = { annotatedCount: number };

export type AnnotationResponse =
  { ok: true; result: AnnotationResult } | { ok: false; error: string };
```

- [ ] **Step 1: Write the failing type usage** — change `src/popup/chrome.ts` to import `AnnotationMessage` and `AnnotationResponse`, send the existing message with `satisfies AnnotationMessage`, and throw `response.error` when `response.ok` is false.
- [ ] **Step 2: Run `corepack pnpm exec tsc --noEmit`** — expect failure because `src/shared/messages.ts` is absent.
- [ ] **Step 3: Create `src/shared/messages.ts`** with the exact three types above.
- [ ] **Step 4: Run `corepack pnpm exec tsc --noEmit`** — expect pass.

### Task 2: Implement and test text-node annotation

**Files:** Create `src/content/annotate.ts` and `src/content/annotate.test.ts`.

**Interface:**

```ts
export function annotateTextNodes(root: Node, source: string, translation: string): number;
```

- [ ] **Step 1: Write failing tests** for: two matches in normal text, no changes in `code`, `input`, and `[contenteditable]`, and no changes for empty source/translation.
- [ ] **Step 2: Run `corepack pnpm exec vitest run src/content/annotate.test.ts --environment jsdom`** — expect failure because the module is absent.
- [ ] **Step 3: Implement `annotateTextNodes`** using `document.createTreeWalker(root, NodeFilter.SHOW_TEXT)`, collecting nodes before mutation. Exclude ancestors matching `script,style,noscript,pre,code,textarea,input,select,[contenteditable]`. Replace each text node with `parts.join(`${source}(${translation})`)` and return the replacement count.
- [ ] **Step 4: Run the focused test command again** — expect all annotation tests to pass.

### Task 3: Add the Content Script listener

**Files:** Create `src/content/main.ts`.

**Interface:** Register `chrome.runtime.onMessage` and return `AnnotationResponse` through `sendResponse`.

- [ ] **Step 1: Add a listener for `ANNOTATE_CURRENT_PAGE`** that calls `annotateTextNodes(document.body, message.source, message.translation)`, sends `{ ok: true, result: { annotatedCount } }`, returns `false`, and ignores unrelated messages.
- [ ] **Step 2: Run `corepack pnpm exec tsc --noEmit`** — expect pass with the shared types and annotation module present.

### Task 4: Implement and test Background forwarding

**Files:** Create `src/background/main.ts` and `src/background/main.test.ts`.

**Interface:**

```ts
export async function forwardAnnotationRequest(
  message: AnnotationMessage,
): Promise<AnnotationResult>;
```

- [ ] **Step 1: Write failing tests** with mocked `chrome.tabs.query`, `chrome.scripting.executeScript`, and `chrome.tabs.sendMessage`. Assert that active tab id `42` causes injection of `{ target: { tabId: 42 }, files: ["assets/content.js"] }`, forwarding to tab `42`, and a returned count of `2`. Add a second test asserting no active tab id rejects with `活动标签页`.
- [ ] **Step 2: Run `corepack pnpm exec vitest run src/background/main.test.ts --environment jsdom`** — expect failure because `forwardAnnotationRequest` is absent.
- [ ] **Step 3: Implement forwarding** in this order: query `{ active: true, lastFocusedWindow: true }`; reject when `tab.id` is absent; await `chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["assets/content.js"] })`; await `chrome.tabs.sendMessage<AnnotationResponse>(tab.id, message)`; reject an `{ ok: false }` response and return its result for `{ ok: true }`.
- [ ] **Step 4: Register the Background listener** at module load. Ignore unrelated messages, return `true` for the async response path, and send either `{ ok: true, result }` or `{ ok: false, error }` after awaiting `forwardAnnotationRequest`.
- [ ] **Step 5: Run the focused Background test command again** — expect both tests to pass.

### Task 5: Configure multi-entry build and Manifest

**Files:** Modify `vite.config.ts` and `public/manifest.json`.

- [ ] **Step 1: Add Rollup inputs** using `fileURLToPath` and `resolve`: `popup: index.html`, `background: src/background/main.ts`, and `content: src/content/main.ts`. Keep `outDir: "dist"` and set `entryFileNames: "assets/[name].js"`.
- [ ] **Step 2: Add the Manifest V3 service worker**:

```json
"background": {
  "service_worker": "assets/background.js"
}
```

Keep `activeTab` and `scripting`; do not add `<all_urls>` or `host_permissions`.

- [ ] **Step 3: Run `corepack pnpm build`** — expect `dist/index.html`, `dist/manifest.json`, `dist/assets/background.js`, and `dist/assets/content.js`.

### Task 6: Verify Popup response handling

**Files:** Modify `src/popup/chrome.ts`; create `src/popup/chrome.test.ts`.

- [ ] **Step 1: Write tests** with `vi.stubGlobal("chrome", { runtime: { sendMessage: vi.fn() } })`; assert a successful response resolves and `{ ok: false, error: "..." }` rejects with that error.
- [ ] **Step 2: Run `corepack pnpm exec vitest run src/popup/chrome.test.ts --environment jsdom`** — expect failure until response interpretation is implemented.
- [ ] **Step 3: Implement the response check** while preserving the existing `AnnotateCurrentPage` signature used by `Popup.tsx`.
- [ ] **Step 4: Run `corepack pnpm test:unit`** — expect all Popup and new boundary tests to pass.

### Task 7: Update documentation and complete verification

**Files:** Modify `README.md`; include the approved design and this plan.

- [ ] **Step 1: Update README** to describe manual Popup → Background → Content Script text annotation, the `keyword(translation)` result, build output, and current limits: one manually supplied term, text nodes only, no persistent glossary, no dynamic DOM, and no duplicate handling.
- [ ] **Step 2: Run the full verification suite**:

```bash
corepack pnpm lint
corepack pnpm lint:style
corepack pnpm build
corepack pnpm test:unit
corepack pnpm format:check
git diff --check
```

Expect every command to exit with code 0.

- [ ] **Step 3: Inspect `git status --short`, `git diff --stat`, and `dist/manifest.json`**. Confirm only intended source, config, docs, and tests changed; confirm the generated manifest references `assets/background.js`.
- [ ] **Step 4: Commit** with:

```bash
git add README.md public/manifest.json src vite.config.ts docs/superpowers/specs/2026-08-23-popup-background-content-design.md docs/superpowers/plans/2026-08-23-popup-background-content.md
git commit -m "feat: connect popup to page annotation scripts"
```
