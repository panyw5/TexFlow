// Application-wide type definitions

export interface AppSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  previewVisible: boolean;
  splitDirection: 'horizontal' | 'vertical';
  autoSave: boolean;
  autoSaveInterval: number; // in milliseconds
}

export interface FileInfo {
  path: string | null;
  name: string;
  isDirty: boolean;
  lastModified: Date | null;
}

export interface AppState {
  settings: AppSettings;
  currentFile: FileInfo;
  content: string;
  isLoading: boolean;
  errors: string[];
}

export interface MenuAction {
  type: 'new-file' | 'open-file' | 'save-file' | 'save-as' | 'copy-latex' | 'toggle-preview' | 'toggle-theme';
  payload?: any;
}
