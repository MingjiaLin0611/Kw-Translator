import type { ExtensionSettings, StorageShape } from "./types";

export const DEFAULT_SETTINGS: ExtensionSettings = {
  extensionEnabled: true,
  annotateOnLoad: true,
  themeMode: "light",
  annotationMode: "inline-brackets",
  excludedTags: ["CODE", "PRE", "SCRIPT", "STYLE", "TEXTAREA", "INPUT"]
};

export const DEFAULT_STORAGE: StorageShape = {
  glossary: [
    {
      id: "sample-memoization",
      source: "memoization",
      translation: "记忆化",
      enabled: true,
      caseSensitive: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: "sample-dependency-injection",
      source: "dependency injection",
      translation: "依赖注入",
      enabled: true,
      caseSensitive: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  domainRules: [],
  settings: DEFAULT_SETTINGS
};
