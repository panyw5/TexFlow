// IPC channel definitions for type-safe communication between main and renderer

export const IPC_CHANNELS = {
  // File operations
  FILE_OPEN: 'file:open',
  FILE_SAVE: 'file:save',
  FILE_SAVE_AS: 'file:save-as',
  FILE_SAVE_BINARY: 'file:save-binary',
  FILE_EXPORT: 'file:export', // New export-specific channel
  FILE_NEW: 'file:new',
  
  // Window operations
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_TOGGLE_FULLSCREEN: 'window:toggle-fullscreen',
  WINDOW_TOGGLE_PIN: 'window:toggle-pin',
  
  // Application operations
  APP_GET_VERSION: 'app:get-version',
  APP_QUIT: 'app:quit',
  
  // Theme operations
  THEME_GET: 'theme:get',
  THEME_SET: 'theme:set',
  
  // LaTeX operations
  LATEX_VALIDATE: 'latex:validate',
  LATEX_RENDER: 'latex:render',
  
  // Clipboard operations
  CLIPBOARD_WRITE_TEXT: 'clipboard:write-text',
  CLIPBOARD_READ_TEXT: 'clipboard:read-text',
  
  // Config operations
  CONFIG_SAVE: 'config:save',
  CONFIG_LOAD: 'config:load',
} as const;

// Type definitions for IPC messages
export interface IpcMessage<T = any> {
  channel: string;
  data?: T;
}

export interface FileOpenResult {
  success: boolean;
  content?: string;
  filePath?: string;
  error?: string;
}

export interface FileSaveResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export interface LaTeXValidationResult {
  isValid: boolean;
  errors: Array<{
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

export interface LaTeXRenderResult {
  success: boolean;
  html?: string;
  error?: string;
}

export interface FileExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export interface FileExportData {
  filename: string;
  data: string; // Can be base64 for binary or plain text for text files
  format: 'svg' | 'png' | 'jpg' | 'pdf';
  encoding: 'utf8' | 'base64';
}
