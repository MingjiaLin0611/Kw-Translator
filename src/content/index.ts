import { isForbiddenNode } from "../shared/dom";
import { splitTextByMatches } from "../shared/matcher";
import { getStorageData } from "../shared/storage";
import { isSiteEnabled } from "../shared/site";

const ROOT_MARKER = "data-kwt-root";

async function runAnnotation() {
  const { glossary, domainRules, settings } = await getStorageData();
  const hostname = window.location.hostname;

  if (!settings.extensionEnabled || !isSiteEnabled(hostname, domainRules)) {
    return;
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    const current = walker.currentNode as Text;
    if (!current.textContent?.trim()) {
      continue;
    }

    if (isForbiddenNode(current, settings.excludedTags)) {
      continue;
    }

    textNodes.push(current);
  }

  for (const textNode of textNodes) {
    annotateTextNode(textNode, glossary, settings.excludedTags);
  }
}

function annotateTextNode(textNode: Text, glossary: Awaited<ReturnType<typeof getStorageData>>["glossary"], excludedTags: string[]) {
  if (isForbiddenNode(textNode, excludedTags)) {
    return;
  }

  const content = textNode.textContent;
  if (!content) {
    return;
  }

  const segments = splitTextByMatches(content, glossary);
  const hasMatch = segments.some((segment) => segment.type === "match");

  if (!hasMatch) {
    return;
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
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "kwt:run-annotation") {
    void runAnnotation();
  }
});

void runAnnotation();

