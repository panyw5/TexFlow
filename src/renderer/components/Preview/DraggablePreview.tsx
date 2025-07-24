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
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
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
    </div>
  );
};
