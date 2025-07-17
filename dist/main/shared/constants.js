"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHORTCUTS = exports.LATEX_MATH_DELIMITERS = exports.DEFAULT_FILE_EXTENSION = exports.SUPPORTED_FILE_EXTENSIONS = exports.MAX_PREVIEW_WIDTH = exports.PREVIEW_UPDATE_DELAY = exports.LATEX_LANGUAGE_ID = exports.DEFAULT_THEME = exports.DEFAULT_FONT_SIZE = exports.MIN_WINDOW_HEIGHT = exports.MIN_WINDOW_WIDTH = exports.DEFAULT_WINDOW_HEIGHT = exports.DEFAULT_WINDOW_WIDTH = exports.APP_VERSION = exports.APP_NAME = exports.isDev = void 0;
// Environment detection
exports.isDev = process.env.NODE_ENV === 'development';
// Application constants
exports.APP_NAME = 'InsTex';
exports.APP_VERSION = '1.0.0';
// Window constants
exports.DEFAULT_WINDOW_WIDTH = 1200;
exports.DEFAULT_WINDOW_HEIGHT = 800;
exports.MIN_WINDOW_WIDTH = 800;
exports.MIN_WINDOW_HEIGHT = 600;
// Editor constants
exports.DEFAULT_FONT_SIZE = 14;
exports.DEFAULT_THEME = 'vs-dark';
exports.LATEX_LANGUAGE_ID = 'latex';
// Preview constants
exports.PREVIEW_UPDATE_DELAY = 300; // ms
exports.MAX_PREVIEW_WIDTH = 800;
// File constants
exports.SUPPORTED_FILE_EXTENSIONS = ['.tex', '.latex'];
exports.DEFAULT_FILE_EXTENSION = '.tex';
// LaTeX constants
exports.LATEX_MATH_DELIMITERS = {
    INLINE: '$',
    DISPLAY: '$$',
    BLOCK_START: '\\[',
    BLOCK_END: '\\]',
};
// Keyboard shortcuts
exports.SHORTCUTS = {
    COPY_LATEX: 'CmdOrCtrl+Shift+C',
    TOGGLE_PREVIEW: 'CmdOrCtrl+Shift+P',
    TOGGLE_THEME: 'CmdOrCtrl+Shift+T',
    NEW_FILE: 'CmdOrCtrl+N',
    OPEN_FILE: 'CmdOrCtrl+O',
    SAVE_FILE: 'CmdOrCtrl+S',
    SAVE_AS: 'CmdOrCtrl+Shift+S',
};
