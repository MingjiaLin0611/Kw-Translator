import { expect, test } from "@playwright/test";

test("options page imports pasted glossary JSON after build", async ({ page }) => {
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

    Object.defineProperty(window, "chrome", {
      configurable: true,
      value: {
        storage: {
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
        }
      }
    });
  });

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
