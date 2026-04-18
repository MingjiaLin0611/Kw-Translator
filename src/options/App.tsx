import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS } from "../shared/defaults";
import {
  createClipboardGlossaryPayload,
  parseGlossaryImport,
  serializeGlossary
} from "../shared/glossary-transfer";
import { getStorageData, saveGlossary, updateSettings } from "../shared/storage";
import { applyTheme } from "../shared/theme";
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
  const [themeMode, setThemeMode] = useState(DEFAULT_SETTINGS.themeMode);
  const [importText, setImportText] = useState("");
  const [transferMessage, setTransferMessage] = useState("No import or export action yet.");

  useEffect(() => {
    void getStorageData().then((data) => {
      setEntries(data.glossary);
      setAnnotateOnLoad(data.settings.annotateOnLoad);
      setThemeMode(data.settings.themeMode);
      applyTheme(data.settings.themeMode);
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

  async function handleToggleTheme(nextValue: boolean) {
    const nextThemeMode = nextValue ? "dark" : "light";

    setThemeMode(nextThemeMode);
    applyTheme(nextThemeMode);
    await updateSettings({ themeMode: nextThemeMode });
  }

  async function applyImportedGlossary(nextGlossary: GlossaryEntry[], source: "file" | "text") {
    await saveGlossary(nextGlossary);
    setEntries(nextGlossary);
    setTransferMessage(
      source === "file"
        ? `Imported ${nextGlossary.length} entries from file.`
        : `Imported ${nextGlossary.length} entries from pasted JSON.`
    );
  }

  async function handleExportFile() {
    const payload = serializeGlossary(entries);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "kw-translator-glossary.json";
    link.click();
    URL.revokeObjectURL(url);
    setTransferMessage(`Exported ${entries.length} entries to JSON file.`);
  }

  async function handleCopyGlossary() {
    await navigator.clipboard.writeText(createClipboardGlossaryPayload(entries));
    setTransferMessage(`Copied ${entries.length} entries to the clipboard.`);
  }

  async function handleImportFile(file: File | undefined) {
    if (!file) {
      return;
    }

    try {
      const parsedGlossary = parseGlossaryImport(await file.text());
      await applyImportedGlossary(parsedGlossary, "file");
    } catch (error) {
      setTransferMessage(error instanceof Error ? error.message : "File import failed.");
    }
  }

  async function handleImportText() {
    try {
      const parsedGlossary = parseGlossaryImport(importText);
      await applyImportedGlossary(parsedGlossary, "text");
    } catch (error) {
      setTransferMessage(error instanceof Error ? error.message : "Text import failed.");
    }
  }

  return (
    <main className="options-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Settings</p>
          <h1>Glossary and Annotation Controls</h1>
          <p>
            Manage the core glossary, keep the interface restrained, and tune how keyword
            annotation behaves across pages.
          </p>
        </div>

        <div className="control-stack">
          <label className="toggle-card">
            <span>Theme Mode</span>
            <div className="toggle-copy">
              <strong>{themeMode === "dark" ? "Dark" : "Light"}</strong>
              <span>Use the same visual mode in the popup and options pages.</span>
            </div>
            <input
              aria-label="Enable dark theme"
              checked={themeMode === "dark"}
              onChange={(event) => void handleToggleTheme(event.target.checked)}
              type="checkbox"
            />
          </label>

          <label className="toggle-card">
            <span>Annotate On Load</span>
            <div className="toggle-copy">
              <strong>{annotateOnLoad ? "On" : "Off"}</strong>
              <span>Run annotation automatically when the page finishes loading.</span>
            </div>
            <input
              aria-label="Annotate on page load"
              checked={annotateOnLoad}
              onChange={(event) => void handleToggleAnnotateOnLoad(event.target.checked)}
              type="checkbox"
            />
          </label>
        </div>
      </section>

      <section className="layout">
        <article className="card form-card">
          <h2>Add Glossary Entry</h2>
          <label>
            Source term
            <input
              onChange={(event) => setDraft((current) => ({ ...current, source: event.target.value }))}
              placeholder="dependency injection"
              value={draft.source}
            />
          </label>
          <label>
            Translation
            <input
              onChange={(event) =>
                setDraft((current) => ({ ...current, translation: event.target.value }))
              }
              placeholder="Dependency Injection"
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
            Match case exactly
          </label>
          <button onClick={() => void handleSaveEntry()} type="button">
            Save Entry
          </button>
        </article>

        <div className="content-stack">
          <article className="card transfer-card">
            <div className="list-header">
              <h2>Import / Export</h2>
              <span>{entries.length} items</span>
            </div>

            <div className="transfer-actions">
              <button onClick={() => void handleExportFile()} type="button">
                Export JSON File
              </button>
              <button onClick={() => void handleCopyGlossary()} type="button">
                Copy JSON
              </button>
            </div>

            <label className="file-input">
              Import JSON File
              <input
                accept="application/json,.json"
                onChange={(event) => void handleImportFile(event.target.files?.[0])}
                type="file"
              />
            </label>

            <label>
              Paste glossary JSON
              <textarea
                onChange={(event) => setImportText(event.target.value)}
                placeholder='{"glossary":[...]}'
                rows={8}
                value={importText}
              />
            </label>

            <button onClick={() => void handleImportText()} type="button">
              Import Pasted JSON
            </button>

            <p className="transfer-message" role="status">
              {transferMessage}
            </p>
          </article>

          <article className="card list-card">
            <div className="list-header">
              <h2>Current Glossary</h2>
              <span>{entries.length} items</span>
            </div>

            <div className="entry-list">
              {entries.map((entry) => (
                <div className="entry-item" key={entry.id}>
                  <div>
                    <strong>{entry.source}</strong>
                    <p>{entry.translation}</p>
                  </div>
                  <button onClick={() => void handleDeleteEntry(entry.id)} type="button">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
