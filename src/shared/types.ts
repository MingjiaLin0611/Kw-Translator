export interface GlossaryEntry {
  id: string;
  source: string;
  translation: string;
  enabled: boolean;
  caseSensitive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DomainRule {
  id: string;
  pattern: string;
  mode: "allow" | "block";
  enabled: boolean;
}

export interface ExtensionSettings {
  extensionEnabled: boolean;
  annotateOnLoad: boolean;
  themeMode: "light" | "dark";
  annotationMode: "inline-brackets";
  excludedTags: string[];
}

export interface StorageShape {
  glossary: GlossaryEntry[];
  domainRules: DomainRule[];
  settings: ExtensionSettings;
}

export interface AnnotationRequest {
  type: "kwt:annotate-page";
}

export interface PopupBootstrapRequest {
  type: "kwt:get-popup-state";
}

export interface SettingsUpdateRequest {
  type: "kwt:update-extension-enabled";
  enabled: boolean;
}

export interface PopupState {
  hostname: string;
  isEnabled: boolean;
  glossaryCount: number;
  themeMode: ExtensionSettings["themeMode"];
}
