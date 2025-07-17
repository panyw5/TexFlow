"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIpcHandlers = setupIpcHandlers;
const electron_1 = require("electron");
const fs_1 = require("fs");
const main_1 = require("./main");
const ipc_channels_1 = require("../shared/ipc-channels");
function setupIpcHandlers() {
    // File operations
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.FILE_OPEN, async () => {
        try {
            const mainWindow = main_1.application.getMainWindow();
            if (!mainWindow) {
                return { success: false, error: 'No main window available' };
            }
            const result = await electron_1.dialog.showOpenDialog(mainWindow, {
                properties: ['openFile'],
                filters: [
                    { name: 'LaTeX Files', extensions: ['tex', 'latex'] },
                    { name: 'Text Files', extensions: ['txt'] },
                    { name: 'All Files', extensions: ['*'] },
                ],
            });
            if (result.canceled || result.filePaths.length === 0) {
                return { success: false, error: 'File selection canceled' };
            }
            const filePath = result.filePaths[0];
            const content = await fs_1.promises.readFile(filePath, 'utf-8');
            return {
                success: true,
                content,
                filePath,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    });
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.FILE_SAVE, async (_, content, filePath) => {
        try {
            let targetPath = filePath;
            if (!targetPath) {
                const mainWindow = main_1.application.getMainWindow();
                if (!mainWindow) {
                    return { success: false, error: 'No main window available' };
                }
                const result = await electron_1.dialog.showSaveDialog(mainWindow, {
                    filters: [
                        { name: 'LaTeX Files', extensions: ['tex'] },
                        { name: 'Text Files', extensions: ['txt'] },
                    ],
                    defaultPath: 'untitled.tex',
                });
                if (result.canceled || !result.filePath) {
                    return { success: false, error: 'Save canceled' };
                }
                targetPath = result.filePath;
            }
            await fs_1.promises.writeFile(targetPath, content, 'utf-8');
            return {
                success: true,
                filePath: targetPath,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    });
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.FILE_SAVE_AS, async (_, content) => {
        try {
            const mainWindow = main_1.application.getMainWindow();
            if (!mainWindow) {
                return { success: false, error: 'No main window available' };
            }
            const result = await electron_1.dialog.showSaveDialog(mainWindow, {
                filters: [
                    { name: 'LaTeX Files', extensions: ['tex'] },
                    { name: 'Text Files', extensions: ['txt'] },
                ],
                defaultPath: 'untitled.tex',
            });
            if (result.canceled || !result.filePath) {
                return { success: false, error: 'Save canceled' };
            }
            await fs_1.promises.writeFile(result.filePath, content, 'utf-8');
            return {
                success: true,
                filePath: result.filePath,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    });
    // Window operations
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.WINDOW_MINIMIZE, () => {
        const mainWindow = main_1.application.getMainWindow();
        mainWindow?.minimize();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
        const mainWindow = main_1.application.getMainWindow();
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        }
        else {
            mainWindow?.maximize();
        }
    });
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.WINDOW_CLOSE, () => {
        const mainWindow = main_1.application.getMainWindow();
        mainWindow?.close();
    });
    // Application operations
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.APP_GET_VERSION, () => {
        return electron_1.app.getVersion();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.APP_QUIT, () => {
        electron_1.app.quit();
    });
    // Clipboard operations
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, (_, text) => {
        electron_1.clipboard.writeText(text);
    });
    electron_1.ipcMain.handle(ipc_channels_1.IPC_CHANNELS.CLIPBOARD_READ_TEXT, () => {
        return electron_1.clipboard.readText();
    });
}
