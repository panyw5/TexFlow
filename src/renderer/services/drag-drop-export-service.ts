import { MathJaxExportService } from './export/MathJaxExportService';
import { ExportOptions, ExportFormat } from './export/IExportService';
import { UserConfigManager } from './user-config-manager';

export class DragDropExportService {
  private exportService: MathJaxExportService | null = null;
  private configManager = new UserConfigManager();

  async initialize(): Promise<void> {
    const config = await this.configManager.loadConfig();
    this.exportService = new MathJaxExportService(config);
  }

  /**
   * 使用现有导出功能生成指定格式的内容
   */
  async generateExportContent(
    latex: string, 
    format: ExportFormat, 
    options: Partial<ExportOptions> = {}
  ): Promise<{ content: string; encoding: 'utf8' | 'base64'; filename: string }> {
    if (!this.exportService) {
      await this.initialize();
    }

    if (!this.exportService) {
      throw new Error('Export service initialization failed');
    }

    // 标准质量，适中尺寸的设置
    const defaultOptions: ExportOptions = {
      scale: 1, // 1x 缩放，标准尺寸
      quality: format === 'jpg' ? 0.95 : 0.98,
      backgroundColor: format === 'png' ? 'transparent' : 'white',
      padding: 20
    };

    const mergedOptions = { ...defaultOptions, ...options };

    console.log(`开始导出 ${format.toUpperCase()} 格式，参数:`, mergedOptions);
    console.log(`LaTeX 内容长度: ${latex.length}`);
    const startTime = performance.now();

    let result;
    switch (format) {
      case 'svg':
        result = await this.exportService.exportSVG(latex, mergedOptions);
        break;
      case 'png':
        result = await this.exportService.exportPNG(latex, mergedOptions);
        break;
      case 'jpg':
        result = await this.exportService.exportJPG(latex, mergedOptions);
        break;
      case 'pdf':
        result = await this.exportService.exportPDF(latex, mergedOptions);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    const endTime = performance.now();
    console.log(`${format.toUpperCase()} 导出完成，耗时: ${(endTime - startTime).toFixed(2)}ms`);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Export failed');
    }

    // 确定编码方式
    const encoding: 'utf8' | 'base64' = format === 'svg' ? 'utf8' : 'base64';
    
    // 处理数据格式
    let content: string;
    if (typeof result.data === 'string') {
      content = result.data;
    } else if (result.data && typeof result.data.toString === 'function') {
      content = encoding === 'base64' ? result.data.toString('base64') : result.data.toString();
    } else {
      throw new Error('Invalid data format returned from export');
    }

    return {
      content,
      encoding,
      filename: result.filename || `formula.${format}`
    };
  }

  /**
   * 为拖放准备 HTML 内容，包含完整的样式和数学公式
   */
  createStandaloneHTML(latex: string, renderedHtml: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LaTeX Formula - Exported from TexFlow</title>
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
            padding: 40px;
            border: 1px solid #eee;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            background: white;
            max-width: 90%;
        }
        .math-content {
            margin-bottom: 30px;
        }
        .source-section {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 6px;
            text-align: left;
        }
        .source-code {
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.6em;
            color: #333;
            white-space: pre-wrap;
            word-break: break-all;
            background: white;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        .export-info {
            margin-top: 20px;
            font-size: 0.5em;
            color: #666;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }
        .section-title {
            font-size: 0.7em;
            font-weight: bold;
            color: #555;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="math-container">
        <div class="math-content">
            ${renderedHtml}
        </div>
        <div class="source-section">
            <div class="section-title">LaTeX Source Code:</div>
            <div class="source-code">${latex}</div>
        </div>
        <div class="export-info">
            Exported from TexFlow • ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;
  }
}

// 创建全局实例
export const dragDropExportService = new DragDropExportService();
