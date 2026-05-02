# M2 to M3 Handoff

## Snapshot

- Repository: `MingjiaLin0611/Kw-Translator`
- Local path: `C:\Users\<user>\Desktop\programming\Kw-Translator`
- Current branch: `codex/m1-project-scaffold`
- Remote branch: `origin/codex/m1-project-scaffold`
- Last pushed commit: `4af005c feat: deliver M2 glossary workflow and diagrams`
- Handoff date: `2026-05-02`
- M2 status: functionally complete in the current working tree

Important repository state:

- The pushed branch already contains the first M2 delivery at `4af005c`.
- The final M2 completion patch is currently local and not yet committed or pushed.
- The branch name still says `m1-project-scaffold`, but the branch content has advanced through M2.

Current local changes that belong to the M2 closeout:

- `src/content/index.ts`
- `src/content/index.test.ts`
- `src/background/index.test.ts`
- `src/shared/storage.test.ts`
- `src/shared/matcher.test.ts`
- `src/shared/glossary-transfer.test.ts`
- `src/shared/site.test.ts`
- `tests/e2e/smoke.spec.ts`
- `docs/plans/m2-plan.md`
- `docs/session-handoff.md`

## M2 Completion Verdict

M2 is complete against the planned scope:

- `M2-01 UX Theme Foundation`: complete
- `M2-02 Import/Export Basic I/O`: complete
- `M2-03 Annotation Stability Upgrade`: complete
- `M2-04 Popup/Background Action Consistency`: complete

The final M2 bug fixed during closeout:

- `annotateOnLoad` was previously saved by the options UI but not enforced by the content script.
- The content script now distinguishes automatic annotation from manual popup-triggered annotation.
- Automatic page-load annotation obeys `settings.annotateOnLoad`.
- Manual annotation remains available even when `annotateOnLoad` is off, as long as the extension and site rules allow it.

## M2 Delivered Features

### Extension Foundation

- Manifest V3 extension structure.
- Vite + React + TypeScript build.
- Separate popup, options, background, and content script entry points.
- Build output supports `popup.html`, `options.html`, `background.js`, and `content.js`.

### Storage and Settings

- Unified storage key: `kwt:data`.
- Uses `chrome.storage.sync` when available, falling back to `chrome.storage.local`.
- Persists glossary entries, domain rules, and extension settings.
- Supports extension enabled state, annotate-on-load setting, dark/light theme, annotation mode, and excluded tags.

### Glossary Management

- Options page can add glossary entries.
- Options page can delete glossary entries.
- Entries include source term, translation, enabled flag, case-sensitivity flag, and timestamps.
- Current M2 data model is still a single flat glossary list.

### Import and Export

- Export current glossary to a JSON file.
- Copy current glossary JSON to the clipboard.
- Import glossary from a local JSON file.
- Import glossary from pasted JSON text.
- Invalid JSON and invalid glossary payloads are rejected.

### Annotation

- Content script scans text nodes and annotates glossary matches as `keyword(translation)`.
- Longest matching glossary entry wins.
- Disabled or empty glossary entries are ignored.
- Case-sensitive entries are honored.
- Repeated annotation runs do not duplicate existing annotation wrappers.
- Forbidden nodes are skipped, including code, pre, script, style, textarea, input, contenteditable, and existing annotation roots.
- Site rules are supported at the domain-rule helper layer.

### Popup and Background

- Popup displays current hostname, extension enabled state, active glossary count, and theme state.
- Popup can toggle the extension enabled state.
- Popup can trigger manual annotation in the active tab.
- Background script routes popup requests to the active tab and returns a stable popup state contract.

### Theme

- Options page and popup support dark/light theme state.
- Theme is persisted in settings.
- Theme is applied through `document.documentElement.dataset.theme`.

## Current Data Structures

### GlossaryEntry

```ts
interface GlossaryEntry {
  id: string;
  source: string;
  translation: string;
  enabled: boolean;
  caseSensitive: boolean;
  createdAt: number;
  updatedAt: number;
}
```

### DomainRule

```ts
interface DomainRule {
  id: string;
  pattern: string;
  mode: "allow" | "block";
  enabled: boolean;
}
```

### ExtensionSettings

```ts
interface ExtensionSettings {
  extensionEnabled: boolean;
  annotateOnLoad: boolean;
  themeMode: "light" | "dark";
  annotationMode: "inline-brackets";
  excludedTags: string[];
}
```

### StorageShape

```ts
interface StorageShape {
  glossary: GlossaryEntry[];
  domainRules: DomainRule[];
  settings: ExtensionSettings;
}
```

### GlossaryExportPayload

