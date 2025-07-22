# MathJax Export Feature Implementation Plan

## Overview
This document outlines the implementation plan for adding export functionality to TexFlow's MathJax mode, enabling users to export mathematical formulas as vector graphics (SVG, PDF) and raster images (PNG, JPG).

## Current State Analysis
- TexFlow already uses MathJax with SVG output via the `MathJaxRenderer` class
- The current architecture provides a clean foundation with the `IRenderer` interface
- SVG output is already generated and can be extracted for export

## Export Formats

### 1. SVG (Vector Graphics) ✅ Ready
- **Status**: Directly available from MathJax renderer
- **Quality**: Scalable, high-quality vector graphics
- **Implementation**: Extract SVG from MathJax output

### 2. PDF (Vector Graphics) 🔄 Conversion Required
- **Method**: SVG → PDF conversion
- **Libraries**: `puppeteer` or `svg2pdf-js`
- **Quality**: High-quality vector graphics, suitable for print

### 3. PNG (Raster Images) 🔄 Conversion Required
- **Method**: SVG → Canvas → PNG
- **Libraries**: Canvas API or `sharp` (Node.js)
- **Quality**: High-quality raster, configurable DPI

### 4. JPG (Raster Images) 🔄 Conversion Required
- **Method**: SVG → Canvas → JPG
- **Libraries**: Canvas API or `sharp` (Node.js)
- **Quality**: Compressed raster, configurable quality

## Architecture Design

### 1. Export Service Interface
```typescript
interface IExportService {
  exportSVG(latex: string, options?: ExportOptions): Promise<string>;
  exportPDF(latex: string, options?: ExportOptions): Promise<Buffer>;
  exportPNG(latex: string, options?: ExportOptions): Promise<Buffer>;
  exportJPG(latex: string, options?: ExportOptions): Promise<Buffer>;
}
```

### 2. Export Options
```typescript
interface ExportOptions {
  width?: number;           // Canvas width for raster exports
  height?: number;          // Canvas height for raster exports
  scale?: number;           // Scale factor (default: 2 for retina)
  quality?: number;         // JPG quality (0.1-1.0)
  backgroundColor?: string; // Background color
  padding?: number;         // Padding around formula
}
```

### 3. File Structure Changes
```
src/renderer/services/
├── export/
│   ├── IExportService.ts       # Export service interface
│   ├── MathJaxExportService.ts # MathJax-specific export implementation
│   ├── svg-to-canvas.ts        # SVG to Canvas conversion utility
│   └── export-utils.ts         # Common export utilities
├── rendering/
│   └── mathjax-renderer.ts     # Enhanced with export-friendly SVG
```

## Implementation Steps

### Phase 1: Core Export Infrastructure
1. **Create Export Service Interface** (`IExportService.ts`)
2. **Implement MathJax Export Service** (`MathJaxExportService.ts`)
3. **Add SVG Extraction** to `MathJaxRenderer`
4. **Create Export Utilities** (`export-utils.ts`)

### Phase 2: Format-Specific Exporters
1. **SVG Export** - Direct extraction from MathJax
2. **PNG Export** - SVG to Canvas conversion
3. **JPG Export** - SVG to Canvas with compression
4. **PDF Export** - SVG to PDF conversion

### Phase 3: UI Integration
1. **Export Button** in Preview component
2. **Export Options Dialog** for format selection
3. **Progress Indicators** for conversion process
4. **File Save Dialog** integration

### Phase 4: IPC Integration
1. **Main Process Handlers** for file operations
2. **Export Progress** communication
3. **Error Handling** across process boundaries

## Technical Implementation Details

### 1. SVG Export (Direct)
```typescript
async exportSVG(latex: string): Promise<string> {
  const renderer = new MathJaxRenderer(this.config);
  const html = await renderer.render(latex);
  const svgMatch = html.match(/<svg[^>]*>.*?<\/svg>/s);
  return svgMatch ? svgMatch[0] : '';
}
```

### 2. Canvas-based Conversion (PNG/JPG)
```typescript
async svgToCanvas(svg: string, options: ExportOptions): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = options.width || img.width * (options.scale || 2);
      canvas.height = options.height || img.height * (options.scale || 2);
      
      if (options.backgroundColor) {
        ctx.fillStyle = options.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = url;
  });
}
```

