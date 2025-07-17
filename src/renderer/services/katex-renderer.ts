import { debounce } from 'lodash.debounce';

export class KaTeXRenderer {
  private renderCache = new LRUCache<string, string>(1000);
  private renderQueue = new Map<string, Promise<string>>();
  
  // Batch rendering for multiple equations
  private debouncedBatchRender = debounce(this.processBatch.bind(this), 50);
  
  async renderEquation(latex: string): Promise<string> {
    const cacheKey = this.hashLatex(latex);
    
    // Check cache first
    if (this.renderCache.has(cacheKey)) {
      return this.renderCache.get(cacheKey)!;
    }
    
    // Avoid duplicate renders
    if (this.renderQueue.has(cacheKey)) {
      return this.renderQueue.get(cacheKey)!;
    }
    
    const renderPromise = this.performRender(latex);
    this.renderQueue.set(cacheKey, renderPromise);
    
    try {
      const result = await renderPromise;
      this.renderCache.set(cacheKey, result);
      return result;
    } finally {
      this.renderQueue.delete(cacheKey);
    }
  }
}