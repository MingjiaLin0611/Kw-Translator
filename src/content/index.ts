import { isForbiddenNode } from "../shared/dom";
import type { GlossaryEntry } from "../shared/types";
import { splitTextByMatches } from "../shared/matcher";
import { getStorageData } from "../shared/storage";
import { isSiteEnabled } from "../shared/site";

const ROOT_MARKER = "data-kwt-root";
let annotationRunInFlight = false;

async function runAnnotation() {
  if (annotationRunInFlight) {
    return;
  }

  annotationRunInFlight = true;
  const { glossary, domainRules, settings } = await getStorageData();
  const hostname = window.location.hostname;

  if (!settings.extensionEnabled || !isSiteEnabled(hostname, domainRules)) {
    annotationRunInFlight = false;
    return;
  }

  try {
    annotateDocument(document.body, glossary, settings.excludedTags);
  } finally {
    annotationRunInFlight = false;
  }
}

export function collectTextNodes(root: ParentNode, excludedTags: string[]) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    const current = walker.currentNode as Text;
    if (!current.textContent?.trim()) {
      continue;
    }

    if (isForbiddenNode(current, excludedTags)) {
      continue;
    }

    textNodes.push(current);
  }

  return textNodes;
}

export function annotateDocument(root: HTMLElement, glossary: GlossaryEntry[], excludedTags: string[]) {
  const textNodes = collectTextNodes(root, excludedTags);

  for (const textNode of textNodes) {
    annotateTextNode(textNode, glossary, excludedTags);
  }
}

export function annotateTextNode(textNode: Text, glossary: GlossaryEntry[], excludedTags: string[]) {
  if (isForbiddenNode(textNode, excludedTags)) {
    return false;
  }

  const content = textNode.textContent;
  if (!content) {
    return false;
  }

  const segments = splitTextByMatches(content, glossary);
  const hasMatch = segments.some((segment) => segment.type === "match");

  if (!hasMatch) {
    return false;
  }

  const fragment = document.createDocumentFragment();

  for (const segment of segments) {
    if (segment.type === "text") {
      fragment.append(document.createTextNode(segment.value));
      continue;
    }

    const wrapper = document.createElement("span");
    wrapper.setAttribute(ROOT_MARKER, "true");
    wrapper.className = "kwt-term";
    wrapper.textContent = `${segment.value}(${segment.entry?.translation ?? ""})`;
    fragment.append(wrapper);
  }

  textNode.parentNode?.replaceChild(fragment, textNode);
  return true;
}

if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "kwt:run-annotation") {
      void runAnnotation();
    }
  });

  void runAnnotation();
}
