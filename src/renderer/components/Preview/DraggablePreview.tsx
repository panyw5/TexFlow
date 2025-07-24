<<<<<<< HEAD
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
  
  // 检测是否在 Electron 环境中
  const isElectron = typeof window !== 'undefined' && 
                     typeof window.electronAPI !== 'undefined' &&
                     window.electronAPI !== null;

  // 初始化拖拽管理器（仅在 Electron 环境中）
  React.useEffect(() => {
    console.log('=== DraggablePreview Debug ===');
    console.log('window:', typeof window);
    console.log('window.electronAPI:', typeof window?.electronAPI);
    console.log('isElectron:', isElectron);
    console.log('=== End Debug ===');
    
    if (isElectron) {
      console.log('[DraggablePreview] 创建 DragExportManager...');
      dragManagerRef.current = new DragExportManager();
      console.log('[DraggablePreview] DragExportManager 创建完成');
    } else {
      console.log('[DraggablePreview] 不在 Electron 环境中，跳过 DragExportManager 初始化');
    }
  }, [isElectron]);

  // 处理拖拽开始
  const handleDragStart = useCallback(async (e: React.DragEvent) => {
    console.log('[DraggablePreview] handleDragStart 被调用');
    
    if (!latex.trim()) {
      console.log('[DraggablePreview] LaTeX 为空，取消拖拽');
      e.preventDefault();
      return;
    }

    // 在浏览器环境中，显示提示信息
    if (!isElectron) {
      console.log('[DraggablePreview] 不在 Electron 环境中');
      e.preventDefault();
      alert('拖拽导出功能需要在桌面应用中使用');
      return;
    }

    if (!dragManagerRef.current) {
      console.error('[DraggablePreview] dragManager 未初始化');
      e.preventDefault();
      return;
    }

    console.log('[DraggablePreview] 开始拖拽处理');
    setIsDragging(true);
    
    // 检测修饰键来选择格式
    let format = dragFormat;
    if (e.shiftKey) format = 'svg';
    else if (e.altKey) format = 'jpg';
    else if (e.ctrlKey || e.metaKey) format = 'png';

    console.log('[DraggablePreview] 选择的格式:', format);

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

    console.log('[DraggablePreview] 开始调用 startDrag...');
    try {
      const success = await dragManagerRef.current.startDrag(latex, options);
      console.log('[DraggablePreview] startDrag 返回结果:', success);
      if (!success) {
        e.preventDefault();
      }
    } catch (error) {
      console.error('[DraggablePreview] startDrag 失败:', error);
      e.preventDefault();
    }
  }, [latex, renderedHtml, dragFormat]);

  // 处理拖拽结束
  const handleDragEnd = useCallback(() => {
    console.log('[DraggablePreview] 拖拽结束');
    setIsDragging(false);
    
    // 清理临时文件
    window.electronAPI?.cleanupDragFiles?.();
  }, []);

  // 处理拖拽过程中的其他事件
  const handleDragLeave = useCallback(() => {
    console.log('[DraggablePreview] 拖拽离开区域');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    console.log('[DraggablePreview] 拖拽过程中...');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    console.log('[DraggablePreview] 拖拽释放');
    setIsDragging(false);
  }, []);

  // 保存到桌面功能
  const handleSaveToDesktop = useCallback(async () => {
    if (!latex.trim()) return;
    
    console.log('[DraggablePreview] 开始保存到桌面');
    
    try {
      // 生成导出数据
      const exportData = await dragManagerRef.current?.generateExportData(latex, dragFormat, {
        scale: 4,
        backgroundColor: dragFormat === 'jpg' ? '#ffffff' : 'transparent',
        quality: dragFormat === 'jpg' ? 0.95 : undefined
      });
      
      if (!exportData) {
        console.error('[DraggablePreview] 导出数据生成失败');
        return;
      }
      
      // 调用保存到桌面
      const result = await window.electronAPI?.invoke('save:to-desktop', exportData);
      
      if (result?.success) {
        console.log('[DraggablePreview] 文件已保存到桌面:', result.filePath);
        // 可以添加成功提示
      } else {
        console.error('[DraggablePreview] 保存失败:', result?.error);
      }
      
    } catch (error) {
      console.error('[DraggablePreview] 保存到桌面失败:', error);
    }
  }, [latex, dragFormat]);

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
      draggable={latex.trim().length > 0 && !!isElectron}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        cursor: latex.trim() ? (isElectron ? 'grab' : 'default') : 'default',
        outline: 'none',
        position: 'relative',
        ...(isDragging && { cursor: 'grabbing', opacity: 0.8 })
      }}
      title={
        latex.trim() 
          ? (isElectron 
              ? `拖拽导出 ${dragFormat.toUpperCase()} (Shift=SVG, Alt=JPG, Ctrl/Cmd=PNG)` 
              : '拖拽导出功能需要桌面应用支持')
          : '输入 LaTeX 公式后可拖拽导出'
      }
    >
      {children}
      
            {/* 格式指示器 */}
      {latex.trim() && isElectron && (
        <>
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
          
          {/* 保存到桌面按钮 */}
          <button
            onClick={handleSaveToDesktop}
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              backgroundColor: 'rgba(0, 123, 255, 0.8)',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              opacity: isDragging ? 0.3 : 0.8,
              transition: 'opacity 0.2s ease'
            }}
            disabled={isDragging}
          >
            保存到桌面
          </button>
        </>
      )}
      
      {/* 浏览器环境提示 */}
      {latex.trim() && !isElectron && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'rgba(255, 165, 0, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            pointerEvents: 'none'
          }}
        >
          需要桌面应用
        </div>
      )}
      
      {/* 拖拽提示 */}
      {isDragging && (
=======
import React, { useState, useRef } from 'react';
import { dragDropExportService } from '../../services/drag-drop-export-service';
import { ExportFormat } from '../../services/export/IExportService';

export type AllExportFormat = ExportFormat | 'html' | 'tex';

interface DraggablePreviewProps {
  children: React.ReactNode;
  latex: string;
  renderedHtml: string;
  filename?: string;
  currentFormat: AllExportFormat;
}

export const DraggablePreview: React.FC<DraggablePreviewProps> = ({
  children,
  latex,
  renderedHtml,
  filename = 'untitled.tex',
  currentFormat
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getFormatConfig = (format: AllExportFormat) => {
    const configs = {
      tex: { 
        color: 'rgba(16, 185, 129, 0.9)', 
        hoverColor: 'rgba(5, 150, 105, 0.9)',
        icon: 'M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3H8M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z',
        title: '拖拽保存 LaTeX 源码'
      },
      html: { 
        color: 'rgba(59, 130, 246, 0.9)', 
        hoverColor: 'rgba(37, 99, 235, 0.9)',
        icon: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z',
        title: '拖拽保存为 HTML'
      },
      svg: { 
        color: 'rgba(245, 101, 101, 0.9)', 
        hoverColor: 'rgba(220, 38, 38, 0.9)',
        icon: 'M5,3C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H5M7.5,15L9.5,12L11,13.5L14.5,9L17.5,15H7.5Z',
        title: '拖拽保存为 SVG'
      },
      png: { 
        color: 'rgba(168, 85, 247, 0.9)', 
        hoverColor: 'rgba(147, 51, 234, 0.9)',
        icon: 'M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z',
        title: '拖拽保存为 PNG 图片'
      },
      jpg: { 
        color: 'rgba(251, 146, 60, 0.9)', 
        hoverColor: 'rgba(234, 88, 12, 0.9)',
        icon: 'M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z',
        title: '拖拽保存为 JPG 图片'
      },
      pdf: { 
        color: 'rgba(239, 68, 68, 0.9)', 
        hoverColor: 'rgba(220, 38, 38, 0.9)',
        icon: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z',
        title: '拖拽保存为 PDF'
      }
    };
    return configs[format];
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // 确保状态被重置，即使异步操作还在进行
    setTimeout(() => {
      setIsExporting(false);
    }, 50);
  };

  const availableFormats: AllExportFormat[] = ['tex', 'html', 'svg', 'png', 'jpg', 'pdf'];
  
  const config = getFormatConfig(currentFormat);

  return (
    <div 
      ref={containerRef}
      className="draggable-preview"
      style={{ 
        position: 'relative', 
        padding: '0px 50px',
        cursor: isDragging ? 'grabbing' : 'grab' 
      }}
      draggable={!isExporting}
      onDragStart={(event) => {
        // 完全复制成功的 DragDropTest 组件的处理方式，但添加其他格式支持
        event.preventDefault();
        setIsDragging(true);
        setIsExporting(true);
        
        if (window.electronAPI && window.electronAPI.startDrag) {
          // 简单格式立即处理
          if (currentFormat === 'tex') {
            const content = latex;
            const filetype = 'tex';
            const dragFilename = filename.endsWith('.tex') ? filename : filename + '.tex';
            
            window.electronAPI.startDrag({
              filename: dragFilename,
              content,
              filetype,
              encoding: 'utf8'
            });
            setIsExporting(false);
            return;
          }
          
          if (currentFormat === 'html') {
            const content = dragDropExportService.createStandaloneHTML(latex, renderedHtml);
            const filetype = 'html';
            const dragFilename = filename.replace(/\.[^.]+$/, '.html');
            
            window.electronAPI.startDrag({
              filename: dragFilename,
              content,
              filetype,
              encoding: 'utf8'
            });
            setIsExporting(false);
            return;
          }
          
          // 对于复杂格式，异步处理但不阻塞拖拽
          (async () => {
            try {
              const exportOptions = {
                scale: 0.8,
                quality: currentFormat === 'jpg' ? 0.85 : 0.95,
                backgroundColor: currentFormat === 'png' ? 'transparent' : 'white',
                padding: 15
              };
              
              console.log(`开始导出 ${currentFormat.toUpperCase()} 格式`);
              
              const exportResult = await dragDropExportService.generateExportContent(
                latex, 
                currentFormat as ExportFormat,
                exportOptions
              );
              
              window.electronAPI?.startDrag({
                filename: exportResult.filename || filename.replace(/\.[^.]+$/, `.${currentFormat}`),
                content: exportResult.content,
                filetype: currentFormat as 'svg' | 'png' | 'jpg' | 'pdf',
                encoding: exportResult.encoding
              });
              
              console.log(`${currentFormat.toUpperCase()} 导出完成`);
            } catch (error) {
              console.error(`导出 ${currentFormat} 格式失败:`, error);
              // 失败时使用 LaTeX 源码作为后备
              window.electronAPI?.startDrag({
                filename: filename.endsWith('.tex') ? filename : filename + '.tex',
                content: latex,
                filetype: 'tex',
                encoding: 'utf8'
              });
            } finally {
              setIsExporting(false);
            }
          })();
        }
      }}
      onDragEnd={handleDragEnd}
      title={isExporting ? '正在导出...' : `拖拽导出 ${currentFormat.toUpperCase()} 格式`}
    >
      {children}

      {/* 导出状态指示器 */}
      {isExporting && (
>>>>>>> feature/drag-drop-export
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
<<<<<<< HEAD
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
=======
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            pointerEvents: 'none',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div 
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          正在生成 {currentFormat.toUpperCase()} 文件...
        </div>
      )}

      {/* 拖拽提示（仅在悬停时显示） */}
      {!isExporting && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            zIndex: 10,
            whiteSpace: 'nowrap',
            minWidth: 'max-content'
          }}
          className="drag-hint"
        >
          拖拽导出 {currentFormat.toUpperCase()}
        </div>
      )}

      {/* CSS 动画和悬停效果 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .draggable-preview:hover .drag-hint {
            opacity: 1 !important;
          }
          
          .draggable-preview:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 2px solid #4B5563;
            background-color: #374151;
            transition: all 0.2s ease;
          }
          
          .draggable-preview {
            border: 2px solid transparent;
            transition: all 0.2s ease;
            border-radius: 4px;
          }
        `}
      </style>
>>>>>>> feature/drag-drop-export
    </div>
  );
};
