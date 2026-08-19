import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Popup } from "./Popup";

afterEach(cleanup);

it("renders the term form", () => {
  render(<Popup onAnnotate={vi.fn()} />);

  expect(screen.getByRole("heading", { name: "Kw Translator" })).toBeInTheDocument();
  expect(screen.getByLabelText("词汇")).toBeInTheDocument();
  expect(screen.getByLabelText("翻译")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "注释当前页面" })).toBeInTheDocument();
});

it("requires both term and translation before submitting", () => {
  const onAnnotate = vi.fn();
  render(<Popup onAnnotate={onAnnotate} />);

  fireEvent.click(screen.getByRole("button", { name: "注释当前页面" }));

  expect(screen.getByRole("alert")).toHaveTextContent("请输入词汇和翻译");
  expect(onAnnotate).not.toHaveBeenCalled();
});

it("submits trimmed term and translation", async () => {
  const onAnnotate = vi.fn().mockResolvedValue(undefined);
  render(<Popup onAnnotate={onAnnotate} />);

  fireEvent.change(screen.getByLabelText("词汇"), { target: { value: "  API  " } });
  fireEvent.change(screen.getByLabelText("翻译"), { target: { value: "  接口  " } });
  fireEvent.click(screen.getByRole("button", { name: "注释当前页面" }));

  await waitFor(() => expect(onAnnotate).toHaveBeenCalledWith("API", "接口"));
  expect(screen.getByRole("status")).toHaveTextContent("已发送当前页面注释请求");
});

it("shows a connection error when the page request fails", async () => {
  const onAnnotate = vi.fn().mockRejectedValue(new Error("no receiver"));
  render(<Popup onAnnotate={onAnnotate} />);

  fireEvent.change(screen.getByLabelText("词汇"), { target: { value: "API" } });
  fireEvent.change(screen.getByLabelText("翻译"), { target: { value: "接口" } });
  fireEvent.click(screen.getByRole("button", { name: "注释当前页面" }));

  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("无法连接到页面注释服务"),
  );
});
