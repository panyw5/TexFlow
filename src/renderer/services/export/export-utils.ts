import { ExportOptions } from './IExportService';

/**
 * Extract SVG content from MathJax HTML output
 */
export function extractSVGFromHTML(html: string): string | null {
  console.log('extractSVGFromHTML called with HTML length:', html.length);
  
  // Match SVG element with all its content
  const svgMatch = html.match(/<svg[^>]*>[\s\S]*?<\/svg>/i);
  if (!svgMatch) {
    console.log('No SVG found in HTML');
    console.log('HTML content:', html.substring(0, 500));
    return null;
  }

  console.log('SVG match found, length:', svgMatch[0].length);
  let svg = svgMatch[0];

  // Extract styles from the wrapper
  const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) {
    console.log('Style found, injecting into SVG');
    const styles = styleMatch[1];
    // Inject styles into SVG
    svg = svg.replace(/<svg([^>]*)>/, `<svg$1><defs><style><![CDATA[${styles}]]></style></defs>`);
  }

  console.log('Final SVG length:', svg.length);
  return svg;
}

/**
 * Clean SVG for export by ensuring proper namespace and attributes
 */
export function cleanSVGForExport(svg: string): string {
  // Ensure SVG has proper namespace
  if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Ensure SVG has proper dimensions
  if (!svg.includes('width=') || !svg.includes('height=')) {
    // Extract viewBox if available
    const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
    if (viewBoxMatch) {
      const [, , , width, height] = viewBoxMatch[1].split(' ');
      svg = svg.replace('<svg', `<svg width="${width}" height="${height}"`);
    }
  }

  return svg;
}

/**
 * Convert SVG to Canvas element
 */
export function svgToCanvas(svg: string, options: ExportOptions = {}): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not create canvas context'));
      return;
    }

    const img = new Image();
    
    // Clean SVG for proper rendering
    const cleanSvg = cleanSVGForExport(svg);
    
    // Create blob URL for the SVG
    const svgBlob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      try {
        // Calculate dimensions
        const scale = options.scale || 2;
        const padding = options.padding || 20;
        
        // Use provided dimensions or calculate from image
        const baseWidth = options.width || img.naturalWidth || img.width;
        const baseHeight = options.height || img.naturalHeight || img.height;
        
        canvas.width = (baseWidth + padding * 2) * scale;
        canvas.height = (baseHeight + padding * 2) * scale;
        
        // Set high DPI scaling
        ctx.scale(scale, scale);
        
        // Set background color if specified
        if (options.backgroundColor && options.backgroundColor !== 'transparent') {
          ctx.fillStyle = options.backgroundColor;
          ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
        }
        
        // Draw the SVG image with padding
        ctx.drawImage(img, padding, padding, baseWidth, baseHeight);
        
        URL.revokeObjectURL(url);
        resolve(canvas);
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };
    
    img.src = url;
  });
}

/**
 * Convert canvas to PNG blob
 */
export function canvasToPNG(canvas: HTMLCanvasElement, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to PNG'));
      }
    }, 'image/png');
  });
}

/**
 * Convert canvas to JPG blob
 */
export function canvasToJPG(canvas: HTMLCanvasElement, quality: number = 0.95): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to JPG'));
      }
    }, 'image/jpeg', quality);
  });
}

/**
 * Convert blob to base64 string for browser environment
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert blob to buffer for file operations (Node.js environment only)
 */
export async function blobToBuffer(blob: Blob): Promise<Buffer> {
  // Check if Buffer is available (Node.js environment)
  if (typeof Buffer !== 'undefined') {
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } else {
    throw new Error('Buffer is not available in browser environment');
  }
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(format: string, prefix: string = 'formula'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  return `${prefix}_${timestamp}.${format}`;
}

/**
 * Validate export options
 */
export function validateExportOptions(options: ExportOptions): ExportOptions {
  const validated: ExportOptions = { ...options };
  
  // Ensure scale is within reasonable bounds
  if (validated.scale !== undefined) {
    validated.scale = Math.max(0.1, Math.min(10, validated.scale));
  }
  
  // Ensure quality is between 0 and 1
  if (validated.quality !== undefined) {
    validated.quality = Math.max(0.1, Math.min(1, validated.quality));
  }
  
  // Ensure padding is non-negative
  if (validated.padding !== undefined) {
    validated.padding = Math.max(0, validated.padding);
  }
  
  // Ensure dimensions are positive
  if (validated.width !== undefined) {
    validated.width = Math.max(1, validated.width);
  }
  if (validated.height !== undefined) {
    validated.height = Math.max(1, validated.height);
  }
  
  return validated;
}
