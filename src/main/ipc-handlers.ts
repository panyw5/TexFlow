import { ipcMain, dialog, clipboard, app, nativeImage, BrowserWindow } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { application } from './main';
import { FormatConverter } from './services/format-converter';
import { 
  IPC_CHANNELS, 
  FileOpenResult, 
  FileSaveResult,
  FileExportData,
  FileExportResult,
  DragStartData
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

  // File export handler
  ipcMain.handle(
    IPC_CHANNELS.FILE_EXPORT,
    async (event, data: FileExportData): Promise<FileExportResult> => {
      try {
        const { dialog } = await import('electron');
        const mainWindow = application.getMainWindow();
        
        if (!mainWindow) {
          return {
            success: false,
            error: 'No main window available',
          };
        }

        // Get file extension from filename
        const extension = data.filename.split('.').pop()?.toLowerCase() || '';
        
        // Define file filters based on extension
        const filters: { name: string; extensions: string[] }[] = [];
        switch (extension) {
          case 'svg':
            filters.push({ name: 'SVG Files', extensions: ['svg'] });
            break;
          case 'png':
            filters.push({ name: 'PNG Images', extensions: ['png'] });
            break;
          case 'jpg':
          case 'jpeg':
            filters.push({ name: 'JPEG Images', extensions: ['jpg', 'jpeg'] });
            break;
          case 'pdf':
            filters.push({ name: 'PDF Files', extensions: ['pdf'] });
            break;
          default:
            filters.push({ name: 'All Files', extensions: ['*'] });
        }

        const result = await dialog.showSaveDialog(mainWindow, {
          defaultPath: data.filename,
          filters,
        });

        if (result.canceled || !result.filePath) {
          return {
            success: false,
            error: 'Save dialog was canceled',
          };
        }

        // Write file based on data type
        const fs = await import('fs/promises');
        
        if (data.encoding === 'base64') {
          // Decode base64 and write as binary
          const buffer = Buffer.from(data.data, 'base64');
          await fs.writeFile(result.filePath, buffer);
        } else {
          // Write as text (for SVG)
          await fs.writeFile(result.filePath, data.data, 'utf8');
        }

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

  // Config operations
  ipcMain.handle(IPC_CHANNELS.CONFIG_SAVE, async (_, config: any) => {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const os = require('os');
      
      // Save config to user data directory
      const configDir = path.join(os.homedir(), '.texflow');
      const configPath = path.join(configDir, 'config.json');
      
      // Ensure directory exists
      await fs.mkdir(configDir, { recursive: true });
      
      // Save config
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save config:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CONFIG_LOAD, async () => {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const os = require('os');
      
      const configPath = path.join(os.homedir(), '.texflow', 'config.json');
      
      // Check if config file exists
      try {
        await fs.access(configPath);
      } catch {
        // Return default config if file doesn't exist
        return { success: true, config: null };
      }
      
      // Load config
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      return { success: true, config };
    } catch (error) {
      console.error('Failed to load config:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Drag and drop handler
  ipcMain.on(IPC_CHANNELS.DRAG_START, async (event, dragData: DragStartData) => {
    try {
      // 为缺失的字段提供默认值，兼容 DragDropTest 组件的简单格式
      const encoding = dragData.encoding || 'utf8';
      const renderType = dragData.renderType || 'source';
      
      console.log('Drag start request received:', { 
        filename: dragData.filename, 
        filetype: dragData.filetype, 
        encoding: encoding,
        renderType: renderType,
        contentLength: dragData.content.length 
      });
      
      // Create a temporary file for dragging
      const tempDir = path.join(app.getPath('temp'), 'texflow-drag');
      await fs.mkdir(tempDir, { recursive: true });
      
      const tempFilePath = path.join(tempDir, dragData.filename);
      
      // Handle different encodings properly with async operations
      const writeFilePromise = (async () => {
        if (encoding === 'base64') {
          // Decode base64 data and write as binary
          console.log('Writing base64 data as binary file');
          const buffer = Buffer.from(dragData.content, 'base64');
          await fs.writeFile(tempFilePath, buffer);
        } else {
          // Write as text file
          console.log('Writing text data as UTF-8 file');
          await fs.writeFile(tempFilePath, dragData.content, 'utf8');
        }
      })();
      
      // 设置超时防止文件写入卡死
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('File write timeout after 3 seconds')), 3000);
      });
      
      await Promise.race([writeFilePromise, timeoutPromise]);
      
      console.log(`Temporary file created: ${tempFilePath}`);
      
      // 参考测试项目：使用字符串路径而不是 nativeImage 对象
      const iconPath = path.join(__dirname, '../../img/logo.png');
      
      // Start the drag operation - 使用与测试项目相同的简单参数格式
      event.sender.startDrag({
        file: tempFilePath,
        icon: iconPath  // 使用字符串路径，如测试项目
      });
      
      console.log('Drag operation started for file:', tempFilePath);
    } catch (error) {
      console.error('Failed to start drag operation:', error);
      // 即使失败也不阻塞UI
    }
  });
}
