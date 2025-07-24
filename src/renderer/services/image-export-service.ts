import { ipcRenderer } from 'electron';

export interface ImageExportOptions {
  format: 'png' | 'svg' | 'jpeg';
  quality?: number; // For JPEG
  backgroundColor?: string;
  width?: number;
  height?: number;
  scaleFactor?: number;
}

export class ImageExportService {
  /**
   * 将 HTML 内容转换为图片
   */
  static async htmlToImage(
    html: string, 
    options: ImageExportOptions = { format: 'png' }
  ): Promise<string> {
    try {
      // 创建一个隐藏的 iframe 来渲染内容
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = `${options.width || 800}px`;
      iframe.style.height = `${options.height || 600}px`;
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);
      
      // 设置 iframe 内容
      const iframeDoc = iframe.contentDocument!;
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              margin: 0;
              padding: 20px;
              background-color: ${options.backgroundColor || 'white'};
              font-family: 'Computer Modern', 'Latin Modern Roman', serif;
              font-size: 2em;
              line-height: 1.2;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              box-sizing: border-box;
            }
            .content {
              text-align: center;
              max-width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="content">
            ${html}
          </div>
        </body>
        </html>
      `);
      iframeDoc.close();
      
      // 等待内容加载
      await new Promise(resolve => {
        iframe.onload = resolve;
        setTimeout(resolve, 1000); // 备用超时
      });
      
      // 使用 html2canvas 转换为图片
      if (options.format === 'svg') {
        // 对于 SVG，如果内容已经是 SVG，直接返回
        if (html.includes('<svg')) {
          const svgMatch = html.match(/<svg[^>]*>[\s\S]*?<\/svg>/i);
          if (svgMatch) {
            document.body.removeChild(iframe);
            return svgMatch[0];
          }
        }
        
        // 否则创建 SVG 包装器
        const svgContent = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${options.width || 800}" height="${options.height || 600}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="padding: 20px; background: ${options.backgroundColor || 'white'};">
                ${html}
              </div>
            </foreignObject>
          </svg>
        `;
        
        document.body.removeChild(iframe);
        return svgContent;
      } else {
        // 对于 PNG/JPEG，使用 canvas 截图
        const canvas = await this.captureElementAsCanvas(iframe, options);
        document.body.removeChild(iframe);
        
        return canvas.toDataURL(
          options.format === 'jpeg' ? 'image/jpeg' : 'image/png',
          options.quality || 0.9
        );
      }
      
    } catch (error) {
      console.error('Image export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to export as ${options.format}: ${errorMessage}`);
    }
  }
  
  /**
   * 使用 canvas 捕获元素
   */
  private static async captureElementAsCanvas(
    element: HTMLElement, 
    options: ImageExportOptions
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const scaleFactor = options.scaleFactor || 2; // 高分辨率
    const width = options.width || element.offsetWidth || 800;
    const height = options.height || element.offsetHeight || 600;
    
    canvas.width = width * scaleFactor;
    canvas.height = height * scaleFactor;
    
    ctx.scale(scaleFactor, scaleFactor);
    
    // 设置背景色
    ctx.fillStyle = options.backgroundColor || 'white';
    ctx.fillRect(0, 0, width, height);
    
    // 这里需要一个更复杂的 DOM 到 Canvas 的转换
    // 简化版本：使用 SVG foreignObject
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          ${element.outerHTML}
        </foreignObject>
      </svg>
    `;
    
    const img = new Image();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = url;
    });
  }
  
  /**
   * 创建包含数学公式的完整 HTML 文档
   */
  static createMathDocument(latex: string, renderedHtml: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LaTeX Math Export</title>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        body { 
            font-family: 'Computer Modern', 'Latin Modern Roman', serif; 
            font-size: 2em; 
            line-height: 1.2; 
            margin: 40px; 
            background: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: calc(100vh - 80px);
        }
        .math-container { 
            text-align: center;
            padding: 20px;
            border: 1px solid #eee;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            background: white;
        }
        .source-code {
            margin-top: 20px;
            padding: 15px;
            background: #f8f8f8;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.5em;
            text-align: left;
            overflow-x: auto;
        }
        .export-info {
            margin-top: 15px;
            font-size: 0.4em;
            color: #666;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="math-container">
        <div class="math-content">
            ${renderedHtml}
        </div>
        <details class="source-code">
            <summary>LaTeX Source</summary>
            <pre><code>${latex}</code></pre>
        </details>
        <div class="export-info">
            Exported from TexFlow • ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;
  }
}
