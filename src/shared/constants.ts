// Environment detection
export const isDev = process.env.NODE_ENV === 'development';

// Application constants
export const APP_NAME = 'TexFlow';
export const APP_VERSION = '1.0.0';

// Window constants
export const DEFAULT_WINDOW_WIDTH = 1200;
export const DEFAULT_WINDOW_HEIGHT = 800;
export const MIN_WINDOW_WIDTH = 800;
export const MIN_WINDOW_HEIGHT = 600;

// Editor constants
export const DEFAULT_FONT_SIZE = 14;
export const DEFAULT_THEME = 'vs-dark';
export const LATEX_LANGUAGE_ID = 'latex';

// Preview constants
export const PREVIEW_UPDATE_DELAY = 300; // ms
export const MAX_PREVIEW_WIDTH = 800;

// File constants
export const SUPPORTED_FILE_EXTENSIONS = ['.tex', '.latex'];
export const DEFAULT_FILE_EXTENSION = '.tex';

// LaTeX constants
export const LATEX_MATH_DELIMITERS = {
  INLINE: '$',
  DISPLAY: '$$',
  BLOCK_START: '\\[',
  BLOCK_END: '\\]',
};

// Keyboard shortcuts
export const SHORTCUTS = {
  COPY_LATEX: 'CmdOrCtrl+Shift+C',
  TOGGLE_PREVIEW: 'CmdOrCtrl+Shift+P',
  TOGGLE_THEME: 'CmdOrCtrl+Shift+T',
  NEW_FILE: 'CmdOrCtrl+N',
  OPEN_FILE: 'CmdOrCtrl+O',
  SAVE_FILE: 'CmdOrCtrl+S',
  SAVE_AS: 'CmdOrCtrl+Shift+S',
};
