import type { AnnotateCurrentPage } from "./Popup";

type AnnotationMessage = {
  type: "ANNOTATE_CURRENT_PAGE";
  source: string;
  translation: string;
};

export function sendAnnotationMessage(): AnnotateCurrentPage {
  return (source, translation) =>
    chrome.runtime.sendMessage<AnnotationMessage>({
      type: "ANNOTATE_CURRENT_PAGE",
      source,
      translation,
    });
}
