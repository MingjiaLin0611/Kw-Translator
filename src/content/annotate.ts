const EXCLUDED_SELECTOR = "script,style,noscript,pre,code,textarea,input,select,[contenteditable]";

function isExcludedTextNode(node: Node) {
  return !node.parentElement || Boolean(node.parentElement.closest(EXCLUDED_SELECTOR));
}

function collectTextNodes(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    if (!isExcludedTextNode(node)) nodes.push(node as Text);
    node = walker.nextNode();
  }
  return nodes;
}

function replaceText(node: Text, source: string, translation: string) {
  const replacement = `${source}(${translation})`;
  const parts = node.data.split(source);
  if (parts.length === 1) return 0;
  node.data = parts.join(replacement);
  return parts.length - 1;
}

export function annotateTextNodes(root: Node, source: string, translation: string) {
  if (!source || !translation) return 0;
  return collectTextNodes(root).reduce(
    (count, node) => count + replaceText(node, source, translation),
    0,
  );
}
