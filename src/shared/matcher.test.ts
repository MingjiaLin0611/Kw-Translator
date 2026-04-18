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
});

