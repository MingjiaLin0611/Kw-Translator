import { describe, expect, it } from "vitest";
import { annotateDocument, shouldRunAnnotation } from "./index";
import type { GlossaryEntry } from "../shared/types";

const glossary: GlossaryEntry[] = [
  {
    id: "entry-1",
    source: "memoization",
    translation: "Memoization",
    enabled: true,
    caseSensitive: false,
    createdAt: 1,
    updatedAt: 2
  }
];

describe("annotateDocument", () => {
  it("does not duplicate annotation wrappers on repeated runs", () => {
    document.body.innerHTML = "<main><p>memoization helps.</p></main>";

    annotateDocument(document.body, glossary, ["CODE", "PRE"]);
    annotateDocument(document.body, glossary, ["CODE", "PRE"]);

    const terms = document.querySelectorAll("[data-kwt-root='true']");
    expect(terms).toHaveLength(1);
    expect(document.body.textContent).toContain("memoization(Memoization) helps.");
  });
});

describe("shouldRunAnnotation", () => {
  const settings = {
    extensionEnabled: true,
    annotateOnLoad: true,
    themeMode: "light" as const,
    annotationMode: "inline-brackets" as const,
    excludedTags: ["CODE", "PRE"]
  };

  it("blocks automatic annotation when annotate on load is disabled", () => {
    expect(
      shouldRunAnnotation("auto", {
        settings: {
          ...settings,
          annotateOnLoad: false
        },
        hostname: "docs.example.com",
        domainRules: []
      })
    ).toBe(false);
  });

  it("allows manual annotation when annotate on load is disabled", () => {
    expect(
      shouldRunAnnotation("manual", {
        settings: {
          ...settings,
          annotateOnLoad: false
        },
        hostname: "docs.example.com",
        domainRules: []
      })
    ).toBe(true);
  });

  it("blocks annotation when the extension is disabled or the site is blocked", () => {
    expect(
      shouldRunAnnotation("manual", {
        settings: {
          ...settings,
          extensionEnabled: false
        },
        hostname: "docs.example.com",
        domainRules: []
      })
    ).toBe(false);

    expect(
      shouldRunAnnotation("manual", {
        settings,
        hostname: "docs.example.com",
        domainRules: [
          {
            id: "block-docs",
            pattern: "docs.example.com",
            mode: "block",
            enabled: true
          }
        ]
      })
    ).toBe(false);
  });
});
