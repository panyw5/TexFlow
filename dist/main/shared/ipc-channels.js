"use strict";
// IPC channel definitions for type-safe communication between main and renderer
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPC_CHANNELS = void 0;
exports.IPC_CHANNELS = {
    // File operations
    FILE_OPEN: 'file:open',
    FILE_SAVE: 'file:save',
    FILE_SAVE_AS: 'file:save-as',
    FILE_NEW: 'file:new',
    // Window operations
    WINDOW_MINIMIZE: 'window:minimize',
    WINDOW_MAXIMIZE: 'window:maximize',
    WINDOW_CLOSE: 'window:close',
    WINDOW_TOGGLE_FULLSCREEN: 'window:toggle-fullscreen',
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
};
