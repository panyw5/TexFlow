// 简化的 LaTeX 命令数据 - 用于优化版本
export interface LaTeXCommand {
  command: string;
  description: string;
  category: string;
  example: string;
  insertText?: string;
}

export const LATEX_COMMANDS: LaTeXCommand[] = [
  // Math Operators
  {
    command: 'frac',
    description: 'Creates a fraction',
    category: 'math-operators',
    example: '\\frac{1}{2}',
    insertText: '\\frac{${1:numerator}}{${2:denominator}}',
  },
  {
    command: 'sqrt',
    description: 'Square root',
    category: 'math-operators',
    example: '\\sqrt{x}',
    insertText: '\\sqrt{${1:expression}}',
  },
  {
    command: 'sum',
    description: 'Summation',
    category: 'math-operators',
    example: '\\sum_{i=1}^{n}',
    insertText: '\\sum_{${1:i=1}}^{${2:n}}',
  },
  {
    command: 'int',
    description: 'Integral',
    category: 'math-operators',
    example: '\\int_{a}^{b}',
    insertText: '\\int_{${1:a}}^{${2:b}}',
  },
  {
    command: 'lim',
    description: 'Limit',
    category: 'math-operators',
    example: '\\lim_{x \\to \\infty}',
    insertText: '\\lim_{${1:x \\to \\infty}}',
  },

  // Greek Letters
  {
    command: 'alpha',
    description: 'Greek letter alpha',
    category: 'greek-letters',
    example: '\\alpha',
  },
  {
    command: 'beta',
    description: 'Greek letter beta',
    category: 'greek-letters',
    example: '\\beta',
  },
  {
    command: 'gamma',
    description: 'Greek letter gamma',
    category: 'greek-letters',
    example: '\\gamma',
  },
  {
    command: 'delta',
    description: 'Greek letter delta',
    category: 'greek-letters',
    example: '\\delta',
  },
  {
    command: 'epsilon',
    description: 'Greek letter epsilon',
    category: 'greek-letters',
    example: '\\epsilon',
  },
  {
    command: 'theta',
    description: 'Greek letter theta',
    category: 'greek-letters',
    example: '\\theta',
  },
  {
    command: 'lambda',
    description: 'Greek letter lambda',
    category: 'greek-letters',
    example: '\\lambda',
  },
  {
    command: 'mu',
    description: 'Greek letter mu',
    category: 'greek-letters',
    example: '\\mu',
  },
  {
    command: 'pi',
    description: 'Greek letter pi',
    category: 'greek-letters',
    example: '\\pi',
  },
  {
    command: 'sigma',
    description: 'Greek letter sigma',
    category: 'greek-letters',
    example: '\\sigma',
  },
  {
    command: 'phi',
    description: 'Greek letter phi',
    category: 'greek-letters',
    example: '\\phi',
  },
  {
    command: 'omega',
    description: 'Greek letter omega',
    category: 'greek-letters',
    example: '\\omega',
  },

  // Math Functions
  {
    command: 'sin',
    description: 'Sine function',
    category: 'math-functions',
    example: '\\sin(x)',
  },
  {
    command: 'cos',
    description: 'Cosine function',
    category: 'math-functions',
    example: '\\cos(x)',
  },
  {
    command: 'tan',
    description: 'Tangent function',
    category: 'math-functions',
    example: '\\tan(x)',
  },
  {
    command: 'log',
    description: 'Logarithm',
    category: 'math-functions',
    example: '\\log(x)',
  },
  {
    command: 'ln',
    description: 'Natural logarithm',
    category: 'math-functions',
    example: '\\ln(x)',
  },
  {
    command: 'exp',
    description: 'Exponential function',
    category: 'math-functions',
    example: '\\exp(x)',
  },

  // Symbols
  {
    command: 'infty',
    description: 'Infinity symbol',
    category: 'math-symbols',
    example: '\\infty',
  },
  {
    command: 'partial',
    description: 'Partial derivative symbol',
    category: 'math-symbols',
    example: '\\partial',
  },
  {
    command: 'nabla',
    description: 'Nabla operator',
    category: 'math-symbols',
    example: '\\nabla',
  },
  {
    command: 'pm',
    description: 'Plus-minus symbol',
    category: 'math-symbols',
    example: '\\pm',
  },
  {
    command: 'mp',
    description: 'Minus-plus symbol',
    category: 'math-symbols',
    example: '\\mp',
  },
  {
    command: 'times',
    description: 'Multiplication symbol',
    category: 'math-symbols',
    example: '\\times',
  },
  {
    command: 'div',
    description: 'Division symbol',
    category: 'math-symbols',
    example: '\\div',
  },
  {
    command: 'cdot',
    description: 'Center dot',
    category: 'math-symbols',
    example: '\\cdot',
  },

  // Arrows
  {
    command: 'rightarrow',
    description: 'Right arrow',
    category: 'arrows',
    example: '\\rightarrow',
  },
  {
    command: 'leftarrow',
    description: 'Left arrow',
    category: 'arrows',
    example: '\\leftarrow',
  },
  {
    command: 'leftrightarrow',
    description: 'Left-right arrow',
    category: 'arrows',
    example: '\\leftrightarrow',
  },
  {
    command: 'Rightarrow',
    description: 'Double right arrow',
    category: 'arrows',
    example: '\\Rightarrow',
  },
  {
    command: 'Leftarrow',
    description: 'Double left arrow',
    category: 'arrows',
    example: '\\Leftarrow',
  },
  {
    command: 'Leftrightarrow',
    description: 'Double left-right arrow',
    category: 'arrows',
    example: '\\Leftrightarrow',
  },

  // Environments
  {
    command: 'begin{equation}',
    description: 'Equation environment',
    category: 'environments',
    example: '\\begin{equation}\n  x = y\n\\end{equation}',
    insertText: '\\begin{equation}\n\t${1:equation}\n\\end{equation}',
  },
  {
    command: 'begin{align}',
    description: 'Align environment',
    category: 'environments',
    example: '\\begin{align}\n  x &= y \\\\\n  a &= b\n\\end{align}',
    insertText: '\\begin{align}\n\t${1:equations}\n\\end{align}',
  },
  {
    command: 'begin{align*}',
    description: 'Align environment (no numbering)',
    category: 'environments',
    example: '\\begin{align*}\n  x &= y \\\\\n  a &= b\n\\end{align*}',
    insertText: '\\begin{align*}\n\t${1:equations}\n\\end{align*}',
  },
  {
    command: 'begin{matrix}',
    description: 'Matrix environment',
    category: 'environments',
    example: '\\begin{matrix}\n  a & b \\\\\n  c & d\n\\end{matrix}',
    insertText: '\\begin{matrix}\n\t${1:matrix}\n\\end{matrix}',
  },
  {
    command: 'begin{pmatrix}',
    description: 'Parenthesized matrix',
    category: 'environments',
    example: '\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}',
    insertText: '\\begin{pmatrix}\n\t${1:matrix}\n\\end{pmatrix}',
  },
  {
    command: 'begin{bmatrix}',
    description: 'Bracketed matrix',
    category: 'environments',
    example: '\\begin{bmatrix}\n  a & b \\\\\n  c & d\n\\end{bmatrix}',
    insertText: '\\begin{bmatrix}\n\t${1:matrix}\n\\end{bmatrix}',
  },

  // Formatting
  {
    command: 'mathbb',
    description: 'Blackboard bold',
    category: 'formatting',
    example: '\\mathbb{R}',
    insertText: '\\mathbb{${1:letter}}',
  },
  {
    command: 'mathcal',
    description: 'Calligraphic letters',
    category: 'formatting',
    example: '\\mathcal{F}',
    insertText: '\\mathcal{${1:letter}}',
  },
  {
    command: 'mathbf',
    description: 'Bold math',
    category: 'formatting',
    example: '\\mathbf{v}',
    insertText: '\\mathbf{${1:text}}',
  },
  {
    command: 'mathit',
    description: 'Italic math',
    category: 'formatting',
    example: '\\mathit{text}',
    insertText: '\\mathit{${1:text}}',
  },
  {
    command: 'text',
    description: 'Regular text in math mode',
    category: 'formatting',
    example: '\\text{some text}',
    insertText: '\\text{${1:text}}',
  },

  // Common abbreviations
  {
    command: 'ldots',
    description: 'Low dots',
    category: 'math-symbols',
    example: '\\ldots',
  },
  {
    command: 'cdots',
    description: 'Center dots',
    category: 'math-symbols',
    example: '\\cdots',
  },
  {
    command: 'vdots',
    description: 'Vertical dots',
    category: 'math-symbols',
    example: '\\vdots',
  },
  {
    command: 'ddots',
    description: 'Diagonal dots',
    category: 'math-symbols',
    example: '\\ddots',
  },
];
