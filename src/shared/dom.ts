export function isForbiddenNode(node: Node, excludedTags: string[]) {
  const parentElement = node.parentElement;

  if (!parentElement) {
    return true;
  }

  if (parentElement.closest("[data-kwt-root='true'], [contenteditable='true'], [contenteditable='plaintext-only']")) {
    return true;
  }

  const excludedSelector = excludedTags.map((tagName) => tagName.toLowerCase()).join(", ");

  if (!excludedSelector) {
    return false;
  }

  return parentElement.closest(excludedSelector) !== null;
}
