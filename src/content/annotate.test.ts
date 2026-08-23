import { afterEach, expect, it } from "vitest";
import { annotateTextNodes } from "./annotate";

afterEach(() => {
  document.body.innerHTML = "";
});

it("replaces every matching source term in normal text nodes", () => {
  document.body.innerHTML = "<p>Use API in the API guide.</p>";

  const count = annotateTextNodes(document.body, "API", "应用程序接口");

  expect(count).toBe(2);
  expect(document.body.textContent).toBe("Use API(应用程序接口) in the API(应用程序接口) guide.");
});

it("does not modify excluded content", () => {
  document.body.innerHTML =
    '<p>API</p><code>API</code><input value="API"><div contenteditable>API</div>';

  annotateTextNodes(document.body, "API", "接口");

  expect(document.querySelector("p")?.textContent).toBe("API(接口)");
  expect(document.querySelector("code")?.textContent).toBe("API");
  expect(document.querySelector("input")?.value).toBe("API");
  expect(document.querySelector("[contenteditable]")?.textContent).toBe("API");
});

it("ignores empty source or translation", () => {
  document.body.innerHTML = "<p>API</p>";

  expect(annotateTextNodes(document.body, "", "接口")).toBe(0);
  expect(annotateTextNodes(document.body, "API", "")).toBe(0);
  expect(document.body.textContent).toBe("API");
});
