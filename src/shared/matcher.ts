import type { GlossaryEntry } from "./types";

export interface MatchSegment {
  type: "text" | "match";
  value: string;
  entry?: GlossaryEntry;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function sortEntries(entries: GlossaryEntry[]) {
  return [...entries]
    .filter((entry) => entry.enabled && entry.source.trim() && entry.translation.trim())
    .sort((left, right) => right.source.length - left.source.length);
}

export function splitTextByMatches(text: string, entries: GlossaryEntry[]): MatchSegment[] {
  if (!text.trim() || entries.length === 0) {
    return [{ type: "text", value: text }];
  }

  const sortedEntries = sortEntries(entries);
  const segments: MatchSegment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    let matched = false;

    for (const entry of sortedEntries) {
      const flags = entry.caseSensitive ? "d" : "di";
      const matcher = new RegExp(escapeRegex(entry.source), flags);
      matcher.lastIndex = 0;
      const slice = text.slice(cursor);
      const result = matcher.exec(slice);

      if (!result || result.index !== 0) {
        continue;
      }

      segments.push({
        type: "match",
        value: result[0],
        entry
      });
      cursor += result[0].length;
      matched = true;
      break;
    }

    if (!matched) {
      segments.push({
        type: "text",
        value: text[cursor]
      });
      cursor += 1;
    }
  }

  return mergeTextSegments(segments);
}

function mergeTextSegments(segments: MatchSegment[]) {
  return segments.reduce<MatchSegment[]>((accumulator, segment) => {
    const previous = accumulator.at(-1);

    if (segment.type === "text" && previous?.type === "text") {
      previous.value += segment.value;
      return accumulator;
    }

    accumulator.push(segment);
    return accumulator;
  }, []);
}

