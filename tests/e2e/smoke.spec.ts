import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function installChromeStorageMock(page: Page) {
  await page.addInitScript(() => {
    const storageState = {
      "kwt:data": {
        glossary: [
          {
            id: "sample-memoization",
            source: "memoization",
            translation: "Memoization",
            enabled: true,
            caseSensitive: false,
            createdAt: 1,
            updatedAt: 1
          }
        ],
        domainRules: [],
        settings: {
          extensionEnabled: true,
          annotateOnLoad: true,
          themeMode: "light",
          annotationMode: "inline-brackets",
          excludedTags: ["CODE", "PRE", "SCRIPT", "STYLE", "TEXTAREA", "INPUT"]
        }
      }
    };

    const storage = {
      sync: {
        async get(key: string) {
          if (typeof key === "string") {
            return { [key]: storageState[key as keyof typeof storageState] };
          }

          return storageState;
        },
        async set(nextState: Record<string, unknown>) {
          Object.assign(storageState, nextState);
        }
      },
      local: null
    };

    if (!window.chrome) {
      Object.defineProperty(window, "chrome", {
        configurable: true,
        value: { storage }
      });
    } else {
      Object.defineProperty(window.chrome, "storage", {
        configurable: true,
        value: storage
      });
    }
  });
}

test("options page adds and deletes a glossary entry after build", async ({ page }) => {
  await installChromeStorageMock(page);
  await page.goto("http://127.0.0.1:4173/options.html");

  await page.getByLabel("Source term").fill("render pipeline");
  await page.getByLabel("Translation").fill("Render Pipeline");
  await page.getByRole("button", { name: "Save Entry" }).click();

  const glossaryCard = page.getByRole("article").filter({ hasText: "Current Glossary" });
  const newEntry = glossaryCard.locator(".entry-item").filter({ hasText: "render pipeline" });

  await expect(glossaryCard.getByText("2 items")).toBeVisible();
  await expect(newEntry.getByText("Render Pipeline", { exact: true })).toBeVisible();

  await newEntry.getByRole("button", { name: "Delete" }).click();

  await expect(glossaryCard.getByText("1 items")).toBeVisible();
  await expect(newEntry).toHaveCount(0);
});

test("options page toggles theme and annotate-on-load controls", async ({ page }) => {
  await installChromeStorageMock(page);
  await page.goto("http://127.0.0.1:4173/options.html");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.getByLabel("Enable dark theme").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByText("Dark")).toBeVisible();

  await page.getByLabel("Annotate on page load").click();
  await expect(page.getByText("Off")).toBeVisible();
});

test("options page imports pasted glossary JSON after build", async ({ page }) => {
  await installChromeStorageMock(page);

  await page.goto("http://127.0.0.1:4173/options.html");

  const glossaryCard = page.getByRole("article").filter({ hasText: "Current Glossary" });

  await expect(glossaryCard.getByText("Current Glossary")).toBeVisible();
  await expect(glossaryCard.getByText("1 items")).toBeVisible();

  await page.getByLabel("Paste glossary JSON").fill(
    JSON.stringify({
      glossary: [
        {
          id: "entry-2",
          source: "dependency injection",
          translation: "Dependency Injection",
          enabled: true,
          caseSensitive: false,
          createdAt: 2,
          updatedAt: 2
        }
      ]
    })
  );
  await page.getByRole("button", { name: "Import Pasted JSON" }).click();

  await expect(page.getByRole("status")).toHaveText("Imported 1 entries from pasted JSON.");
  await expect(glossaryCard.locator("strong", { hasText: "dependency injection" })).toBeVisible();
});
