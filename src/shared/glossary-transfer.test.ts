import { describe, expect, it, vi } from "vitest";
import {
  createClipboardGlossaryPayload,
  createGlossaryExportPayload,
  parseGlossaryImport,
  serializeGlossary
} from "./glossary-transfer";
import type { GlossaryEntry } from "./types";

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

describe("glossary transfer helpers", () => {
  it("accepts a valid glossary import payload", () => {
    const parsed = parseGlossaryImport(
      JSON.stringify({
        glossary
      })
    );

    expect(parsed).toEqual(glossary);
  });

  it("rejects invalid import JSON", () => {
    expect(() => parseGlossaryImport("{bad json")).toThrow("Glossary import must be valid JSON.");
  });

  it("rejects JSON without valid glossary entries", () => {
    expect(() =>
      parseGlossaryImport(
        JSON.stringify({
          glossary: [
            {
              id: "entry-1",
              source: "memoization"
            }
          ]
        })
      )
    ).toThrow("Glossary import must contain a glossary array of valid entries.");
  });

  it("creates the expected export structure", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-18T07:00:00.000Z"));

    const payload = createGlossaryExportPayload(glossary);

    expect(payload).toEqual({
      version: 1,
      exportedAt: "2026-04-18T07:00:00.000Z",
      glossary
    });

    vi.useRealTimers();
  });

  it("creates clipboard text from the serialized glossary export", () => {
    expect(createClipboardGlossaryPayload(glossary)).toBe(serializeGlossary(glossary));
  });
});
