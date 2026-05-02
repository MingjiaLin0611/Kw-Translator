import { describe, expect, it } from "vitest";
import { isSiteEnabled } from "./site";
import type { DomainRule } from "./types";

const rules: DomainRule[] = [
  {
    id: "allow-docs",
    pattern: "docs.example.com",
    mode: "allow",
    enabled: true
  },
  {
    id: "block-admin",
    pattern: "admin.docs.example.com",
    mode: "block",
    enabled: true
  }
];

describe("isSiteEnabled", () => {
  it("allows any hostname when no enabled allow rules exist", () => {
    expect(isSiteEnabled("news.example.com", [])).toBe(true);
  });

  it("requires an allow match when enabled allow rules exist", () => {
    expect(isSiteEnabled("docs.example.com", rules)).toBe(true);
    expect(isSiteEnabled("blog.example.com", rules)).toBe(false);
  });

  it("gives enabled block rules priority over allow rules", () => {
    expect(isSiteEnabled("admin.docs.example.com", rules)).toBe(false);
  });
});
