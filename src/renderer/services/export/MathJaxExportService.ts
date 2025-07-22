import { IExportService, ExportOptions, ExportResult, ExportFormat, DEFAULT_EXPORT_OPTIONS } from './IExportService';
import { MathJaxRenderer } from '../rendering/mathjax-renderer';
import { UserConfig } from '../../types/user-config';
import {
  extractSVGFromHTML,
  cleanSVGForExport,
  svgToCanvas,
  canvasToPNG,
  canvasToJPG,
  blobToBuffer,
  blobToBase64,
  generateFilename,
  validateExportOptions
} from './export-utils';

export class MathJaxExportService implements IExportService {
  private renderer: MathJaxRenderer;
  private config: UserConfig;

  constructor(config: UserConfig) {
    this.config = config;
    this.renderer = new MathJaxRenderer(config);
  }

  /**
   * Update configuration
   */
  updateConfig(config: UserConfig): void {
    this.config = config;
    this.renderer.updateConfig(config);
  }

  /**
   * Export LaTeX as SVG (vector graphics)
   */
  async exportSVG(latex: string, options: ExportOptions = {}): Promise<ExportResult> {
    try {
      console.log('MathJaxExportService.exportSVG called with:', { latex, options });
      const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...validateExportOptions(options) };
      console.log('Merged options:', mergedOptions);
      
      const svg = await this.getSVGString(latex);
      console.log('Generated SVG length:', svg.length);
      
      if (!svg) {
        return {
          success: false,
          error: 'Failed to generate SVG from LaTeX'
        };
      }

      console.log('SVG export successful');
      return {
        success: true,
        data: svg,
        filename: generateFilename('svg')
      };
    } catch (error: any) {
      console.error('SVG export error:', error);
      return {
        success: false,
        error: `SVG export failed: ${error.message}`
      };
    }
  }

  /**
   * Export LaTeX as PDF (vector graphics)
   */
  async exportPDF(latex: string, options: ExportOptions = {}): Promise<ExportResult> {
    try {
      const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...validateExportOptions(options) };
      const svg = await this.getSVGString(latex);
      
      if (!svg) {
        return {
          success: false,
          error: 'Failed to generate SVG for PDF conversion'
        };
      }

      // For now, we'll use a simple HTML to PDF approach
      // In a full implementation, you might want to use puppeteer or similar
      const htmlContent = this.createPDFHTML(svg, mergedOptions);
      
      // This is a placeholder - in a real implementation, you'd use:
      // 1. Puppeteer for server-side PDF generation
      // 2. Browser's print API for client-side PDF generation
      // 3. svg2pdf-js for direct SVG to PDF conversion
      
      return {
        success: false,
        error: 'PDF export requires additional setup. Please use SVG export for now.'
      };
    } catch (error: any) {
      return {
        success: false,
        error: `PDF export failed: ${error.message}`
      };
    }
  }

  /**
   * Export LaTeX as PNG (raster image)
   */
  async exportPNG(latex: string, options: ExportOptions = {}): Promise<ExportResult> {
    try {
      console.log('MathJaxExportService.exportPNG called with:', { latex, options });
      const mergedOptions = { 
        ...DEFAULT_EXPORT_OPTIONS, 
        ...validateExportOptions(options),
        backgroundColor: options.backgroundColor || 'white' // PNG default to white background
      };
      console.log('Merged PNG options:', mergedOptions);

      const svg = await this.getSVGString(latex);
      console.log('Generated SVG for PNG, length:', svg.length);
      
      if (!svg) {
        return {
          success: false,
          error: 'Failed to generate SVG for PNG conversion'
        };
      }

      console.log('Converting SVG to canvas...');
      const canvas = await svgToCanvas(svg, mergedOptions);
      console.log('Canvas created:', canvas.width, 'x', canvas.height);
      
      console.log('Converting canvas to PNG blob...');
      const blob = await canvasToPNG(canvas);
      console.log('PNG blob created, size:', blob.size);
      
      // Check if we're in browser or Node.js environment
      const isNodeJs = typeof Buffer !== 'undefined' && typeof window === 'undefined';
      
      if (isNodeJs) {
        console.log('Converting blob to buffer (Node.js)...');
        const buffer = await blobToBuffer(blob);
        console.log('Buffer created, length:', buffer.length);
        return {
          success: true,
          data: buffer,
          filename: generateFilename('png')
        };
      } else {
        console.log('Converting blob to base64 (browser)...');
        const base64 = await blobToBase64(blob);
        console.log('Base64 created, length:', base64.length);
        return {
          success: true,
          data: base64,
          filename: generateFilename('png')
        };
      }
    } catch (error: any) {
      console.error('PNG export error:', error);
      return {
        success: false,
        error: `PNG export failed: ${error.message}`
      };
    }
  }

  /**
   * Export LaTeX as JPG (raster image)
   */
  async exportJPG(latex: string, options: ExportOptions = {}): Promise<ExportResult> {
    try {
      const mergedOptions = { 
        ...DEFAULT_EXPORT_OPTIONS, 
        ...validateExportOptions(options),
        backgroundColor: options.backgroundColor || 'white' // JPG requires background color
      };

      const svg = await this.getSVGString(latex);
      
      if (!svg) {
        return {
          success: false,
          error: 'Failed to generate SVG for JPG conversion'
        };
      }

      const canvas = await svgToCanvas(svg, mergedOptions);
      const blob = await canvasToJPG(canvas, mergedOptions.quality || 0.95);
      
      // Check if we're in browser or Node.js environment
      const isNodeJs = typeof Buffer !== 'undefined' && typeof window === 'undefined';
      
      if (isNodeJs) {
        const buffer = await blobToBuffer(blob);
        return {
          success: true,
          data: buffer,
          filename: generateFilename('jpg')
        };
      } else {
        const base64 = await blobToBase64(blob);
        return {
          success: true,
          data: base64,
          filename: generateFilename('jpg')
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: `JPG export failed: ${error.message}`
      };
    }
  }

  /**
   * Get clean SVG string from LaTeX (without wrapper HTML)
   */
  async getSVGString(latex: string): Promise<string> {
    try {
      console.log('Getting SVG string for LaTeX:', latex);
      
      // Render LaTeX using MathJax
      console.log('Rendering with MathJax...');
      const html = await this.renderer.render(latex);
      console.log('MathJax rendered HTML length:', html.length);
      console.log('HTML preview:', html.substring(0, 200) + '...');
      
      // Extract SVG from the HTML wrapper
      console.log('Extracting SVG from HTML...');
      const svg = extractSVGFromHTML(html);
      console.log('Extracted SVG length:', svg?.length || 0);
      
      if (!svg) {
        throw new Error('No SVG found in MathJax output');
      }

      // Clean and prepare SVG for export
      console.log('Cleaning SVG for export...');
      const cleanSvg = cleanSVGForExport(svg);
      console.log('Clean SVG length:', cleanSvg.length);
      console.log('SVG preview:', cleanSvg.substring(0, 200) + '...');
      
      return cleanSvg;
    } catch (error: any) {
      console.error('getSVGString error:', error);
      throw new Error(`Failed to generate SVG: ${error.message}`);
    }
  }

  /**
   * Create HTML content for PDF generation
   */
  private createPDFHTML(svg: string, options: ExportOptions): string {
    const backgroundColor = options.backgroundColor || 'white';
    const padding = options.padding || 20;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>MathJax Formula Export</title>
          <style>
            body {
              margin: 0;
              padding: ${padding}px;
              background-color: ${backgroundColor};
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              font-family: 'Times New Roman', serif;
            }
            .formula-container {
              display: flex;
              justify-content: center;
              align-items: center;
            }
          </style>
        </head>
        <body>
          <div class="formula-container">
            ${svg}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get supported export formats
   */
  static getSupportedFormats(): ExportFormat[] {
    return ['svg', 'png', 'jpg']; // PDF will be added when properly implemented
  }

  /**
   * Check if a format is supported
   */
  static isFormatSupported(format: string): format is ExportFormat {
    return this.getSupportedFormats().includes(format as ExportFormat);
  }
}
