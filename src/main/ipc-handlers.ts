import { ipcMain, dialog, clipboard, app } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import { application } from './main';
import { 
  IPC_CHANNELS, 
  FileOpenResult, 
  FileSaveResult 
} from '../shared/ipc-channels';

export function setupIpcHandlers(): void {
  // File operations
  ipcMain.handle(IPC_CHANNELS.FILE_OPEN, async (): Promise<FileOpenResult> => {
    try {
      const mainWindow = application.getMainWindow();
      if (!mainWindow) {
        return { success: false, error: 'No main window available' };
      }

      const result = await dialog.showOpenDialog(mainWindow, {
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
      const content = await fs.readFile(filePath, 'utf-8');

      return {
        success: true,
        content,
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.FILE_SAVE,
    async (_, content: string, filePath?: string): Promise<FileSaveResult> => {
      try {
        let targetPath = filePath;

        if (!targetPath) {
          const mainWindow = application.getMainWindow();
          if (!mainWindow) {
            return { success: false, error: 'No main window available' };
          }

          const result = await dialog.showSaveDialog(mainWindow, {
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

        await fs.writeFile(targetPath, content, 'utf-8');

        return {
          success: true,
          filePath: targetPath,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.FILE_SAVE_AS,
    async (_, content: string): Promise<FileSaveResult> => {
      try {
        const mainWindow = application.getMainWindow();
        if (!mainWindow) {
          return { success: false, error: 'No main window available' };
        }

        const result = await dialog.showSaveDialog(mainWindow, {
          filters: [
            { name: 'LaTeX Files', extensions: ['tex'] },
            { name: 'Text Files', extensions: ['txt'] },
          ],
          defaultPath: 'untitled.tex',
        });

        if (result.canceled || !result.filePath) {
          return { success: false, error: 'Save canceled' };
        }

        await fs.writeFile(result.filePath, content, 'utf-8');

        return {
          success: true,
          filePath: result.filePath,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.FILE_SAVE_BINARY,
    async (_, data: string, defaultName: string): Promise<FileSaveResult> => {
      try {
        const mainWindow = application.getMainWindow();
        if (!mainWindow) {
          return { success: false, error: 'No main window available' };
        }

        const result = await dialog.showSaveDialog(mainWindow, {
          defaultPath: defaultName,
          filters: [
            { name: 'All Files', extensions: ['*'] },
          ],
        });

        if (result.canceled || !result.filePath) {
          return { success: false, error: 'Save canceled' };
        }

        // Convert base64 to buffer and save
        const buffer = Buffer.from(data, 'base64');
        await fs.writeFile(result.filePath, buffer);

        return {
          success: true,
          filePath: result.filePath,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // Window operations
  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    const mainWindow = application.getMainWindow();
    mainWindow?.minimize();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    const mainWindow = application.getMainWindow();
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
    const mainWindow = application.getMainWindow();
    mainWindow?.close();
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_TOGGLE_PIN, () => {
    const mainWindow = application.getMainWindow();
    if (mainWindow) {
      const isAlwaysOnTop = mainWindow.isAlwaysOnTop();
      mainWindow.setAlwaysOnTop(!isAlwaysOnTop);
      return !isAlwaysOnTop;
    }
    return false;
  });

  // Application operations
  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, () => {
    return app.getVersion();
  });

  ipcMain.handle(IPC_CHANNELS.APP_QUIT, () => {
    app.quit();
  });

  // Clipboard operations
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, (_, text: string) => {
    clipboard.writeText(text);
  });

  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_READ_TEXT, () => {
    return clipboard.readText();
  });
}
