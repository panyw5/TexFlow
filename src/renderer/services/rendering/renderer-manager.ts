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

  getRenderer(engine: 'katex' | 'mathjax'): IRenderer {
    if (engine === 'mathjax') {
      return this.mathjaxRenderer;
    }
    return this.katexRenderer;
  }
}