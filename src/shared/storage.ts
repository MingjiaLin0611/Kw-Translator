import { DEFAULT_STORAGE } from "./defaults";
import type { ExtensionSettings, GlossaryEntry, StorageShape } from "./types";

const STORAGE_KEY = "kwt:data";

function getStorageArea() {
  return chrome.storage.sync ?? chrome.storage.local;
}

export async function getStorageData(): Promise<StorageShape> {
  const storageArea = getStorageArea();
  const result = await storageArea.get(STORAGE_KEY);
  const stored = result[STORAGE_KEY] as Partial<StorageShape> | undefined;

  return {
    glossary: stored?.glossary ?? DEFAULT_STORAGE.glossary,
    domainRules: stored?.domainRules ?? DEFAULT_STORAGE.domainRules,
    settings: {
      ...DEFAULT_STORAGE.settings,
      ...stored?.settings
    }
  };
}

export async function saveStorageData(nextData: StorageShape): Promise<void> {
  const storageArea = getStorageArea();
  await storageArea.set({
    [STORAGE_KEY]: nextData
  });
}

export async function updateSettings(nextSettings: Partial<ExtensionSettings>): Promise<StorageShape> {
  const current = await getStorageData();
  const updated: StorageShape = {
    ...current,
    settings: {
      ...current.settings,
      ...nextSettings
    }
  };

  await saveStorageData(updated);
  return updated;
}

export async function saveGlossary(glossary: GlossaryEntry[]): Promise<StorageShape> {
  const current = await getStorageData();
  const updated: StorageShape = {
    ...current,
    glossary
  };

  await saveStorageData(updated);
  return updated;
}

