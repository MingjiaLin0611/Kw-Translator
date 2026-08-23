import type { AnnotateCurrentPage } from "./Popup";
import type { AnnotationMessage, AnnotationResponse } from "../shared/messages";

export function sendAnnotationMessage(): AnnotateCurrentPage {
  return async (source, translation) => {
    const response = await chrome.runtime.sendMessage<AnnotationMessage, AnnotationResponse>({
      type: "ANNOTATE_CURRENT_PAGE",
      source,
      translation,
    } satisfies AnnotationMessage);
    if (!response.ok) throw new Error(response.error);
  };
}
