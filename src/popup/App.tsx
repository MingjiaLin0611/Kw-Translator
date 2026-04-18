import { useEffect, useState } from "react";
import { getStorageData } from "../shared/storage";

export function App() {
  const [hostname, setHostname] = useState("loading...");
  const [isEnabled, setIsEnabled] = useState(true);
  const [glossaryCount, setGlossaryCount] = useState(0);

  useEffect(() => {
    void chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tabUrl = tabs[0]?.url;
      const nextHostname = tabUrl ? new URL(tabUrl).hostname : "unknown";
      const storageData = await getStorageData();

      setHostname(nextHostname);
      setIsEnabled(storageData.settings.extensionEnabled);
      setGlossaryCount(storageData.glossary.length);
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

    setIsEnabled(response.isEnabled);
  }

  return (
    <main className="popup-shell">
      <section className="hero-card">
        <p className="eyebrow">keyword-translator</p>
        <h1>只注释你关心的术语</h1>
        <p className="description">
          当前站点是 <strong>{hostname}</strong>。词库命中后，会以内联形式显示
          <code> keyword(翻译)</code>。
        </p>
      </section>

      <section className="panel">
        <div className="row">
          <span>扩展开关</span>
          <label className="switch">
            <input
              checked={isEnabled}
              onChange={(event) => void handleToggle(event.target.checked)}
              type="checkbox"
            />
            <span>{isEnabled ? "开启" : "关闭"}</span>
          </label>
        </div>

        <div className="row">
          <span>词库条目</span>
          <strong>{glossaryCount}</strong>
        </div>
      </section>

      <div className="actions">
        <button className="primary-button" onClick={() => void handleAnnotate()} type="button">
          立即注释当前页面
        </button>
        <button
          className="secondary-button"
          onClick={() => chrome.runtime.openOptionsPage()}
          type="button"
        >
          打开设置页
        </button>
      </div>
    </main>
  );
}

