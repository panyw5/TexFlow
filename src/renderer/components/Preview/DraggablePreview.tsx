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

  const handleDragStart = async (event: React.DragEvent) => {
    // 设置拖拽图像为当前公式内容
    if (containerRef.current) {
      const dragImage = containerRef.current.cloneNode(true) as HTMLElement;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-9999px';
      dragImage.style.left = '-9999px';
      dragImage.style.transform = 'scale(0.8)';
      dragImage.style.opacity = '0.8';
      dragImage.style.backgroundColor = 'white';
      dragImage.style.border = '2px solid #ddd';
      dragImage.style.borderRadius = '4px';
      dragImage.style.padding = '8px';
      document.body.appendChild(dragImage);
      
      event.dataTransfer.setDragImage(dragImage, 50, 25);
      
      // 清理临时元素
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 100);
    }
    
    event.preventDefault();
    setIsDragging(true);
    setIsExporting(true);

    if (window.electronAPI && window.electronAPI.startDrag) {
      try {
        let content: string;
        let filetype: 'tex' | 'html' | 'svg' | 'png' | 'jpg' | 'pdf';
        let dragFilename: string;
        let encoding: 'utf8' | 'base64' = 'utf8';

        switch (currentFormat) {
          case 'tex':
            content = latex;
            filetype = 'tex';
            dragFilename = filename.endsWith('.tex') ? filename : filename + '.tex';
            break;

          case 'html':
            content = dragDropExportService.createStandaloneHTML(latex, renderedHtml);
            filetype = 'html';
            dragFilename = filename.replace(/\.[^.]+$/, '.html');
            break;

          case 'svg':
          case 'png':
          case 'jpg':
          case 'pdf':
            // 使用现有导出服务，4x 缩放以提高清晰度
            const exportOptions = {
              scale: 1, // 4x 缩放以提高图片质量
              quality: currentFormat === 'jpg' ? 0.95 : 0.98,
              backgroundColor: currentFormat === 'png' ? 'transparent' : 'white',
              padding: 20
            };
            
            console.log(`=== 拖放导出 ${currentFormat.toUpperCase()} 开始 ===`);
            console.log('导出选项:', exportOptions);
            
            const exportResult = await dragDropExportService.generateExportContent(
              latex, 
              currentFormat as ExportFormat,
              exportOptions
            );
            
            content = exportResult.content;
            encoding = exportResult.encoding;
            filetype = currentFormat as 'svg' | 'png' | 'jpg' | 'pdf';
            dragFilename = exportResult.filename || filename.replace(/\.[^.]+$/, `.${currentFormat}`);
            break;

          default:
            return;
        }

        window.electronAPI.startDrag({
          filename: dragFilename,
          content,
          filetype,
          renderType: currentFormat === 'tex' ? 'source' : 'rendered',
          encoding
        });
      } catch (error) {
        console.error('Failed to start drag operation:', error);
        alert(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
      } finally {
        setIsExporting(false);
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsExporting(false);
  };

  const availableFormats: AllExportFormat[] = ['tex', 'html', 'svg', 'png', 'jpg', 'pdf'];
  
  const config = getFormatConfig(currentFormat);

  return (
    <div 
      ref={containerRef}
      className="draggable-preview"
      style={{ 
        position: 'relative', 
        height: '100%', 
        cursor: isDragging ? 'grabbing' : 'grab' 
      }}
      draggable={!isExporting}
      onDragStart={handleDragStart}
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
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            zIndex: 10
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
            border: 2px solid rgba(59, 130, 246, 0.3);
            background-color: rgba(59, 130, 246, 0.02);
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
