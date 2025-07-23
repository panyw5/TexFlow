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
