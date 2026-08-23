import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { sendAnnotationMessage } from "./chrome";

const sendMessage = vi.fn();

beforeEach(() => {
  vi.stubGlobal("chrome", { runtime: { sendMessage } });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("resolves when Background accepts the request", async () => {
  sendMessage.mockResolvedValue({ ok: true, result: { annotatedCount: 1 } });

  await expect(sendAnnotationMessage()("API", "接口")).resolves.toBeUndefined();
  expect(sendMessage).toHaveBeenCalledWith({
    type: "ANNOTATE_CURRENT_PAGE",
    source: "API",
    translation: "接口",
  });
});

it("rejects with the Background error", async () => {
  sendMessage.mockResolvedValue({ ok: false, error: "没有可用的活动标签页" });

  await expect(sendAnnotationMessage()("API", "接口")).rejects.toThrow("没有可用的活动标签页");
});
