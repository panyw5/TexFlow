import { Menu, MenuItemConstructorOptions, app, shell } from 'electron';
import { application } from './main';
import { SHORTCUTS } from '../shared/constants';

export function createMenu(): Menu {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac
      ? [
          {
            label: app.getName(),
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
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
          accelerator: SHORTCUTS.NEW_FILE,
          click: () => {
            // Send IPC message to renderer
            const mainWindow = application.getMainWindow();
            mainWindow?.webContents.send('menu:new-file');
          },
        },
        {
          label: 'Open...',
          accelerator: SHORTCUTS.OPEN_FILE,
          click: () => {
            const mainWindow = application.getMainWindow();
            mainWindow?.webContents.send('menu:open-file');
          },
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: SHORTCUTS.SAVE_FILE,
          click: () => {
            const mainWindow = application.getMainWindow();
            mainWindow?.webContents.send('menu:save-file');
          },
        },
        {
          label: 'Save As...',
          accelerator: SHORTCUTS.SAVE_AS,
          click: () => {
            const mainWindow = application.getMainWindow();
            mainWindow?.webContents.send('menu:save-as');
          },
        },
        { type: 'separator' },
        ...(isMac ? [] : [{ role: 'quit' as const }]),
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
          accelerator: SHORTCUTS.COPY_LATEX,
          click: () => {
            const mainWindow = application.getMainWindow();
            mainWindow?.webContents.send('menu:copy-latex');
          },
        },
        { type: 'separator' },
        {
          label: 'Expand Selection to Next Bracket',
          accelerator: SHORTCUTS.EXPAND_SELECTION_TO_BRACKET,
          click: () => {
            const mainWindow = application.getMainWindow();
            mainWindow?.webContents.send('menu:expand-selection-to-bracket');
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
          accelerator: SHORTCUTS.TOGGLE_PREVIEW,
          click: () => {
            const mainWindow = application.getMainWindow();
            mainWindow?.webContents.send('menu:toggle-preview');
          },
        },
        {
          label: 'Toggle Theme',
          accelerator: SHORTCUTS.TOGGLE_THEME,
          click: () => {
            const mainWindow = application.getMainWindow();
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
              { type: 'separator' as const },
              { role: 'front' as const },
              { type: 'separator' as const },
              { role: 'window' as const },
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
            await shell.openExternal('https://github.com/panyw5/instex');
          },
        },
        {
          label: 'LaTeX Documentation',
          click: async () => {
            await shell.openExternal('https://www.latex-project.org/help/documentation/');
          },
        },
        {
          label: 'KaTeX Documentation',
          click: async () => {
            await shell.openExternal('https://katex.org/docs/supported.html');
          },
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
