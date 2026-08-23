import { annotateTextNodes } from "./annotate";
import type { AnnotationMessage, AnnotationResponse } from "../shared/messages";

function handleAnnotationMessage(message: AnnotationMessage): AnnotationResponse {
  const annotatedCount = annotateTextNodes(document.body, message.source, message.translation);
  return { ok: true, result: { annotatedCount } };
}

chrome.runtime.onMessage.addListener((message: AnnotationMessage, _sender, sendResponse) => {
  if (message.type !== "ANNOTATE_CURRENT_PAGE") return false;
  sendResponse(handleAnnotationMessage(message));
  return false;
});
