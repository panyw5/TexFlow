// 超级精简的 KaTeX 配置 - 只包含基本功能
import katex from 'katex';

// 只导入最基本的 CSS
import 'katex/dist/katex.min.css';

// 极简渲染选项
const MINIMAL_KATEX_OPTIONS = {
  throwOnError: false,
  errorColor: '#cc0000',
  strict: 'ignore' as const,
  trust: false,
  // 禁用大部分扩展功能以减小体积
  macros: {},
  // 禁用 HTML 扩展
  output: 'html' as const,
  // 最小字体大小设置
  minRuleThickness: 0.04,
  maxSize: 10,
  maxExpand: 1000,
  // 禁用颜色扩展
  colorIsTextColor: false,
  // 禁用 fleqn 模式
  fleqn: false,
  // 禁用 leqno 模式  
  leqno: false,
  // 禁用全局组
  globalGroup: false
};

export class UltraMinimalKatexRenderer {
  private static instance: UltraMinimalKatexRenderer;

  public static getInstance(): UltraMinimalKatexRenderer {
    if (!this.instance) {
      this.instance = new UltraMinimalKatexRenderer();
    }
    return this.instance;
  }

  public renderToString(latex: string): string {
    try {
      if (!latex || latex.trim() === '') {
        return '';
      }

      // 预处理：移除可能有问题的命令
      const cleanLatex = this.preprocessLatex(latex);
      
      return katex.renderToString(cleanLatex, MINIMAL_KATEX_OPTIONS);
    } catch (error) {
      console.warn('KaTeX render error:', error);
      return `<span class="katex-error">Error: ${latex}</span>`;
    }
  }

  private preprocessLatex(latex: string): string {
    // 只保留最基本的 LaTeX 命令，移除复杂的扩展
    return latex
      .replace(/\\begin\{(tikz|pgf|pspicture).*?\}.*?\\end\{\1\}/gs, '') // 移除图形包
      .replace(/\\usepackage.*?\n/g, '') // 移除包声明
      .replace(/\\newcommand.*?\n/g, '') // 移除自定义命令
      .trim();
  }

  // 基本验证
  public validateLatex(latex: string): boolean {
    try {
      katex.renderToString(latex, { ...MINIMAL_KATEX_OPTIONS, throwOnError: true });
      return true;
    } catch {
      return false;
    }
  }
}

export const katexRenderer = UltraMinimalKatexRenderer.getInstance();