### 3. PDF Export Strategy
Using `puppeteer` for high-quality PDF generation:
```typescript
async exportPDF(latex: string, options: ExportOptions): Promise<Buffer> {
  const svg = await this.exportSVG(latex);
  const html = `
    <!DOCTYPE html>
    <html>
      <head><style>body { margin: 0; padding: ${options.padding || 20}px; }</style></head>
      <body>${svg}</body>
    </html>
  `;
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true
  });
  await browser.close();
  
  return pdf;
}
```

## UI/UX Design

### 1. Export Button Location
- **Primary**: Bottom-right corner of Preview component (near renderer toggle)
- **Secondary**: Context menu on right-click

### 2. Export Dialog
- **Format Selection**: Radio buttons for SVG, PDF, PNG, JPG
- **Quality Options**: Scale factor, DPI, compression quality
- **Preview**: Small preview of export result
- **Save Location**: File picker integration

### 3. Progress Feedback
- **Loading States**: During conversion process
- **Progress Bar**: For long operations (PDF generation)
- **Success/Error Messages**: Clear user feedback

## Error Handling Strategy

### 1. Renderer Errors
- **Invalid LaTeX**: Show user-friendly error message
- **Package Issues**: Guide user to enable required packages
- **Memory Limits**: Warn about complex formulas

### 2. Conversion Errors
- **Canvas Limitations**: Fallback to lower resolution
- **PDF Generation**: Retry with simplified options
- **File System**: Handle permission and space issues

### 3. User Feedback
- **Toast Notifications**: For success/error states
- **Error Dialogs**: With actionable solutions
- **Logs**: Debug information for troubleshooting

## Dependencies and Packages

### Required npm packages:
```json
{
  "dependencies": {
    "puppeteer": "^21.0.0",
    "canvas": "^2.11.0"
  },
  "devDependencies": {
    "@types/canvas": "^2.11.0"
  }
}
```

### Optional alternatives:
- `svg2pdf-js`: Lightweight PDF generation
- `sharp`: Server-side image processing
- `html2canvas`: Alternative for canvas conversion

## Performance Considerations

### 1. Caching Strategy
- **SVG Cache**: Cache generated SVG for repeated exports
- **Canvas Reuse**: Reuse canvas elements when possible
- **Background Processing**: Web Workers for heavy conversions

### 2. Memory Management
- **Large Formulas**: Progressive rendering for complex expressions
- **Cleanup**: Proper disposal of canvas and blob objects
- **Limits**: Set reasonable size limits for exports

### 3. User Experience
- **Instant SVG**: Immediate SVG export (no conversion needed)
- **Progressive Loading**: Show progress for slow operations
- **Cancellation**: Allow users to cancel long-running exports

## Testing Strategy

### 1. Unit Tests
- **Export Service**: Test each format export
- **Conversion Utils**: Test SVG to Canvas conversion
- **Error Handling**: Test error scenarios

### 2. Integration Tests
- **End-to-End**: Full export workflow
- **File System**: Save and verify exported files
- **Performance**: Test with various formula complexities

### 3. Manual Testing
- **Formula Variety**: Test with different LaTeX expressions
- **Format Quality**: Verify output quality across formats
- **User Workflow**: Test complete user experience

## Future Enhancements

### 1. Batch Export
- **Multiple Formulas**: Export entire documents
- **Format Combinations**: Generate multiple formats simultaneously
- **ZIP Archives**: Package multiple exports

### 2. Cloud Integration
- **Direct Upload**: Export to cloud storage
- **Sharing Links**: Generate shareable URLs
- **Collaboration**: Export with annotations

### 3. Advanced Options
- **Custom Styling**: Override default MathJax styles
- **Watermarks**: Add custom branding
- **Templates**: Pre-configured export settings

## Security Considerations

### 1. File System Access
- **Sandboxing**: Limit file system access
- **Path Validation**: Prevent directory traversal
- **Permissions**: Request only necessary permissions

### 2. Memory Safety
- **Resource Limits**: Prevent memory exhaustion
- **Cleanup**: Proper resource disposal
- **Validation**: Sanitize user inputs

## Conclusion

This implementation plan provides a comprehensive roadmap for adding robust export functionality to TexFlow's MathJax mode. The phased approach ensures incremental delivery while maintaining code quality and user experience.

The architecture leverages TexFlow's existing MathJax SVG output, providing a solid foundation for high-quality exports across multiple formats.
