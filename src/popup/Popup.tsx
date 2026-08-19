import type { FormEvent, Dispatch, SetStateAction } from "react";
import { useState } from "react";
import "./Popup.css";

export type AnnotateCurrentPage = (source: string, translation: string) => Promise<void>;

type Feedback = { kind: "error" | "success"; message: string } | null;
type FormState = { source: string; translation: string };
type FeedbackSetter = Dispatch<SetStateAction<Feedback>>;

type PopupProps = {
  onAnnotate: AnnotateCurrentPage;
};

export function Popup({ onAnnotate }: PopupProps) {
  const [source, setSource] = useState("");
  const [translation, setTranslation] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) =>
    submitPopupForm(event, { source, translation }, onAnnotate, setFeedback);

  return (
    <PopupLayout
      form={{ source, translation }}
      feedback={feedback}
      onSourceChange={setSource}
      onTranslationChange={setTranslation}
      onSubmit={handleSubmit}
    />
  );
}

function submitPopupForm(
  event: FormEvent<HTMLFormElement>,
  form: FormState,
  onAnnotate: AnnotateCurrentPage,
  setFeedback: FeedbackSetter,
) {
  event.preventDefault();
  const source = form.source.trim();
  const translation = form.translation.trim();
  if (!source || !translation) {
    setFeedback({ kind: "error", message: "请输入词汇和翻译" });
    return;
  }
  void sendAnnotationRequest(source, translation, onAnnotate, setFeedback);
}

async function sendAnnotationRequest(
  source: string,
  translation: string,
  onAnnotate: AnnotateCurrentPage,
  setFeedback: FeedbackSetter,
) {
  try {
    await onAnnotate(source, translation);
    setFeedback({ kind: "success", message: "已发送当前页面注释请求" });
  } catch {
    setFeedback({ kind: "error", message: "无法连接到页面注释服务" });
  }
}

type PopupLayoutProps = {
  form: FormState;
  feedback: Feedback;
  onSourceChange: (value: string) => void;
  onTranslationChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function PopupLayout({
  form,
  feedback,
  onSourceChange,
  onTranslationChange,
  onSubmit,
}: PopupLayoutProps) {
  return (
    <main className="popup-shell">
      <PopupHeader />
      <PopupForm
        {...form}
        onSourceChange={onSourceChange}
        onTranslationChange={onTranslationChange}
        onSubmit={onSubmit}
      />
      <FeedbackMessage feedback={feedback} />
    </main>
  );
}

function PopupHeader() {
  return (
    <header className="popup-header">
      <p className="eyebrow">阅读辅助</p>
      <h1>Kw Translator</h1>
      <p className="subtitle">为当前页面添加术语注释</p>
    </header>
  );
}

type PopupFormProps = FormState & {
  onSourceChange: (value: string) => void;
  onTranslationChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function PopupForm({
  source,
  translation,
  onSourceChange,
  onTranslationChange,
  onSubmit,
}: PopupFormProps) {
  return (
    <form className="popup-form" onSubmit={onSubmit}>
      <TermField id="source" label="词汇" value={source} onChange={onSourceChange} />
      <TermField id="translation" label="翻译" value={translation} onChange={onTranslationChange} />
      <button type="submit">注释当前页面</button>
    </form>
  );
}

type TermFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function TermField({ id, label, value, onChange }: TermFieldProps) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </label>
  );
}

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <p
      className={`feedback ${feedback.kind}`}
      role={feedback.kind === "error" ? "alert" : "status"}
    >
      {feedback.message}
    </p>
  );
}
