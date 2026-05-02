import { describe, expect, it } from "vitest";
import { splitTextByMatches } from "./matcher";
import type { GlossaryEntry } from "./types";

const entries: GlossaryEntry[] = [
  {
    id: "1",
    source: "dependency injection",
    translation: "依赖注入",
    enabled: true,
    caseSensitive: false,
    createdAt: 0,
    updatedAt: 0
  },
  {
    id: "2",
    source: "dependency",
    translation: "依赖",
    enabled: true,
    caseSensitive: false,
    createdAt: 0,
    updatedAt: 0
  }
];

describe("splitTextByMatches", () => {
  it("prefers the longest glossary term first", () => {
    const segments = splitTextByMatches("dependency injection helps.", entries);

    expect(segments).toEqual([
      {
        type: "match",
        value: "dependency injection",
        entry: entries[0]
      },
      {
        type: "text",
        value: " helps."
      }
    ]);
  });

  it("ignores disabled entries and honors case-sensitive entries", () => {
    const segments = splitTextByMatches("Memoization memoization dependency.", [
      {
        id: "case-sensitive",
        source: "Memoization",
        translation: "Memoization",
        enabled: true,
        caseSensitive: true,
        createdAt: 0,
        updatedAt: 0
      },
      {
        id: "disabled",
        source: "dependency",
        translation: "Dependency",
        enabled: false,
        caseSensitive: false,
        createdAt: 0,
        updatedAt: 0
      }
    ]);

    expect(segments).toEqual([
      {
        type: "match",
        value: "Memoization",
        entry: {
          id: "case-sensitive",
          source: "Memoization",
          translation: "Memoization",
          enabled: true,
          caseSensitive: true,
          createdAt: 0,
          updatedAt: 0
        }
      },
      {
        type: "text",
        value: " memoization dependency."
      }
    ]);
  });
});
