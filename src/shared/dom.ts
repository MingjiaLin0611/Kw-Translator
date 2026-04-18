export function isForbiddenNode(node: Node, excludedTags: string[]) {
  const parentElement = node.parentElement;

  if (!parentElement) {
    return true;
  }

  if (parentElement.closest("[data-kwt-root='true']")) {
    return true;
  }

  return excludedTags.includes(parentElement.tagName);
}

