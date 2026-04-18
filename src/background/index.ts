import { getStorageData, updateSettings } from "../shared/storage";
import type { AnnotationRequest, PopupState, SettingsUpdateRequest } from "../shared/types";

chrome.runtime.onInstalled.addListener(() => {
  void getStorageData();
});

chrome.runtime.onMessage.addListener((message: AnnotationRequest | SettingsUpdateRequest, _sender, sendResponse) => {
  if (message.type === "kwt:annotate-page") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0]?.id;
      if (!activeTabId) {
        sendResponse({ ok: false });
        return;
      }

      void chrome.tabs.sendMessage(activeTabId, { type: "kwt:run-annotation" });
      sendResponse({ ok: true });
    });

    return true;
  }

  if (message.type === "kwt:update-extension-enabled") {
    void updateSettings({ extensionEnabled: message.enabled }).then(async (data) => {
      const state: PopupState = {
        hostname: "",
        isEnabled: data.settings.extensionEnabled,
        glossaryCount: data.glossary.length
      };
      sendResponse(state);
    });

    return true;
  }

  return false;
});

