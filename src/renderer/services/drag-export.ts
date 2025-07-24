import { MathJaxExportService } from './export/MathJaxExportService';
import { UserConfigManager } from './user-config-manager';

export interface DragExportOptions {
  format: 'png' | 'svg' | 'jpg';
  scale?: number;
  backgroundColor?: string;
  quality?: number;
}

export class DragExportManager {
  private exportService: MathJaxExportService | null = null;
  private configManager: UserConfigManager;
  private isElectron: boolean;

  constructor() {
    console.log('=== DragExportManager 构造函数 ===');
    this.configManager = new UserConfigManager();
    this.isElectron = typeof window !== 'undefined' && !!window.electronAPI;
    console.log('isElectron:', this.isElectron);
    console.log('window.electronAPI:', typeof window?.electronAPI);
    console.log('=== 开始初始化 ===');
    this.initialize();
  }

  private async initialize() {
    // 只在 Electron 环境中初始化
    if (!this.isElectron) {
      console.warn('DragExportManager: Not running in Electron environment');
      return;
    }

    const config = await this.configManager.loadConfig();
    this.exportService = new MathJaxExportService(config);
    
    // 监听主进程的导出数据请求
    if (window.electronAPI?.onDragRequestExportData) {
      window.electronAPI.onDragRequestExportData(this.handleExportDataRequest.bind(this));
    }
  }

  private async handleExportDataRequest(request: any) {
    console.log('[DragExportManager] 收到导出数据请求:', request);
    
    if (!this.exportService) {
      console.error('[DragExportManager] Export service not initialized');
      return;
    }

    try {
      const { latex, format, options } = request;
      console.log('[DragExportManager] 开始生成', format, '格式的导出数据');
      
      let result;

      switch (format) {
        case 'svg':
          result = await this.exportService.exportSVG(latex, options);
          break;
        case 'png':
          result = await this.exportService.exportPNG(latex, options);
          break;
        case 'jpg':
          result = await this.exportService.exportJPG(latex, options);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      console.log('[DragExportManager] 导出结果:', result.success, result.data?.length || 0);

      if (result.success && result.data) {
        const exportData = {
          latex,
          format,
          data: typeof result.data === 'string' ? result.data : result.data.toString('base64'),
          encoding: format === 'svg' ? 'utf8' : 'base64'
        };

        console.log('[DragExportManager] 发送导出数据到主进程，大小:', exportData.data.length);

        // 发送导出数据到主进程
        if (window.electronAPI?.prepareDragExport) {
          const response = await window.electronAPI.prepareDragExport(exportData);
          console.log('[DragExportManager] 主进程响应:', response);
        } else {
          console.error('[DragExportManager] prepareDragExport API 不可用');
        }
      } else {
        console.error('[DragExportManager] 导出失败:', result);
      }
    } catch (error) {
      console.error('[DragExportManager] Failed to generate export data:', error);
    }
  }

  // 供外部调用的导出数据生成方法
  public async generateExportData(
    latex: string,
    format: 'png' | 'svg' | 'jpg',
    options: any = {}
  ): Promise<any> {
    console.log('[DragExportManager] generateExportData 被调用:', { latex: latex.substring(0, 30) + '...', format, options });
    
    if (!this.exportService) {
      console.error('[DragExportManager] Export service not initialized');
      return null;
    }

    try {
      const exportData = await this.handleExportDataRequest({ latex, format, options });
      return exportData;
    } catch (error) {
      console.error('[DragExportManager] generateExportData 失败:', error);
      return null;
    }
  }

  public async startDrag(latex: string, options: DragExportOptions): Promise<boolean> {
    console.log('[DragExportManager] startDrag 被调用:', { latex: latex.substring(0, 50) + '...', options });
    
    if (!this.isElectron) {
      console.error('[DragExportManager] 不在 Electron 环境中');
      return false;
    }
    
    if (!window.electronAPI?.startDrag) {
      console.error('[DragExportManager] startDrag API 不可用');
      return false;
    }

    try {
      console.log('[DragExportManager] 调用 electronAPI.startDrag...');
      const result = await window.electronAPI.startDrag(latex, options.format, options);
      console.log('[DragExportManager] startDrag 结果:', result);
      return result.success;
    } catch (error) {
      console.error('[DragExportManager] startDrag 失败:', error);
      return false;
    }
  }
}
