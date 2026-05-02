import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_STORAGE } from "./defaults";
import { getStorageData, saveGlossary, updateSettings } from "./storage";
import type { GlossaryEntry } from "./types";

describe("storage theme settings", () => {
  const getMock = vi.fn();
  const setMock = vi.fn();

  beforeEach(() => {
    getMock.mockReset();
    setMock.mockReset();

    globalThis.chrome = {
      storage: {
        sync: {
          get: getMock,
          set: setMock
        }
      }
    } as typeof chrome;
  });

  it("returns the default theme mode when storage is empty", async () => {
    getMock.mockResolvedValue({});

    const data = await getStorageData();

    expect(data.settings.themeMode).toBe(DEFAULT_STORAGE.settings.themeMode);
  });

  it("persists theme mode updates into storage", async () => {
    getMock.mockResolvedValue({
      "kwt:data": DEFAULT_STORAGE
    });
    setMock.mockResolvedValue(undefined);

    const result = await updateSettings({ themeMode: "dark" });

    expect(result.settings.themeMode).toBe("dark");
    expect(setMock).toHaveBeenCalledWith({
      "kwt:data": {
        ...DEFAULT_STORAGE,
        settings: {
          ...DEFAULT_STORAGE.settings,
          themeMode: "dark"
        }
      }
    });
  });

  it("saves glossary entries without discarding settings or domain rules", async () => {
    const nextGlossary: GlossaryEntry[] = [
      {
        id: "entry-3",
        source: "render",
        translation: "Render",
        enabled: true,
        caseSensitive: false,
        createdAt: 3,
        updatedAt: 4
      }
    ];
    getMock.mockResolvedValue({
      "kwt:data": DEFAULT_STORAGE
    });
    setMock.mockResolvedValue(undefined);

    const result = await saveGlossary(nextGlossary);

    expect(result.glossary).toEqual(nextGlossary);
    expect(result.settings).toEqual(DEFAULT_STORAGE.settings);
    expect(result.domainRules).toEqual(DEFAULT_STORAGE.domainRules);
    expect(setMock).toHaveBeenCalledWith({
      "kwt:data": {
        ...DEFAULT_STORAGE,
        glossary: nextGlossary
      }
    });
  });
});
