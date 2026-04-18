import type { GlossaryEntry } from "./types";

export interface GlossaryExportPayload {
  version: 1;
  exportedAt: string;
  glossary: GlossaryEntry[];
}

function isGlossaryEntry(value: unknown): value is GlossaryEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.source === "string" &&
    typeof candidate.translation === "string" &&
    typeof candidate.enabled === "boolean" &&
    typeof candidate.caseSensitive === "boolean" &&
    typeof candidate.createdAt === "number" &&
    typeof candidate.updatedAt === "number"
  );
}

export function createGlossaryExportPayload(glossary: GlossaryEntry[]): GlossaryExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    glossary
  };
}

export function serializeGlossary(glossary: GlossaryEntry[]) {
  return JSON.stringify(createGlossaryExportPayload(glossary), null, 2);
}

export function createClipboardGlossaryPayload(glossary: GlossaryEntry[]) {
  return serializeGlossary(glossary);
}

export function parseGlossaryImport(rawInput: string): GlossaryEntry[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawInput);
  } catch {
    throw new Error("Glossary import must be valid JSON.");
  }

  const nextGlossary = Array.isArray(parsed)
    ? parsed
    : (parsed as { glossary?: unknown })?.glossary;

  if (!Array.isArray(nextGlossary) || !nextGlossary.every(isGlossaryEntry)) {
    throw new Error("Glossary import must contain a glossary array of valid entries.");
  }

  return nextGlossary;
}
