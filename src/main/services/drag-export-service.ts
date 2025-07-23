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
    // 拖拽开始处理器
    ipcMain.handle(IPC_CHANNELS.DRAG_START, this.handleDragStart.bind(this));
    
    // 准备拖拽文件 - 这个用于直接的 invoke/handle 通信
    ipcMain.handle(IPC_CHANNELS.DRAG_EXPORT_PREPARE, this.handleDragExportPrepare.bind(this));
    
    // 清理临时文件
    ipcMain.handle(IPC_CHANNELS.DRAG_CLEANUP, this.handleDragCleanup.bind(this));
    
    // 保存到桌面
    ipcMain.handle(IPC_CHANNELS.SAVE_TO_DESKTOP, this.handleSaveToDesktop.bind(this));
  }

  private async handleDragStart(
    event: Electron.IpcMainInvokeEvent,
    latex: string,
    format: string,
    options: any
  ): Promise<DragStartResponse> {
    try {
      // 构建 request 对象
      const request: DragStartRequest = {
        latex,
        format: format as 'png' | 'svg' | 'jpg',
        options: options || {}
      };
      
      console.log('[DragExportService] 开始拖拽流程:', request);
      
      const mainWindow = require('../main').application.getMainWindow();
      if (!mainWindow) {
        console.error('[DragExportService] 没有主窗口可用');
        return { success: false, error: 'No main window available' };
      }

      // 生成临时文件名
      const timestamp = Date.now();
      const fileName = `formula-${timestamp}.${request.format}`;
      const filePath = path.join(this.tempDir, fileName);

      console.log('[DragExportService] 请求导出数据...');
      
      // 通知渲染进程生成导出数据，并等待响应
      event.sender.send('drag:request-export-data', request);
      
      // 等待导出数据 - 使用 Promise 等待
      const exportData = await this.waitForExportData();
      
      if (!exportData) {
        console.error('[DragExportService] 导出数据生成失败');
        return { success: false, error: 'Failed to generate export data' };
      }

      console.log('[DragExportService] 获得导出数据，大小:', exportData.data.length);

      // 写入临时文件
      await this.writeTempFile(filePath, exportData);
      console.log('[DragExportService] 临时文件创建成功:', filePath);
      
      // 记录活动文件
      this.activeDragFiles.add(filePath);

      // 启动拖拽 - 使用生成的文件作为图标
      console.log('[DragExportService] 启动原生拖拽');
      
      // 设置拖拽完成的监听
      const dragEndHandler = () => {
        console.log('[DragExportService] 拖拽操作完成');
        // 延迟检查文件是否还存在
        setTimeout(async () => {
          try {
            await fs.access(filePath);
            console.log('[DragExportService] 文件仍存在，拖拽可能取消了');
          } catch {
            console.log('[DragExportService] 文件已被移动，拖拽成功！');
          }
        }, 1000);
      };

      // 监听窗口的拖拽结束事件
      mainWindow.once('closed', dragEndHandler);
      mainWindow.webContents.once('did-finish-load', dragEndHandler);
      
      try {
        // 使用生成的PNG文件作为图标
        mainWindow.webContents.startDrag({
          file: filePath,
          icon: filePath,  // 使用文件本身作为图标
        });
        console.log('[DragExportService] 拖拽启动成功');
        
        // 设置超时检查
        setTimeout(dragEndHandler, 5000);
        
      } catch (error) {
        console.log('[DragExportService] 拖拽启动失败:', error);
        throw error;
      }

      console.log('[DragExportService] 拖拽启动成功');
      return { success: true, filePath };
    } catch (error) {
      console.error('[DragExportService] 拖拽失败:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async waitForExportData(): Promise<DragExportData | null> {
    return new Promise((resolve, reject) => {
      this.exportDataPromise = { resolve, reject };
      
      // 设置超时
      setTimeout(() => {
        if (this.exportDataPromise) {
          this.exportDataPromise.resolve(null);
          this.exportDataPromise = null;
        }
      }, 10000);
    });
  }

  private async handleDragExportPrepare(
    _: Electron.IpcMainInvokeEvent,
    data: DragExportData
  ) {
    console.log('[DragExportService] 收到导出数据:', data?.data?.length || 0, 'bytes');
    
    // 解决等待的 Promise
    if (this.exportDataPromise) {
      this.exportDataPromise.resolve(data);
      this.exportDataPromise = null;
    }
    
    return { success: true };
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
