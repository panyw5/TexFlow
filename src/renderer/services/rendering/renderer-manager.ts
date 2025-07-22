import { IRenderer } from './IRenderer';
import { KaTeXRenderer } from '../katex-renderer';
import { MathJaxRenderer } from './mathjax-renderer';
import { UserConfig } from '../../types/user-config';

export class RendererManager {
  private katexRenderer: KaTeXRenderer;
  private mathjaxRenderer: MathJaxRenderer;

  constructor(config: UserConfig) {
    this.katexRenderer = new KaTeXRenderer();
    this.mathjaxRenderer = new MathJaxRenderer(config);
  }

  updateConfig(config: UserConfig): void {
    // Create a new MathJax renderer instance to ensure all config changes take effect
    this.mathjaxRenderer = new MathJaxRenderer(config);
    console.log('RendererManager: Created new MathJax renderer with updated config');
  }

  getRenderer(engine: 'katex' | 'mathjax'): IRenderer {
    if (engine === 'mathjax') {
      return this.mathjaxRenderer;
    }
    return this.katexRenderer;
  }
}