import { describe, expect, it, vi } from "vitest";
import { createBackgroundMessageHandler } from "./index";

describe("background popup message flow", () => {
  it("sends an annotation message to the active tab", async () => {
    const sendMessageToTabMock = vi.fn().mockResolvedValue(undefined);
    const handler = createBackgroundMessageHandler({
      getStorageData: vi.fn(),
      updateSettings: vi.fn(),
      queryActiveTab: vi.fn().mockResolvedValue({
        id: 9,
        hostname: "docs.example.com"
      }),
      sendMessageToTab: sendMessageToTabMock
    });

    const response = await new Promise<unknown>((resolve) => {
      handler({ type: "kwt:annotate-page" }, {} as chrome.runtime.MessageSender, resolve);
    });

    expect(sendMessageToTabMock).toHaveBeenCalledWith(9, { type: "kwt:run-annotation" });
    expect(response).toEqual({ ok: true });
  });

  it("reports failure when annotation is requested without an active tab id", async () => {
    const sendMessageToTabMock = vi.fn();
    const handler = createBackgroundMessageHandler({
      getStorageData: vi.fn(),
      updateSettings: vi.fn(),
      queryActiveTab: vi.fn().mockResolvedValue({
        hostname: "unknown"
      }),
      sendMessageToTab: sendMessageToTabMock
    });

    const response = await new Promise<unknown>((resolve) => {
      handler({ type: "kwt:annotate-page" }, {} as chrome.runtime.MessageSender, resolve);
    });

    expect(sendMessageToTabMock).not.toHaveBeenCalled();
    expect(response).toEqual({ ok: false });
  });

  it("returns the popup state contract for kwt:get-popup-state", async () => {
    const handler = createBackgroundMessageHandler({
      getStorageData: vi.fn().mockResolvedValue({
        glossary: [{ id: "1" }],
        domainRules: [],
        settings: {
          extensionEnabled: true,
          annotateOnLoad: true,
          themeMode: "dark",
          annotationMode: "inline-brackets",
          excludedTags: ["CODE"]
        }
      }),
      updateSettings: vi.fn(),
      queryActiveTab: vi.fn().mockResolvedValue({
        id: 5,
        hostname: "docs.example.com"
      }),
      sendMessageToTab: vi.fn()
    });

    const response = await new Promise<unknown>((resolve) => {
      handler({ type: "kwt:get-popup-state" }, {} as chrome.runtime.MessageSender, resolve);
    });

    expect(response).toEqual({
      hostname: "docs.example.com",
      isEnabled: true,
      glossaryCount: 1,
      themeMode: "dark"
    });
  });

  it("returns synced popup state after toggling extension enabled", async () => {
    const updateSettingsMock = vi.fn().mockResolvedValue(undefined);
    const handler = createBackgroundMessageHandler({
      getStorageData: vi.fn().mockResolvedValue({
        glossary: [{ id: "1" }, { id: "2" }],
        domainRules: [],
        settings: {
          extensionEnabled: false,
          annotateOnLoad: true,
          themeMode: "light",
          annotationMode: "inline-brackets",
          excludedTags: ["CODE"]
        }
      }),
      updateSettings: updateSettingsMock,
      queryActiveTab: vi.fn().mockResolvedValue({
        id: 5,
        hostname: "app.example.com"
      }),
      sendMessageToTab: vi.fn()
    });

    const response = await new Promise<unknown>((resolve) => {
      handler(
        { type: "kwt:update-extension-enabled", enabled: false },
        {} as chrome.runtime.MessageSender,
        resolve
      );
    });

    expect(updateSettingsMock).toHaveBeenCalledWith({ extensionEnabled: false });
    expect(response).toEqual({
      hostname: "app.example.com",
      isEnabled: false,
      glossaryCount: 2,
      themeMode: "light"
    });
  });
});
