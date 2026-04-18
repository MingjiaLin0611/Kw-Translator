import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS } from "../shared/defaults";
import { getStorageData, saveGlossary, updateSettings } from "../shared/storage";
import type { GlossaryEntry } from "../shared/types";

function createEmptyEntry(): GlossaryEntry {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    source: "",
    translation: "",
    enabled: true,
    caseSensitive: false,
    createdAt: now,
    updatedAt: now
  };
}

export function App() {
  const [entries, setEntries] = useState<GlossaryEntry[]>([]);
  const [draft, setDraft] = useState<GlossaryEntry>(createEmptyEntry());
  const [annotateOnLoad, setAnnotateOnLoad] = useState(DEFAULT_SETTINGS.annotateOnLoad);

  useEffect(() => {
    void getStorageData().then((data) => {
      setEntries(data.glossary);
      setAnnotateOnLoad(data.settings.annotateOnLoad);
    });
  }, []);

  async function handleSaveEntry() {
    if (!draft.source.trim() || !draft.translation.trim()) {
      return;
    }

    const nextEntries = [
      {
        ...draft,
        source: draft.source.trim(),
        translation: draft.translation.trim(),
        updatedAt: Date.now()
      },
      ...entries.filter((entry) => entry.id !== draft.id)
    ];

    await saveGlossary(nextEntries);
    setEntries(nextEntries);
    setDraft(createEmptyEntry());
  }

  async function handleDeleteEntry(id: string) {
    const nextEntries = entries.filter((entry) => entry.id !== id);
    await saveGlossary(nextEntries);
    setEntries(nextEntries);
  }

  async function handleToggleAnnotateOnLoad(nextValue: boolean) {
    setAnnotateOnLoad(nextValue);
    await updateSettings({ annotateOnLoad: nextValue });
  }

  return (
    <main className="options-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>词库与注释策略</h1>
          <p>
            这里维护 keyword-translator 的第一版词库。当前重点是稳定的术语管理，而不是复杂规则。
          </p>
        </div>
        <label className="toggle-card">
          <span>页面加载后自动注释</span>
          <input
            checked={annotateOnLoad}
            onChange={(event) => void handleToggleAnnotateOnLoad(event.target.checked)}
            type="checkbox"
          />
        </label>
      </section>

      <section className="layout">
        <article className="card form-card">
          <h2>新增术语</h2>
          <label>
            原文关键词
            <input
              onChange={(event) => setDraft((current) => ({ ...current, source: event.target.value }))}
              placeholder="dependency injection"
              value={draft.source}
            />
          </label>
          <label>
            翻译内容
            <input
              onChange={(event) => setDraft((current) => ({ ...current, translation: event.target.value }))}
              placeholder="依赖注入"
              value={draft.translation}
            />
          </label>
          <label className="checkbox-row">
            <input
              checked={draft.caseSensitive}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  caseSensitive: event.target.checked
                }))
              }
              type="checkbox"
            />
            区分大小写
          </label>
          <button onClick={() => void handleSaveEntry()} type="button">
            保存词条
          </button>
        </article>

        <article className="card list-card">
          <div className="list-header">
            <h2>当前词库</h2>
            <span>{entries.length} 条</span>
          </div>

          <div className="entry-list">
            {entries.map((entry) => (
              <div className="entry-item" key={entry.id}>
                <div>
                  <strong>{entry.source}</strong>
                  <p>{entry.translation}</p>
                </div>
                <button onClick={() => void handleDeleteEntry(entry.id)} type="button">
                  删除
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

