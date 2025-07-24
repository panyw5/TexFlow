import { ipcMain, app, nativeImage } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { IPC_CHANNELS } from '../../shared/ipc-channels';
import type { DragStartRequest, DragStartResponse, DragExportData } from '../../shared/ipc-channels';

export class DragExportService {
  private tempDir: string;
  private activeDragFiles = new Set<string>();
  private exportDataPromise: {
    resolve: (data: DragExportData | null) => void;
    reject: (error: Error) => void;
  } | null = null;
  private dragIconPath: string = '';

  constructor() {
    this.tempDir = path.join(app.getPath('temp'), 'texflow-drag');
    this.ensureTempDir();
    this.createDragIcon();
    this.setupIPC();
  }

  private async ensureTempDir() {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  private async createDragIcon() {
    // 直接使用生成的公式文件作为图标
    // 这样就不需要额外的图标文件了
    this.dragIconPath = '';  // 不预先创建图标
    console.log('[DragExportService] 将使用临时文件作为拖拽图标');
  }

  private setupIPC() {
    // 拖拽开始处理器 - 使用 on 而不是 handle (按照官方文档)
    ipcMain.on(IPC_CHANNELS.DRAG_START, this.handleDragStart.bind(this));
    
    // 预生成拖拽文件
    ipcMain.handle(IPC_CHANNELS.DRAG_EXPORT_PREPARE, this.handleDragExportPrepare.bind(this));
    
    // 清理临时文件
    ipcMain.handle(IPC_CHANNELS.DRAG_CLEANUP, this.handleDragCleanup.bind(this));
    
    // 保存到桌面
    ipcMain.handle(IPC_CHANNELS.SAVE_TO_DESKTOP, this.handleSaveToDesktop.bind(this));
  }

  private async handleDragStart(
    event: Electron.IpcMainEvent,  // 改为 IpcMainEvent
    ...args: any[]  // 临时使用 args 来调试参数
  ): Promise<void> {
    console.log('[DragExportService] handleDragStart 收到参数:', args);
    const filePath = args[0];  // 第一个参数应该是文件路径
    try {
      console.log('[DragExportService] 开始拖拽，文件路径:', filePath);
      
      const mainWindow = require('../main').application.getMainWindow();
      if (!mainWindow) {
        console.error('[DragExportService] 没有主窗口可用');
        return;
      }

      // 检查文件是否存在
      try {
        await fs.access(filePath);
        console.log('[DragExportService] 文件存在，开始拖拽');
      } catch (error) {
        console.error('[DragExportService] 文件不存在:', filePath);
        return;
      }

      // 记录活动文件
      this.activeDragFiles.add(filePath);

      // 启动拖拽 - 按照官方文档的简化方式
      try {
        mainWindow.webContents.startDrag({
          file: filePath,
          icon: this.dragIconPath || filePath,  // 使用拖拽图标或文件本身
        });
        console.log('[DragExportService] 拖拽启动成功');
        
      } catch (error) {
        console.error('[DragExportService] 拖拽启动失败:', error);
        this.activeDragFiles.delete(filePath);
      }

    } catch (error) {
      console.error('[DragExportService] 拖拽处理失败:', error);
    }
  }

  private async handleDragExportPrepare(
    _: Electron.IpcMainInvokeEvent,
    data: DragExportData
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      console.log('[DragExportService] 预生成文件，格式:', data.format);
      
      // 生成临时文件名
      const timestamp = Date.now();
      const fileName = `formula-${timestamp}.${data.format}`;
      const filePath = path.join(this.tempDir, fileName);
      
      // 写入临时文件
      await this.writeTempFile(filePath, data);
      console.log('[DragExportService] 文件预生成成功:', filePath);
      
      const result = { success: true, filePath };
      console.log('[DragExportService] 返回结果:', JSON.stringify(result));
      return result;
    } catch (error) {
      console.error('[DragExportService] 文件预生成失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async writeTempFile(filePath: string, exportData: DragExportData) {
    if (exportData.encoding === 'base64') {
      const buffer = Buffer.from(exportData.data, 'base64');
      await fs.writeFile(filePath, buffer);
    } else {
      await fs.writeFile(filePath, exportData.data, 'utf8');
    }
  }

  private getDragIcon(format: string): string {
    // 直接使用生成的公式文件作为拖拽图标
    // 这样既简单又有意义
    return '';  // 将在startDrag中使用临时文件本身
  }

  private async handleDragCleanup() {
    try {
      // 清理所有活动的拖拽文件
      for (const filePath of this.activeDragFiles) {
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.warn('Failed to cleanup drag file:', filePath, error);
        }
      }
      this.activeDragFiles.clear();
      return { success: true };
    } catch (error) {
      console.error('Drag cleanup failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async handleSaveToDesktop(
    _: Electron.IpcMainInvokeEvent,
    exportData: DragExportData,
    filename?: string
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      console.log('[DragExportService] 开始保存文件到桌面');
      
      // 生成文件名
      const timestamp = Date.now();
      const extension = exportData.format || 'png';
      const finalFilename = filename || `formula-${timestamp}.${extension}`;
      
      // 获取桌面路径
      const desktopPath = app.getPath('desktop');
      const filePath = path.join(desktopPath, finalFilename);
      
      console.log('[DragExportService] 目标路径:', filePath);
      
      // 写入文件
      await this.writeTempFile(filePath, exportData);
      
      console.log('[DragExportService] 文件保存成功到桌面:', filePath);
      return { success: true, filePath };
      
    } catch (error) {
      console.error('[DragExportService] 保存到桌面失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 应用退出时清理
  public async cleanup() {
    await this.handleDragCleanup();
    try {
      await fs.rmdir(this.tempDir);
    } catch (error) {
      // 忽略清理错误
    }
  }
}
