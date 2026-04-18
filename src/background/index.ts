import { getStorageData, updateSettings } from "../shared/storage";
import type {
  AnnotationRequest,
  PopupBootstrapRequest,
  PopupState,
  SettingsUpdateRequest
} from "../shared/types";

type BackgroundMessage = AnnotationRequest | PopupBootstrapRequest | SettingsUpdateRequest;

interface ActiveTabInfo {
  id?: number;
  hostname: string;
}

interface BackgroundDependencies {
  getStorageData: typeof getStorageData;
  updateSettings: typeof updateSettings;
  queryActiveTab: () => Promise<ActiveTabInfo>;
  sendMessageToTab: (tabId: number, message: { type: "kwt:run-annotation" }) => Promise<void>;
}

async function queryActiveTab(): Promise<ActiveTabInfo> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  const url = activeTab?.url;

  return {
    id: activeTab?.id,
    hostname: url ? new URL(url).hostname : "unknown"
  };
}

async function sendMessageToTab(tabId: number, message: { type: "kwt:run-annotation" }) {
  await chrome.tabs.sendMessage(tabId, message);
}

export async function buildPopupState(
  hostname: string,
  getData: typeof getStorageData = getStorageData
): Promise<PopupState> {
  const data = await getData();

  return {
    hostname,
    isEnabled: data.settings.extensionEnabled,
    glossaryCount: data.glossary.length,
    themeMode: data.settings.themeMode
  };
}

export function createBackgroundMessageHandler(dependencies: BackgroundDependencies) {
  return (
    message: BackgroundMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => {
    if (message.type === "kwt:annotate-page") {
      void dependencies.queryActiveTab().then(async (tab) => {
        if (!tab.id) {
          sendResponse({ ok: false });
          return;
        }

        await dependencies.sendMessageToTab(tab.id, { type: "kwt:run-annotation" });
        sendResponse({ ok: true });
      });

      return true;
    }

    if (message.type === "kwt:get-popup-state") {
      void dependencies.queryActiveTab().then(async (tab) => {
        sendResponse(await buildPopupState(tab.hostname, dependencies.getStorageData));
      });

      return true;
    }

    if (message.type === "kwt:update-extension-enabled") {
      void dependencies.queryActiveTab().then(async (tab) => {
        await dependencies.updateSettings({ extensionEnabled: message.enabled });
        sendResponse(await buildPopupState(tab.hostname, dependencies.getStorageData));
      });

      return true;
    }

    return false;
  };
}

const runtimeHandler = createBackgroundMessageHandler({
  getStorageData,
  updateSettings,
  queryActiveTab,
  sendMessageToTab
});

if (typeof chrome !== "undefined" && chrome.runtime?.onInstalled && chrome.runtime?.onMessage) {
  chrome.runtime.onInstalled.addListener(() => {
    void getStorageData();
  });

  chrome.runtime.onMessage.addListener(runtimeHandler);
}
