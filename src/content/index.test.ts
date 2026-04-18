import { describe, expect, it } from "vitest";
import { annotateDocument } from "./index";
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
