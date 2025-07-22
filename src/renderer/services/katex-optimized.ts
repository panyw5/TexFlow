// 优化的 KaTeX 配置 - 减少字体文件大小
import katex from 'katex';

// 自定义 KaTeX 配置，优化性能
export const optimizedKaTeXConfig = {
  throwOnError: false,
  errorColor: '#cc0000',
  displayMode: false,
  leqno: false,
  fleqn: false,
  strict: false,
  output: 'html', // 使用 HTML 输出而不是 MathML
  trust: false,
  macros: {
    // 常用宏定义
    '\\RR': '\\mathbb{R}',
    '\\NN': '\\mathbb{N}',
    '\\ZZ': '\\mathbb{Z}',
    '\\QQ': '\\mathbb{Q}',
    '\\CC': '\\mathbb{C}',
  },
  // 优化渲染性能
  maxSize: Infinity,
  maxExpand: 1000,
  globalGroup: false,
} as const;

// 渲染缓存优化
const renderCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

export const renderLaTeX = (latex: string, displayMode = false): string => {
  const cacheKey = `${latex}:${displayMode}`;
  
  // 检查缓存
  if (renderCache.has(cacheKey)) {
    return renderCache.get(cacheKey)!;
  }
  
  try {
    const result = katex.renderToString(latex, {
      ...optimizedKaTeXConfig,
      displayMode,
    });
    
    // 添加到缓存，但限制缓存大小
    if (renderCache.size >= MAX_CACHE_SIZE) {
      const firstKey = renderCache.keys().next().value;
      if (firstKey) {
        renderCache.delete(firstKey);
      }
    }
    renderCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.warn('KaTeX rendering error:', error);
    return `<span class="katex-error" title="${error}">${latex}</span>`;
  }
};

// 清除缓存函数
export const clearCache = (): void => {
  renderCache.clear();
};

// 获取缓存统计
export const getCacheStats = () => ({
  size: renderCache.size,
  maxSize: MAX_CACHE_SIZE,
});
