export interface ExportOptions {
  width?: number;           // Canvas width for raster exports
  height?: number;          // Canvas height for raster exports
  scale?: number;           // Scale factor (default: 2 for retina)
  quality?: number;         // JPG quality (0.1-1.0)
  backgroundColor?: string; // Background color (default: transparent for PNG, white for JPG)
  padding?: number;         // Padding around formula in pixels
  dpi?: number;            // DPI for raster exports (default: 300)
}

export interface ExportResult {
  success: boolean;
  data?: string | Buffer;
  error?: string;
  filename?: string;
}

export interface IExportService {
  /**
   * Export LaTeX as SVG (vector graphics)
   */
  exportSVG(latex: string, options?: ExportOptions): Promise<ExportResult>;

  /**
   * Export LaTeX as PDF (vector graphics)
   */
  exportPDF(latex: string, options?: ExportOptions): Promise<ExportResult>;

  /**
   * Export LaTeX as PNG (raster image)
   */
  exportPNG(latex: string, options?: ExportOptions): Promise<ExportResult>;

  /**
   * Export LaTeX as JPG (raster image)
   */
  exportJPG(latex: string, options?: ExportOptions): Promise<ExportResult>;

  /**
   * Get clean SVG string from LaTeX (without wrapper HTML)
   */
  getSVGString(latex: string): Promise<string>;
}

export type ExportFormat = 'svg' | 'pdf' | 'png' | 'jpg';

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  scale: 4,
  quality: 0.95,
  backgroundColor: 'transparent',
  padding: 20,
  dpi: 300
};
