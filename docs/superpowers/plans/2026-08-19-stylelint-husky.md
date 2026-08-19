# Stylelint and Husky Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add CSS and SCSS linting with Stylelint and include it in the existing staged-file and pre-push workflows managed by Husky.

**Architecture:** Keep the existing Husky entrypoints and `lint-staged` orchestration. Add a root Stylelint configuration with standard CSS rules and a SCSS override using `postcss-scss`, a package script that tolerates the current repository having no style files, and run Stylelint before Prettier for staged CSS and SCSS files.

**Tech Stack:** pnpm, Stylelint, `stylelint-config-standard`, `stylelint-config-standard-scss`, `postcss-scss`, Husky, lint-staged, Prettier.

**Spec:** Approved in-chat design on 2026-08-19.

## Global Constraints

- Husky already exists and must be extended rather than duplicated.
- Stylelint must lint CSS and SCSS files and ignore generated or dependency directories.
- The repository currently has no CSS or SCSS files, so the style lint command must pass with an empty input set.
- Existing ESLint, Prettier, and hook behavior must remain enabled.
- Do not add runtime dependencies or change application behavior.

---

### Task 1: Add Stylelint dependencies and configuration

**Files:**

- Create: `stylelint.config.js`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Produces the `lint:style` package script and root Stylelint configuration consumed by hooks and local development.

- [x] **Step 1: Resolve current compatible package versions**

Run:

```bash
corepack pnpm add --save-dev stylelint stylelint-config-standard
```

Expected: `package.json` and `pnpm-lock.yaml` contain the two development dependencies.

- [x] **Step 2: Add the Stylelint configuration**

Create `stylelint.config.js` with standard CSS rules, a SCSS override using `postcss-scss` and `stylelint-config-standard-scss`, and ignores for dependencies, build output, coverage, and test reports.

- [x] **Step 3: Add the style lint script**

Add:

```json
"lint:style": "stylelint \"**/*.{css,scss}\" --allow-empty-input"
```

- [x] **Step 4: Run Stylelint against the current repository**

Run:

```bash
corepack pnpm lint:style
```

Expected: exit code 0 even though the repository currently contains no CSS or SCSS files.

### Task 2: Connect Stylelint to staged files and Husky pre-push

**Files:**

- Modify: `package.json`

**Interfaces:**

- Consumes the `lint:style` script and existing Husky commands.
- Produces staged CSS and SCSS linting and pre-push style verification.

- [x] **Step 1: Update the staged CSS pipeline**

Change the `lint-staged` style entry to run Stylelint auto-fix before Prettier:

```json
"*.{css,scss}": [
  "stylelint --fix",
  "prettier --write"
]
```

- [x] **Step 2: Update the pre-push command**

Change `hooks:pre-push` to run Stylelint between ESLint and Prettier:

```json
"hooks:pre-push": "corepack pnpm lint && corepack pnpm lint:style && corepack pnpm format:check"
```

- [x] **Step 3: Verify the complete toolchain**

Run:

```bash
corepack pnpm lint
corepack pnpm lint:style
corepack pnpm format:check
corepack pnpm hooks:pre-push
git diff --check
```

Expected: every command exits 0 and no existing hook command is removed.

- [x] **Step 4: Review the final change set**

Run:

```bash
git status --short
git diff --stat
git diff -- package.json stylelint.config.js .husky/pre-commit .husky/pre-push
```

Expected: only the planned tooling files, lockfile, and plan document are changed.
