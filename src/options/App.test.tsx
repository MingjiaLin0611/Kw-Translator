import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

const getStorageDataMock = vi.fn();
const saveGlossaryMock = vi.fn();
const updateSettingsMock = vi.fn();

vi.mock("../shared/storage", () => ({
  getStorageData: () => getStorageDataMock(),
  saveGlossary: (...args: unknown[]) => saveGlossaryMock(...args),
  updateSettings: (...args: unknown[]) => updateSettingsMock(...args)
}));

describe("options theme mode", () => {
  beforeEach(() => {
    getStorageDataMock.mockReset();
    saveGlossaryMock.mockReset();
    updateSettingsMock.mockReset();
    document.documentElement.dataset.theme = "";
  });

  it("applies the saved theme and updates the root dataset when toggled", async () => {
    getStorageDataMock.mockResolvedValue({
      glossary: [],
      domainRules: [],
      settings: {
        extensionEnabled: true,
        annotateOnLoad: true,
        themeMode: "dark",
        annotationMode: "inline-brackets",
        excludedTags: ["CODE"]
      }
    });
    updateSettingsMock.mockResolvedValue(undefined);

    render(<App />);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("dark");
    });

    const themeToggle = screen.getByLabelText("Enable dark theme");
    fireEvent.click(themeToggle);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe("light");
    });
    expect(updateSettingsMock).toHaveBeenCalledWith({ themeMode: "light" });
  });
});
