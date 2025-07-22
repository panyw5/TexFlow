import { IRenderer } from './rendering/IRenderer';
import { LRUCache } from '../utils/lru-cache';
import katex from 'katex';

export class KaTeXRenderer implements IRenderer {
  private renderCache = new LRUCache<string, string>(1000);

  async render(latex: string): Promise<string> {
    const cacheKey = this.hashLatex(latex);

    const cachedResult = this.renderCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.performRender(latex);
    this.renderCache.set(cacheKey, result);
    return result;
  }

  private hashLatex(latex: string): string {
    // A simple hashing function is sufficient for caching purposes.
    // In a real-world scenario, a more robust hashing algorithm like SHA-256 might be used.
    return latex;
  }

  private async performRender(latex: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const html = katex.renderToString(latex, {
          throwOnError: false,
          displayMode: true,
          // 添加统一的包装器类
          trust: true,
          strict: false
        });
        
        // 包装在统一的容器中以确保一致的定位
        const wrappedHtml = `<div class="katex-wrapper" style="display: flex; justify-content: center; align-items: center; width: 100%; margin: 0; padding: 0;">${html}</div>`;
        resolve(wrappedHtml);
      } catch (error) {
        reject(error);
      }
    });
  }
}