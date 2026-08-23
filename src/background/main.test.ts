import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { forwardAnnotationRequest } from "./main";

const message = {
  type: "ANNOTATE_CURRENT_PAGE" as const,
  source: "API",
  translation: "接口",
};

const query = vi.fn();
const executeScript = vi.fn();
const sendMessage = vi.fn();

beforeEach(() => {
  vi.stubGlobal("chrome", {
    tabs: { query, sendMessage },
    scripting: { executeScript },
  });
  query.mockResolvedValue([{ id: 42 }]);
  executeScript.mockResolvedValue([]);
  sendMessage.mockResolvedValue({ ok: true, result: { annotatedCount: 2 } });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("injects content and forwards the annotation request", async () => {
  await expect(forwardAnnotationRequest(message)).resolves.toEqual({ annotatedCount: 2 });
  expect(executeScript).toHaveBeenCalledWith({
    target: { tabId: 42 },
    files: ["assets/content.js"],
  });
  expect(sendMessage).toHaveBeenCalledWith(42, message);
});

it("rejects when there is no active tab id", async () => {
  query.mockResolvedValue([{ id: undefined }]);

  await expect(forwardAnnotationRequest(message)).rejects.toThrow("活动标签页");
});
