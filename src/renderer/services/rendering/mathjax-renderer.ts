import { IRenderer } from './IRenderer';
import { UserConfig } from '../../types/user-config';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';

export class MathJaxRenderer implements IRenderer {
  private config: UserConfig;

  constructor(config: UserConfig) {
    this.config = config;
  }

  updateConfig(config: UserConfig): void {
    this.config = config;
    console.log('MathJax renderer config updated:', config);
  }

  async render(latex: string): Promise<string> {
    try {
      const adaptor = liteAdaptor();
      RegisterHTMLHandler(adaptor);

      // Get the user's preamble (macro definitions)
      const preamble = this.config.mathjaxPreamble || '';

      // Combine the preamble with the LaTeX content.
      // MathJax will process the \newcommand definitions in the preamble.
      const processedLatex = `${preamble}\n${latex}`;

      // Configure enabled packages.
      const packagesToUse = this.config.enabledPackages.length > 0
        ? ['base', 'ams', 'newcommand', ...this.config.enabledPackages]
        : AllPackages;

      console.log('Loading packages:', packagesToUse);

      // Create a new MathJax document each time to ensure package changes take effect
      // This fixes the issue where package changes don't apply immediately
      const tex = new TeX({ packages: packagesToUse });
      const svg = new SVG({ fontCache: 'none' });
      const mathjaxDoc = mathjax.document('', {
        InputJax: tex,
        OutputJax: svg,
      });

      const node = mathjaxDoc.convert(processedLatex, { display: true });
      const formulaSvg = adaptor.innerHTML(node as any);

      const sheet = svg.styleSheet(mathjaxDoc);
      const styles = adaptor.innerHTML(sheet as any);

      const finalHtml = `
        <div class="mathjax-wrapper" style="display: flex; justify-content: center; align-items: center; width: 100%; margin: 0; padding: 0;">
          <style>${styles}</style>
          ${formulaSvg}
        </div>
      `;

      if (!formulaSvg) {
        throw new Error('Rendered HTML is empty.');
      }

      return finalHtml;
    } catch (error: any) {
      console.error('MathJax Rendering Error:', error);
      console.error('Error stack:', error.stack);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('package')) {
        errorMessage = `Package loading error: ${error.message}. Check if the package is enabled in package manager.`;
      } else if (error.message.includes('Undefined control sequence')) {
        errorMessage = `Undefined command: ${error.message}. Check if the required package is enabled or if the macro is defined.`;
      }
      
      return `<div style="color: red; font-family: sans-serif; padding: 10px; background: rgba(255,0,0,0.1); border-radius: 4px;">
        <strong>MathJax Error:</strong><br>
        ${errorMessage}
      </div>`;
    }
  }

  // The parsePreamble function is no longer needed with this simplified approach.
}