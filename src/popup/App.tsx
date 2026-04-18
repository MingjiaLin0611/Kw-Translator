import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS } from "../shared/defaults";
import { updateSettings } from "../shared/storage";
import { applyTheme } from "../shared/theme";

export function App() {
  const [hostname, setHostname] = useState("loading...");
  const [isEnabled, setIsEnabled] = useState(true);
  const [glossaryCount, setGlossaryCount] = useState(0);
  const [themeMode, setThemeMode] = useState(DEFAULT_SETTINGS.themeMode);

  useEffect(() => {
    void chrome.runtime.sendMessage({ type: "kwt:get-popup-state" }, (response) => {
      setHostname(response.hostname);
      setIsEnabled(response.isEnabled);
      setGlossaryCount(response.glossaryCount);
      setThemeMode(response.themeMode);
      applyTheme(response.themeMode);
    });
  }, []);

  async function handleAnnotate() {
    await chrome.runtime.sendMessage({ type: "kwt:annotate-page" });
    window.close();
  }

  async function handleToggle(enabled: boolean) {
    const response = await chrome.runtime.sendMessage({
      type: "kwt:update-extension-enabled",
      enabled
    });

    setHostname(response.hostname);
    setIsEnabled(response.isEnabled);
    setGlossaryCount(response.glossaryCount);
    setThemeMode(response.themeMode);
  }

  async function handleThemeToggle(nextValue: boolean) {
    const nextThemeMode = nextValue ? "dark" : "light";

    await updateSettings({ themeMode: nextThemeMode });
    setThemeMode(nextThemeMode);
    applyTheme(nextThemeMode);
  }

  return (
    <main className="popup-shell">
      <section className="hero-card">
        <p className="eyebrow">keyword-translator</p>
        <h1>Focus On The Terms That Matter</h1>
        <p className="description">
          Current site: <strong>{hostname}</strong>. Matching terms are rendered inline as
          <code> keyword(translation)</code>.
        </p>
      </section>

      <section className="panel">
        <div className="row">
          <span>Extension</span>
          <label className="switch">
            <input
              checked={isEnabled}
              onChange={(event) => void handleToggle(event.target.checked)}
              type="checkbox"
            />
            <span>{isEnabled ? "Enabled" : "Disabled"}</span>
          </label>
        </div>

        <div className="row">
          <span>Theme</span>
          <label className="switch">
            <input
              aria-label="Enable dark theme in popup"
              checked={themeMode === "dark"}
              onChange={(event) => void handleThemeToggle(event.target.checked)}
              type="checkbox"
            />
            <span>{themeMode === "dark" ? "Dark" : "Light"}</span>
          </label>
        </div>

        <div className="row">
          <span>Glossary entries</span>
          <strong>{glossaryCount}</strong>
        </div>
      </section>

      <div className="actions">
        <button className="primary-button" onClick={() => void handleAnnotate()} type="button">
          Annotate This Page
        </button>
        <button
          className="secondary-button"
          onClick={() => chrome.runtime.openOptionsPage()}
          type="button"
        >
          Open Settings
        </button>
      </div>
    </main>
  );
}
