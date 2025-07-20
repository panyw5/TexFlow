// 轻量级图像导出服务
// 延迟加载 html2canvas 以减少初始包大小

export class ImageExportService {
  private static html2canvasLoaded = false;
  private static html2canvas: any = null;

  private static async loadHtml2Canvas() {
    if (!this.html2canvasLoaded) {
      try {
        // 动态导入以减少初始包大小
        const module = await import('html2canvas');
        this.html2canvas = module.default;
        this.html2canvasLoaded = true;
      } catch (error) {
        console.error('Failed to load html2canvas:', error);
        throw new Error('Image export functionality is not available');
      }
    }
    return this.html2canvas;
  }

  public static async exportToPng(element: HTMLElement, options: {
    scale?: number;
    backgroundColor?: string | null;
  } = {}): Promise<string> {
    const html2canvas = await this.loadHtml2Canvas();
    
    const canvas = await html2canvas(element, {
      backgroundColor: options.backgroundColor || null,
      scale: options.scale || 4, // 降低默认 scale 以减少内存使用
      useCORS: true,
      allowTaint: true,
      removeContainer: true,
      logging: false,
      // 优化性能的选项
      height: element.offsetHeight,
      width: element.offsetWidth,
      scrollX: 0,
      scrollY: 0,
    });
    
    return canvas.toDataURL('image/png', 0.9);
  }

  public static async exportToJpg(element: HTMLElement, options: {
    scale?: number;
    backgroundColor?: string;
  } = {}): Promise<string> {
    const html2canvas = await this.loadHtml2Canvas();
    
    const canvas = await html2canvas(element, {
      backgroundColor: options.backgroundColor || '#ffffff',
      scale: options.scale || 4,
      useCORS: true,
      allowTaint: true,
      removeContainer: true,
      logging: false,
      // 优化性能的选项
      height: element.offsetHeight,
      width: element.offsetWidth,
      scrollX: 0,
      scrollY: 0,
    });
    
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  public static async exportToFile(
    element: HTMLElement, 
    format: 'png' | 'jpg',
    filename?: string
  ): Promise<{
    dataUrl: string;
    filename: string;
  }> {
    let dataUrl: string;
    const timestamp = Date.now();
    const defaultFilename = `latex-export-${timestamp}.${format}`;
    
    // 临时设置元素颜色以确保导出质量
    const originalColor = element.style.color;
    element.style.color = '#000000';
    
    try {
      if (format === 'png') {
        dataUrl = await this.exportToPng(element, { 
          backgroundColor: null,
          scale: 6 // PNG 使用更高质量
        });
      } else {
        dataUrl = await this.exportToJpg(element, { 
          backgroundColor: '#ffffff',
          scale: 6 // JPG 使用更高质量
        });
      }
      
      return {
        dataUrl,
        filename: filename || defaultFilename
      };
    } finally {
      // 恢复原始颜色
      element.style.color = originalColor;
    }
  }
}

// 辅助函数：找到最佳的数学内容元素
export function findMathElement(): HTMLElement | null {
  // 优先级顺序：KaTeX 渲染的数学内容 > 预览容器
  const selectors = [
    '.katex-display .katex',
    '.katex',
    '.latex-preview-content .katex-display',
    '.latex-preview-content'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
      return element;
    }
  }
  
  return null;
}
