import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import * as path from 'path';
import { isDev } from '../shared/constants';
import { createMenu } from './menu';
import { setupIpcHandlers } from './ipc-handlers';
import { DragExportService } from './services/drag-export-service';

class Application {
  private mainWindow: BrowserWindow | null = null;
  private dragExportService: DragExportService | null = null;

  constructor() {
    this.setupApp();
  }

  private setupApp(): void {
    // Handle app ready
    app.whenReady().then(() => {
      this.createWindow();
      this.setupMenu();
      setupIpcHandlers();
      
      // 初始化拖拽导出服务
      this.dragExportService = new DragExportService();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    // Handle window closed
    app.on('window-all-closed', () => {
      // 清理拖拽服务
      if (this.dragExportService) {
        this.dragExportService.cleanup();
      }
      
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Security: Prevent new window creation
    app.on('web-contents-created', (_, contents) => {
      contents.setWindowOpenHandler(({ url }) => {
        console.log('Blocked new window creation to:', url);
        return { action: 'deny' };
      });
    });
  }

  private createWindow(): void {
    const isDevEnv = isDev;
    const preloadPath = isDevEnv
      ? path.join(__dirname, '../preload/preload-standalone.js')
      : path.join(__dirname, '../preload/preload-standalone.js');
    
    console.log('[main] __dirname:', __dirname);
    console.log('[main] preload path:', preloadPath);
    console.log('[main] isDev:', isDevEnv);
    
    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: preloadPath,
        webSecurity: false, // Add this for development
      },
      show: false, // Don't show until ready
    });

    // Load the app
    if (isDev) {
      console.log('[main] Loading dev server at http://localhost:3000');
      this.mainWindow.loadURL('http://localhost:3000').catch(err => {
        console.error('[main] Failed to load dev server:', err);
        // Fallback to file protocol
        this.mainWindow?.loadFile(path.join(__dirname, '../renderer/index.html'));
      });
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupMenu(): void {
    const menu = createMenu();
    Menu.setApplicationMenu(menu);
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }
}

// Create app instance
const application = new Application();

// Export for use in other modules
export { application };
