import type { ExtensionSettings } from "./types";

export type ThemeMode = ExtensionSettings["themeMode"];

export function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
}
