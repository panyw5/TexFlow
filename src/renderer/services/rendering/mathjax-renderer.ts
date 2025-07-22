import { IRenderer } from './IRenderer';
import { UserConfig } from '../../types/user-config';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';

export class MathJaxRenderer implements IRenderer {
  constructor(config: UserConfig) {}

  async render(latex: string): Promise<string> {
    try {
      // Create a completely new MathJax environment for each render call
      // to avoid any stateful issues.
      const adaptor = liteAdaptor();
      RegisterHTMLHandler(adaptor);

      const tex = new TeX({ packages: AllPackages });
      const svg = new SVG({ fontCache: 'none' });
      const mathjaxDoc = mathjax.document('', {
        InputJax: tex,
        OutputJax: svg,
      });

      const node = mathjaxDoc.convert(latex, { display: true });
      const formulaSvg = adaptor.innerHTML(node as any);

      const sheet = svg.styleSheet(mathjaxDoc);
      const styles = adaptor.innerHTML(sheet as any);

      const finalHtml = `
        <style>${styles}</style>
        ${formulaSvg}
      `;

      if (!formulaSvg) {
        throw new Error('Rendered HTML is empty.');
      }

      return finalHtml;
    } catch (error: any) {
      console.error('MathJax Rendering Error:', error);
      return `<div style="color: red; font-family: sans-serif;">MathJax Error: ${error.message}</div>`;
    }
  }
}