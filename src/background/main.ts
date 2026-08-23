import type { AnnotationMessage, AnnotationResponse, AnnotationResult } from "../shared/messages";

function isAnnotationMessage(message: unknown): message is AnnotationMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    "type" in message &&
    message.type === "ANNOTATE_CURRENT_PAGE"
  );
}

export async function forwardAnnotationRequest(
  message: AnnotationMessage,
): Promise<AnnotationResult> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab.id === undefined) throw new Error("没有可用的活动标签页");
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["assets/content.js"],
  });
  const response = await chrome.tabs.sendMessage<AnnotationMessage, AnnotationResponse>(
    tab.id,
    message,
  );
  if (!response.ok) throw new Error(response.error);
  return response.result;
}

async function respondToAnnotationMessage(
  message: AnnotationMessage,
  sendResponse: (response: AnnotationResponse) => void,
) {
  try {
    const result = await forwardAnnotationRequest(message);
    sendResponse({ ok: true, result });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "页面注释失败";
    sendResponse({ ok: false, error: errorMessage });
  }
}

function registerMessageListener() {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isAnnotationMessage(message)) return false;
    void respondToAnnotationMessage(message, sendResponse);
    return true;
  });
}

if (typeof chrome !== "undefined") registerMessageListener();
