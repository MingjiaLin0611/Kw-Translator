import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_STORAGE } from "./defaults";
import { getStorageData, updateSettings } from "./storage";

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
});
