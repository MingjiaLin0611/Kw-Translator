import { describe, expect, it } from "vitest";
import { isForbiddenNode } from "./dom";

describe("isForbiddenNode", () => {
  it("skips text nested inside excluded tags", () => {
    document.body.innerHTML = "<code><span>memoization</span></code>";
    const textNode = document.querySelector("span")?.firstChild;

    expect(textNode).not.toBeNull();
    expect(isForbiddenNode(textNode as Node, ["CODE", "PRE"])).toBe(true);
  });
});