```ts
interface GlossaryExportPayload {
  version: 1;
  exportedAt: string;
  glossary: GlossaryEntry[];
}
```

## Test Coverage

Fresh verification run on `2026-05-02`:

- `corepack pnpm build`: passed
- `corepack pnpm test:unit`: passed
- `corepack pnpm test:e2e`: passed
- `git diff --check`: passed, with only CRLF conversion warnings

Current test metrics:

- Unit test files: `8`
- Unit tests: `23 passed`
- E2E test files: `1`
- E2E tests: `3 passed`
- Total automated tests: `26`
- Passed: `26`
- Failed: `0`
- Skipped: `0`

### Unit Test Coverage

- `src/shared/storage.test.ts`
  - default theme read
  - theme update persistence
  - glossary save preserves settings and domain rules
- `src/shared/glossary-transfer.test.ts`
  - valid glossary import
  - invalid JSON rejection
  - invalid glossary entry rejection
  - export payload structure
  - clipboard payload serialization
- `src/shared/matcher.test.ts`
  - longest term priority
  - disabled entries ignored
  - case-sensitive entry behavior
- `src/shared/dom.test.ts`
  - forbidden node skipping
- `src/shared/site.test.ts`
  - default allow behavior
  - allow-rule filtering
  - block-rule priority
- `src/content/index.test.ts`
  - duplicate annotation guard
  - automatic annotation blocked when annotate-on-load is off
  - manual annotation allowed when annotate-on-load is off
  - disabled extension and blocked site prevent annotation
- `src/background/index.test.ts`
  - annotation message sent to active tab
  - annotation request fails without active tab id
  - popup state contract
  - extension enabled toggle sync
- `src/options/App.test.tsx`
  - saved theme applied
  - theme toggle updates root dataset and storage

### E2E Coverage

The current E2E suite runs against Vite preview and mocks `chrome.storage`.

- `options page adds and deletes a glossary entry after build`
- `options page toggles theme and annotate-on-load controls`
- `options page imports pasted glossary JSON after build`

This is page-level E2E coverage, not full installed-extension E2E coverage.

## Visual Browser Check

A visible Google Chrome check was run manually through Playwright headed mode.

Verified:

- Options page loads.
- Add glossary entry works.
- Dark theme toggle works.
- Annotate-on-load toggle works.
- Screenshots and video recording are supported through Playwright.

Artifacts were generated under:

- `test-results/visible-browser-check/`

Note:

- `test-results/` is gitignored.
- Running the normal Playwright test suite can clear this directory.

## Known Non-Blocking Limits

These are not M2 blockers, but should be understood before M3:

- E2E tests do not yet load `dist/` as a real Chrome extension.
- Popup/content/background are covered mostly by unit tests, not full extension automation.
- Domain rule storage and helper exist, but there is no domain-rule management UI yet.
- Glossary entry UI supports add/delete but not in-place editing or per-entry enable toggling.
- Current storage uses a single `glossary` array; M3 must migrate this to glossary collections.
- Some older Chinese docs contain mojibake and should eventually be cleaned up.

## M3 Starting Point

M3 should focus on glossary collections and industry presets.

Recommended M3 scope:

- Introduce `GlossaryCollection`.
- Add `activeGlossaryCollectionId` or equivalent setting.
- Migrate old `StorageShape.glossary` into a default collection.
- Let users create, rename, delete, and duplicate collections.
- Keep entries independent per collection.
- Use only the active collection for annotation.
- Add small built-in industry presets that users import on demand.
- Support import/export for one collection and all collections.

Suggested M3 data shape:

```ts
interface GlossaryCollection {
  id: string;
  name: string;
  description?: string;
  entries: GlossaryEntry[];
  readonlyPreset?: boolean;
  createdAt: number;
  updatedAt: number;
}

interface StorageShapeV2 {
  glossaryCollections: GlossaryCollection[];
  activeGlossaryCollectionId: string;
  domainRules: DomainRule[];
  settings: ExtensionSettings;
}
```

M3 migration requirement:

- If stored data has `glossary` but no `glossaryCollections`, create a default collection and preserve all existing glossary entries.
- Do not discard existing settings or domain rules.

Recommended first M3 tests:

- migrate flat M2 glossary to default collection
- active collection selection controls annotation
- collection import/export preserves metadata and entries
- preset import does not overwrite user collections
- deleting active collection chooses a safe fallback active collection

## Recommended Next Actions

1. Review this handoff.
2. Commit the M2 closeout changes.
3. Push the branch or rename/create a clearer branch before pushing, for example `codex/m2-closeout`.
4. Start M3 with storage migration tests before changing the UI.
