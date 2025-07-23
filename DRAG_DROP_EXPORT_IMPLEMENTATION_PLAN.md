# TexFlow 预览面板拖拽导出功能实现计划

## 概述

实现预览面板的拖拽导出功能，允许用户将渲染的数学公式通过拖拽方式直接保存到文件系统中的任意位置。

## 技术调研总结

### Electron Native File Drag & Drop API

根据 [Electron 官方文档](https://www.electronjs.org/docs/latest/tutorial/native-file-drag-drop)，实现文件拖拽导出需要：

1. **webContents.startDrag(item)** - 主进程 API
2. **ondragstart 事件** - 渲染进程触发
3. **IPC 通信** - 渲染进程到主进程的消息传递
4. **临时文件创建** - 在拖拽时生成实际文件

### TexFlow 现有架构分析

- ✅ **导出服务完备**：MathJaxExportService 支持 SVG、PNG、JPG
- ✅ **预览组件**：Preview.tsx 已有完整的渲染逻辑
- ✅ **IPC 机制**：完整的主进程-渲染进程通信
- ✅ **文件操作**：已有文件保存和导出功能

## 实现方案

### 架构设计

```
┌─────────────────┐    IPC     ┌──────────────────┐
│   Renderer      │  ◄────►   │   Main Process   │
│                 │           │                  │
│ ┌─────────────┐ │           │ ┌──────────────┐ │
│ │ Preview     │ │   drag    │ │ Drag Handler │ │
│ │ Component   │ │  event    │ │              │ │
│ │             │ │ ────────► │ │ startDrag()  │ │
│ │ [draggable] │ │           │ │              │ │
│ └─────────────┘ │           │ └──────────────┘ │
│                 │           │                  │
│ ┌─────────────┐ │           │ ┌──────────────┐ │
│ │ Export      │ │  export   │ │ Temp File    │ │
│ │ Service     │ │  data     │ │ Manager      │ │
│ │             │ │ ────────► │ │              │ │
│ └─────────────┘ │           │ └──────────────┘ │
└─────────────────┘           └──────────────────┘
                                       │
                                       ▼
                               ┌──────────────┐
                               │ File System  │
                               │              │
                               │ temp/        │
                               │ ├─formula.png│
                               │ ├─formula.svg│
                               │ └─...        │
                               └──────────────┘
```

### 用户体验流程

1. **开始拖拽**：用户在预览面板上按住鼠标开始拖拽
2. **格式选择**：自动使用默认格式（PNG），或通过修饰键选择格式
3. **临时生成**：后台生成对应格式的临时文件
4. **拖拽指示**：显示拖拽光标和文件图标
5. **投放保存**：用户在目标位置松开鼠标，文件自动保存

## 详细实现步骤

### Phase 1: IPC 通道扩展

#### 1.1 添加 IPC 通道定义

**文件**: `src/shared/ipc-channels.ts`

```typescript
export const IPC_CHANNELS = {
  // ... 现有通道
  
  // 拖拽导出相关
  DRAG_START: 'drag:start',
  DRAG_EXPORT_PREPARE: 'drag:export-prepare',
  DRAG_CLEANUP: 'drag:cleanup',
} as const;

// 拖拽相关类型定义
export interface DragStartRequest {
  latex: string;
  format: 'png' | 'svg' | 'jpg';
  options: {
    scale?: number;
    backgroundColor?: string;
    quality?: number;
  };
}

export interface DragStartResponse {
  success: boolean;
  filePath?: string;
  error?: string;
}

export interface DragExportData {
  latex: string;
  format: 'png' | 'svg' | 'jpg';
  data: string; // base64 或 SVG 字符串
  encoding: 'base64' | 'utf8';
}
```

#### 1.2 扩展预加载脚本

**文件**: `src/preload/preload-standalone.ts`

```typescript
// 在 electronAPI 对象中添加
contextBridge.exposeInMainWorld('electronAPI', {
  // ... 现有 API
  
  // 拖拽导出
  startDrag: (latex: string, format: string, options: any) => 
    ipcRenderer.invoke(IPC_CHANNELS.DRAG_START, { latex, format, options }),
  prepareDragExport: (exportData: DragExportData) => 
    ipcRenderer.invoke(IPC_CHANNELS.DRAG_EXPORT_PREPARE, exportData),
  cleanupDragFiles: () => 
    ipcRenderer.invoke(IPC_CHANNELS.DRAG_CLEANUP),
});
```

### Phase 2: 主进程拖拽处理器

#### 2.1 创建拖拽服务

**文件**: `src/main/services/drag-export-service.ts`

```typescript
import { ipcMain, app } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { IPC_CHANNELS, DragStartRequest, DragStartResponse, DragExportData } from '../../shared/ipc-channels';

export class DragExportService {
  private tempDir: string;
  private activeDragFiles: Set<string> = new Set();

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'texflow-drag-export');
    this.ensureTempDir();
    this.setupIpcHandlers();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  private setupIpcHandlers() {
    // 拖拽开始处理器
    ipcMain.handle(IPC_CHANNELS.DRAG_START, this.handleDragStart.bind(this));
    
    // 准备拖拽文件
    ipcMain.handle(IPC_CHANNELS.DRAG_EXPORT_PREPARE, this.handleDragExportPrepare.bind(this));
    
    // 清理临时文件
    ipcMain.handle(IPC_CHANNELS.DRAG_CLEANUP, this.handleDragCleanup.bind(this));
  }

  private async handleDragStart(
    event: Electron.IpcMainInvokeEvent,
    request: DragStartRequest
  ): Promise<DragStartResponse> {
    try {
      const mainWindow = require('../main').application.getMainWindow();
      if (!mainWindow) {
        return { success: false, error: 'No main window available' };
      }

      // 生成临时文件名
      const timestamp = Date.now();
      const fileName = `formula-${timestamp}.${request.format}`;
      const filePath = path.join(this.tempDir, fileName);

      // 通知渲染进程生成导出数据
      const exportData = await this.requestExportData(event.sender, request);
      
      if (!exportData) {
        return { success: false, error: 'Failed to generate export data' };
      }

      // 写入临时文件
      await this.writeTempFile(filePath, exportData);
      
      // 记录活动文件
      this.activeDragFiles.add(filePath);

      // 启动拖拽
      mainWindow.webContents.startDrag({
        file: filePath,
        icon: this.getDragIcon(request.format),
      });

      return { success: true, filePath };
    } catch (error) {
      console.error('Drag start failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async requestExportData(
    sender: Electron.WebContents, 
    request: DragStartRequest
  ): Promise<DragExportData | null> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 10000); // 10秒超时

      // 监听导出数据
      const handler = (_: any, data: DragExportData) => {
        clearTimeout(timeout);
        ipcMain.removeListener(IPC_CHANNELS.DRAG_EXPORT_PREPARE, handler);
        resolve(data);
      };

      ipcMain.once(IPC_CHANNELS.DRAG_EXPORT_PREPARE, handler);
      
      // 请求渲染进程生成导出数据
      sender.send('drag:request-export-data', request);
    });
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
    // 返回格式对应的图标路径
    const iconMap = {
      'png': path.join(__dirname, '../../assets/icons/png-icon.png'),
      'svg': path.join(__dirname, '../../assets/icons/svg-icon.png'),
      'jpg': path.join(__dirname, '../../assets/icons/jpg-icon.png'),
    };
    
    return iconMap[format as keyof typeof iconMap] || iconMap.png;
  }

  private async handleDragExportPrepare(
    _: Electron.IpcMainInvokeEvent,
    data: DragExportData
  ) {
    // 此处仅用于 IPC 通道，实际处理在 requestExportData 中
    return { success: true };
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
```

#### 2.2 在主进程中初始化拖拽服务

**文件**: `src/main/main.ts`

```typescript
import { DragExportService } from './services/drag-export-service';

class Application {
  private dragExportService: DragExportService | null = null;

  public async initialize(): Promise<void> {
    // ... 现有初始化代码
    
    // 初始化拖拽导出服务
    this.dragExportService = new DragExportService();
  }

  public async cleanup(): Promise<void> {
    // 清理拖拽服务
    if (this.dragExportService) {
      await this.dragExportService.cleanup();
    }
    
    // ... 其他清理代码
  }
}
```

### Phase 3: 渲染进程拖拽组件

#### 3.1 创建拖拽导出服务

**文件**: `src/renderer/services/drag-export.ts`

```typescript
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

  constructor() {
    this.configManager = new UserConfigManager();
    this.initialize();
  }

  private async initialize() {
    const config = await this.configManager.loadConfig();
    this.exportService = new MathJaxExportService(config);
    
    // 监听主进程的导出数据请求
    window.electronAPI?.onDragRequestExportData?.(this.handleExportDataRequest.bind(this));
  }

  private async handleExportDataRequest(request: any) {
    if (!this.exportService) {
      console.error('Export service not initialized');
      return;
    }

    try {
      const { latex, format, options } = request;
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

      if (result.success && result.data) {
        const exportData = {
          latex,
          format,
          data: typeof result.data === 'string' ? result.data : result.data.toString('base64'),
          encoding: format === 'svg' ? 'utf8' : 'base64'
        };

        // 发送导出数据到主进程
        await window.electronAPI.prepareDragExport(exportData);
      }
    } catch (error) {
      console.error('Failed to generate export data:', error);
    }
  }

  public async startDrag(latex: string, options: DragExportOptions): Promise<boolean> {
    if (!window.electronAPI?.startDrag) {
      console.error('Drag API not available');
      return false;
    }

    try {
      const result = await window.electronAPI.startDrag(latex, options.format, options);
      return result.success;
    } catch (error) {
      console.error('Failed to start drag:', error);
      return false;
    }
  }
}
```

#### 3.2 创建可拖拽的预览组件

**文件**: `src/renderer/components/Preview/DraggablePreview.tsx`

```tsx
import React, { useState, useRef, useCallback } from 'react';
import { DragExportManager } from '../../services/drag-export';

interface DraggablePreviewProps {
  latex: string;
  renderedHtml: string;
  children: React.ReactNode;
  defaultDragFormat?: 'png' | 'svg' | 'jpg';
}

export const DraggablePreview: React.FC<DraggablePreviewProps> = ({
  latex,
  renderedHtml,
  children,
  defaultDragFormat = 'png'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragFormat, setDragFormat] = useState(defaultDragFormat);
  const dragManagerRef = useRef<DragExportManager | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // 初始化拖拽管理器
  React.useEffect(() => {
    dragManagerRef.current = new DragExportManager();
  }, []);

  // 处理拖拽开始
  const handleDragStart = useCallback(async (e: React.DragEvent) => {
    if (!latex.trim() || !dragManagerRef.current) {
      e.preventDefault();
      return;
    }

    setIsDragging(true);
    
    // 检测修饰键来选择格式
    let format = dragFormat;
    if (e.shiftKey) format = 'svg';
    else if (e.altKey) format = 'jpg';
    else if (e.ctrlKey || e.metaKey) format = 'png';

    // 设置拖拽效果
    e.dataTransfer.effectAllowed = 'copy';
    
    // 创建拖拽预览图像
    const dragImage = await createDragPreviewImage(renderedHtml, format);
    if (dragImage) {
      e.dataTransfer.setDragImage(dragImage, 50, 50);
    }

    // 启动 Electron 原生拖拽
    const options = {
      format,
      scale: 4,
      backgroundColor: format === 'jpg' ? '#ffffff' : 'transparent',
      quality: format === 'jpg' ? 0.95 : undefined
    };

    try {
      await dragManagerRef.current.startDrag(latex, options);
    } catch (error) {
      console.error('Failed to start native drag:', error);
      e.preventDefault();
    }
  }, [latex, renderedHtml, dragFormat]);

  // 处理拖拽结束
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    
    // 清理临时文件
    window.electronAPI?.cleanupDragFiles?.();
  }, []);

  // 创建拖拽预览图像
  const createDragPreviewImage = async (html: string, format: string): Promise<HTMLImageElement | null> => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // 创建临时元素来测量尺寸
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.fontSize = '24px';
      document.body.appendChild(tempDiv);

      const rect = tempDiv.getBoundingClientRect();
      canvas.width = Math.max(rect.width + 40, 100);
      canvas.height = Math.max(rect.height + 40, 50);

      // 绘制背景
      ctx.fillStyle = format === 'jpg' ? '#ffffff' : 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制边框
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

      // 绘制格式标识
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.fillText(format.toUpperCase(), 10, canvas.height - 10);

      document.body.removeChild(tempDiv);

      // 转换为图像
      const img = new Image();
      img.src = canvas.toDataURL();
      return img;
    } catch (error) {
      console.error('Failed to create drag preview:', error);
      return null;
    }
  };

  // 键盘快捷键处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key >= '1' && e.key <= '3') {
      const formats: ('png' | 'svg' | 'jpg')[] = ['png', 'svg', 'jpg'];
      setDragFormat(formats[parseInt(e.key) - 1]);
      e.preventDefault();
    }
  }, []);

  return (
    <div
      ref={previewRef}
      draggable={latex.trim().length > 0}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        cursor: latex.trim() ? 'grab' : 'default',
        outline: 'none',
        position: 'relative',
        ...(isDragging && { cursor: 'grabbing', opacity: 0.8 })
      }}
      title={
        latex.trim() 
          ? `拖拽导出 ${dragFormat.toUpperCase()} (Shift=SVG, Alt=JPG, Ctrl/Cmd=PNG)` 
          : '输入 LaTeX 公式后可拖拽导出'
      }
    >
      {children}
      
      {/* 拖拽格式指示器 */}
      {latex.trim() && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            opacity: isDragging ? 1 : 0.6,
            transition: 'opacity 0.2s ease'
          }}
        >
          {dragFormat.toUpperCase()}
        </div>
      )}
      
      {/* 拖拽提示 */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          拖拽到目标位置保存 {dragFormat.toUpperCase()} 文件
        </div>
      )}
    </div>
  );
};
```

#### 3.3 修改预览组件集成拖拽功能

**文件**: `src/renderer/components/Preview/Preview.tsx`

在现有的 Preview.tsx 文件中集成拖拽功能：

```tsx
// 在导入部分添加
import { DraggablePreview } from './DraggablePreview';

// 在 return 语句中，将现有的预览内容包装在 DraggablePreview 中
return (
  <div
    className="preview-panel"
    style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
  >
    <DraggablePreview
      latex={latex}
      renderedHtml={renderedHtml}
      defaultDragFormat="png"
    >
      <div
        className="preview-content"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          fontSize: '2em',
          flex: 1,
          overflow: 'auto',
          paddingTop: '2em',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            width: '100%',
            fontSize: 'inherit',
            lineHeight: '1.2',
            textAlign: 'center'
          }}
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    </DraggablePreview>
    
    {error && <div className="preview-error">{error}</div>}
    
    {/* 其余现有组件保持不变 */}
    {/* ... */}
  </div>
);
```

### Phase 4: 用户界面增强

#### 4.1 拖拽格式选择器

**文件**: `src/renderer/components/Preview/DragFormatSelector.tsx`

```tsx
import React from 'react';

interface DragFormatSelectorProps {
  currentFormat: 'png' | 'svg' | 'jpg';
  onFormatChange: (format: 'png' | 'svg' | 'jpg') => void;
  disabled?: boolean;
}

export const DragFormatSelector: React.FC<DragFormatSelectorProps> = ({
  currentFormat,
  onFormatChange,
  disabled = false
}) => {
  const formats = [
    { value: 'png', label: 'PNG', description: '高质量位图，支持透明度' },
    { value: 'svg', label: 'SVG', description: '矢量图形，无限缩放' },
    { value: 'jpg', label: 'JPG', description: '压缩位图，文件较小' }
  ] as const;

  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        padding: '4px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {formats.map((format, index) => (
        <button
          key={format.value}
          onClick={() => onFormatChange(format.value)}
          disabled={disabled}
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '4px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: currentFormat === format.value 
              ? 'rgba(255, 255, 255, 0.3)' 
              : 'transparent',
            color: currentFormat === format.value ? '#fff' : '#ccc',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.5 : 1
          }}
          title={`${format.description} (快捷键: ${index + 1})`}
          onMouseEnter={(e) => {
            if (!disabled && currentFormat !== format.value) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && currentFormat !== format.value) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {format.label}
        </button>
      ))}
    </div>
  );
};
```

#### 4.2 拖拽状态指示器

**文件**: `src/renderer/components/Preview/DragStatusIndicator.tsx`

```tsx
import React from 'react';

interface DragStatusIndicatorProps {
  isActive: boolean;
  format: string;
  canDrag: boolean;
}

export const DragStatusIndicator: React.FC<DragStatusIndicatorProps> = ({
  isActive,
  format,
  canDrag
}) => {
  if (!canDrag) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '60px',
        right: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: isActive 
          ? 'rgba(74, 124, 89, 0.9)' 
          : 'rgba(0, 0, 0, 0.7)',
        border: `1px solid ${isActive ? '#4a7c59' : 'rgba(255, 255, 255, 0.1)'}`,
        borderRadius: '20px',
        color: 'white',
        fontSize: '11px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        opacity: isActive ? 1 : 0.8,
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
        zIndex: 100
      }}
    >
      {/* 拖拽图标 */}
      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      
      <span>拖拽导出 {format.toUpperCase()}</span>
      
      {isActive && (
        <div
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#51cf66',
            borderRadius: '50%',
            animation: 'pulse 1.5s infinite'
          }}
        />
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};
```

### Phase 5: 配置和优化

#### 5.1 用户配置选项

**文件**: `src/renderer/services/user-config-manager.ts`

在现有的配置管理器中添加拖拽相关设置：

```typescript
// 在 UserConfig 接口中添加
interface UserConfig {
  // ... 现有配置
  
  // 拖拽导出配置
  dragExport: {
    defaultFormat: 'png' | 'svg' | 'jpg';
    defaultScale: number;
    enableDragIndicator: boolean;
    autoCleanupTempFiles: boolean;
    maxTempFileAge: number; // 小时
  };
}

// 默认配置
const DEFAULT_CONFIG: UserConfig = {
  // ... 现有默认值
  
  dragExport: {
    defaultFormat: 'png',
    defaultScale: 4,
    enableDragIndicator: true,
    autoCleanupTempFiles: true,
    maxTempFileAge: 24
  }
};
```

#### 5.2 性能优化

**文件**: `src/renderer/hooks/useDragExportOptimization.ts`

```typescript
import { useCallback, useRef, useMemo } from 'react';
import { debounce } from 'lodash';

export const useDragExportOptimization = (latex: string) => {
  const cacheRef = useRef(new Map<string, any>());
  const lastExportRef = useRef<{ latex: string; timestamp: number } | null>(null);

  // 防抖的导出准备
  const debouncedPrepareExport = useCallback(
    debounce(async (latex: string, format: string, options: any) => {
      const cacheKey = `${latex}-${format}-${JSON.stringify(options)}`;
      
      if (cacheRef.current.has(cacheKey)) {
        return cacheRef.current.get(cacheKey);
      }

      // 预生成导出数据
      // 这里可以调用导出服务提前准备数据
      
    }, 300),
    []
  );

  // 检查是否需要重新导出
  const shouldReexport = useCallback((latex: string) => {
    if (!lastExportRef.current) return true;
    
    const timeDiff = Date.now() - lastExportRef.current.timestamp;
    const latexChanged = lastExportRef.current.latex !== latex;
    
    return latexChanged || timeDiff > 30000; // 30秒缓存
  }, []);

  // 清理缓存
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    lastExportRef.current = null;
  }, []);

  return {
    debouncedPrepareExport,
    shouldReexport,
    clearCache
  };
};
```

## 用户体验设计

### 视觉反馈

1. **拖拽指示器**：显示当前拖拽格式和状态
2. **格式选择器**：快速切换导出格式
3. **拖拽预览**：显示拖拽时的文件图标
4. **进度指示**：拖拽准备过程的进度反馈

### 交互设计

1. **主要操作**：直接拖拽预览区域开始导出
2. **格式选择**：
   - 默认：PNG 格式
   - Shift + 拖拽：SVG 格式
   - Alt + 拖拽：JPG 格式
   - Ctrl/Cmd + 拖拽：PNG 格式
   - 数字键 1-3：切换格式
3. **状态反馈**：
   - 可拖拽时显示抓手光标
   - 拖拽中显示抓取光标和半透明效果
   - 格式指示器显示当前选择

### 快捷键

- `1`: 切换到 PNG 格式
- `2`: 切换到 SVG 格式  
- `3`: 切换到 JPG 格式
- `Shift + 拖拽`: 强制 SVG 格式
- `Alt + 拖拽`: 强制 JPG 格式
- `Ctrl/Cmd + 拖拽`: 强制 PNG 格式

## 测试策略

### 单元测试

1. **拖拽服务测试**：验证导出数据生成
2. **IPC 通信测试**：测试主进程与渲染进程交互
3. **临时文件管理测试**：验证文件创建和清理

### 集成测试

1. **端到端拖拽测试**：模拟完整的拖拽导出流程
2. **格式兼容性测试**：验证各种导出格式
3. **性能测试**：测试大型公式的拖拽性能

### 用户测试

1. **可用性测试**：验证拖拽操作的直观性
2. **跨平台测试**：在 macOS、Windows、Linux 上测试
3. **边界情况测试**：测试异常情况处理

## 性能考虑

### 优化策略

1. **懒加载**：仅在需要时初始化拖拽功能
2. **缓存机制**：缓存最近的导出结果
3. **异步处理**：使用 Web Workers 进行导出处理
4. **内存管理**：及时清理临时文件和缓存

### 资源限制

1. **文件大小限制**：限制单次导出文件大小（如 50MB）
2. **并发限制**：限制同时进行的拖拽操作数量
3. **缓存大小**：限制内存缓存大小（如 100MB）

## 兼容性

### 平台支持

- ✅ **macOS**: 完全支持
- ✅ **Windows**: 完全支持  
- ✅ **Linux**: 完全支持

### Electron 版本

- 最低要求：Electron 13+
- 推荐版本：Electron 20+

### 浏览器回退

对于非 Electron 环境，提供降级方案：
- 显示"拖拽功能需要桌面应用"提示
- 提供传统的导出按钮作为替代

## 实施时间表

### 第一阶段（1-2天）
- [x] IPC 通道设计和实现
- [x] 主进程拖拽服务基础框架

### 第二阶段（2-3天）  
- [ ] 渲染进程拖拽组件开发
- [ ] 基础拖拽功能实现

### 第三阶段（1-2天）
- [ ] 用户界面增强
- [ ] 格式选择和状态指示

### 第四阶段（1-2天）
- [ ] 性能优化和缓存机制
- [ ] 错误处理和边界情况

### 第五阶段（1天）
- [ ] 测试和调试
- [ ] 文档完善

**总计：6-10天**

## 总结

这个实现方案充分利用了 Electron 的原生拖拽 API，结合 TexFlow 现有的导出功能，为用户提供了直观、高效的拖拽导出体验。通过模块化设计、性能优化和完善的用户反馈，确保功能既强大又易用。

关键优势：
1. **原生体验**：使用 Electron 原生 API，与系统完全集成
2. **格式灵活**：支持多种导出格式和快速切换
3. **性能优化**：缓存机制和异步处理确保流畅体验  
4. **用户友好**：直观的视觉反馈和键盘快捷键支持
5. **可扩展性**：模块化设计便于后续功能扩展
