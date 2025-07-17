"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMenu = createMenu;
const electron_1 = require("electron");
const main_1 = require("./main");
const constants_1 = require("../shared/constants");
function createMenu() {
    const isMac = process.platform === 'darwin';
    const template = [
        // App menu (macOS only)
        ...(isMac
            ? [
                {
                    label: electron_1.app.getName(),
                    submenu: [
                        { role: 'about' },
                        { type: 'separator' },
                        { role: 'services' },
                        { type: 'separator' },
                        { role: 'hide' },
                        { role: 'hideOthers' },
                        { role: 'unhide' },
                        { type: 'separator' },
                        { role: 'quit' },
                    ],
                },
            ]
            : []),
        // File menu
        {
            label: 'File',
            submenu: [
                {
                    label: 'New',
                    accelerator: constants_1.SHORTCUTS.NEW_FILE,
                    click: () => {
                        // Send IPC message to renderer
                        const mainWindow = main_1.application.getMainWindow();
                        mainWindow?.webContents.send('menu:new-file');
                    },
                },
                {
                    label: 'Open...',
                    accelerator: constants_1.SHORTCUTS.OPEN_FILE,
                    click: () => {
                        const mainWindow = main_1.application.getMainWindow();
                        mainWindow?.webContents.send('menu:open-file');
                    },
                },
                { type: 'separator' },
                {
                    label: 'Save',
                    accelerator: constants_1.SHORTCUTS.SAVE_FILE,
                    click: () => {
                        const mainWindow = main_1.application.getMainWindow();
                        mainWindow?.webContents.send('menu:save-file');
                    },
                },
                {
                    label: 'Save As...',
                    accelerator: constants_1.SHORTCUTS.SAVE_AS,
                    click: () => {
                        const mainWindow = main_1.application.getMainWindow();
                        mainWindow?.webContents.send('menu:save-as');
                    },
                },
                { type: 'separator' },
                ...(isMac ? [] : [{ role: 'quit' }]),
            ],
        },
        // Edit menu
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                    label: 'Copy LaTeX',
                    accelerator: constants_1.SHORTCUTS.COPY_LATEX,
                    click: () => {
                        const mainWindow = main_1.application.getMainWindow();
                        mainWindow?.webContents.send('menu:copy-latex');
                    },
                },
            ],
        },
        // View menu
        {
            label: 'View',
            submenu: [
                {
                    label: 'Toggle Preview',
                    accelerator: constants_1.SHORTCUTS.TOGGLE_PREVIEW,
                    click: () => {
                        const mainWindow = main_1.application.getMainWindow();
                        mainWindow?.webContents.send('menu:toggle-preview');
                    },
                },
                {
                    label: 'Toggle Theme',
                    accelerator: constants_1.SHORTCUTS.TOGGLE_THEME,
                    click: () => {
                        const mainWindow = main_1.application.getMainWindow();
                        mainWindow?.webContents.send('menu:toggle-theme');
                    },
                },
                { type: 'separator' },
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
            ],
        },
        // Window menu
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' },
                ...(isMac
                    ? [
                        { type: 'separator' },
                        { role: 'front' },
                        { type: 'separator' },
                        { role: 'window' },
                    ]
                    : []),
            ],
        },
        // Help menu
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        await electron_1.shell.openExternal('https://github.com/panyw5/instex');
                    },
                },
                {
                    label: 'LaTeX Documentation',
                    click: async () => {
                        await electron_1.shell.openExternal('https://www.latex-project.org/help/documentation/');
                    },
                },
                {
                    label: 'KaTeX Documentation',
                    click: async () => {
                        await electron_1.shell.openExternal('https://katex.org/docs/supported.html');
                    },
                },
            ],
        },
    ];
    return electron_1.Menu.buildFromTemplate(template);
}
