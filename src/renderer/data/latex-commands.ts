import * as monaco from 'monaco-editor';

export interface LaTeXCommand {
  command: string;
  description: string;
  category: LaTeXCategory;
  parameters: LaTeXParameter[];
  example: string;
  documentation?: string;
  insertText?: string;
  kind: monaco.languages.CompletionItemKind;
}

export interface LaTeXParameter {
  name: string;
  type: 'required' | 'optional';
  description: string;
  default?: string;
}

export type LaTeXCategory = 
  | 'math-symbols'
  | 'math-operators'
  | 'math-functions'
  | 'environments'
  | 'formatting'
  | 'structure'
  | 'references'
  | 'greek-letters'
  | 'arrows'
  | 'delimiters';

export const LATEX_COMMANDS: LaTeXCommand[] = [
  // Math Operators
  {
    command: 'frac',
    description: 'Creates a fraction',
    category: 'math-operators',
    parameters: [
      { name: 'numerator', type: 'required', description: 'The numerator' },
      { name: 'denominator', type: 'required', description: 'The denominator' }
    ],
    example: '\\frac{1}{2}',
    insertText: '\\frac{${1:numerator}}{${2:denominator}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'sqrt',
    description: 'Square root',
    category: 'math-operators',
    parameters: [
      { name: 'index', type: 'optional', description: 'Root index (default: 2)' },
      { name: 'expression', type: 'required', description: 'Expression under the root' }
    ],
    example: '\\sqrt{x}',
    insertText: '\\sqrt{${1:expression}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'sum',
    description: 'Summation symbol',
    category: 'math-operators',
    parameters: [],
    example: '\\sum_{i=1}^{n} x_i',
    insertText: '\\sum_{${1:i=1}}^{${2:n}} ${3:expression}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'int',
    description: 'Integral symbol',
    category: 'math-operators',
    parameters: [],
    example: '\\int_{0}^{1} f(x) dx',
    insertText: '\\int_{${1:0}}^{${2:1}} ${3:f(x)} d${4:x}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'lim',
    description: 'Limit',
    category: 'math-operators',
    parameters: [],
    example: '\\lim_{x \\to 0} f(x)',
    insertText: '\\lim_{${1:x \\to 0}} ${2:f(x)}',
    kind: monaco.languages.CompletionItemKind.Function,
  },

  // Greek Letters
  {
    command: 'alpha',
    description: 'Greek letter alpha (α)',
    category: 'greek-letters',
    parameters: [],
    example: '\\alpha',
    insertText: '\\alpha',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'beta',
    description: 'Greek letter beta (β)',
    category: 'greek-letters',
    parameters: [],
    example: '\\beta',
    insertText: '\\beta',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'gamma',
    description: 'Greek letter gamma (γ)',
    category: 'greek-letters',
    parameters: [],
    example: '\\gamma',
    insertText: '\\gamma',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'delta',
    description: 'Greek letter delta (δ)',
    category: 'greek-letters',
    parameters: [],
    example: '\\delta',
    insertText: '\\delta',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'epsilon',
    description: 'Greek letter epsilon (ε)',
    category: 'greek-letters',
    parameters: [],
    example: '\\epsilon',
    insertText: '\\epsilon',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'theta',
    description: 'Greek letter theta (θ)',
    category: 'greek-letters',
    parameters: [],
    example: '\\theta',
    insertText: '\\theta',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'lambda',
    description: 'Greek letter lambda (λ)',
    category: 'greek-letters',
    parameters: [],
    example: '\\lambda',
    insertText: '\\lambda',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'mu',
    description: 'Greek letter mu (μ)',
    category: 'greek-letters',
    parameters: [],
    example: '\\mu',
    insertText: '\\mu',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'pi',
    description: 'Greek letter pi (π)',
    category: 'greek-letters',
    parameters: [],
    example: '\\pi',
    insertText: '\\pi',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'sigma',
    description: 'Greek letter sigma (σ)',
    category: 'greek-letters',
    parameters: [],
    example: '\\sigma',
    insertText: '\\sigma',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'phi',
    description: 'Greek letter phi (φ)',
    category: 'greek-letters',
    parameters: [],
    example: '\\phi',
    insertText: '\\phi',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'omega',
    description: 'Greek letter omega (ω)',
    category: 'greek-letters',
    parameters: [],
    example: '\\omega',
    insertText: '\\omega',
    kind: monaco.languages.CompletionItemKind.Variable,
  },

  // Math Symbols
  {
    command: 'infty',
    description: 'Infinity symbol (∞)',
    category: 'math-symbols',
    parameters: [],
    example: '\\infty',
    insertText: '\\infty',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'partial',
    description: 'Partial derivative symbol (∂)',
    category: 'math-symbols',
    parameters: [],
    example: '\\partial',
    insertText: '\\partial',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'nabla',
    description: 'Nabla operator (∇)',
    category: 'math-symbols',
    parameters: [],
    example: '\\nabla',
    insertText: '\\nabla',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'pm',
    description: 'Plus-minus symbol (±)',
    category: 'math-symbols',
    parameters: [],
    example: '\\pm',
    insertText: '\\pm',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'times',
    description: 'Multiplication symbol (×)',
    category: 'math-symbols',
    parameters: [],
    example: '\\times',
    insertText: '\\times',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'cdot',
    description: 'Center dot (·)',
    category: 'math-symbols',
    parameters: [],
    example: '\\cdot',
    insertText: '\\cdot',
    kind: monaco.languages.CompletionItemKind.Variable,
  },

  // Arrows
  {
    command: 'rightarrow',
    description: 'Right arrow (→)',
    category: 'arrows',
    parameters: [],
    example: '\\rightarrow',
    insertText: '\\rightarrow',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'leftarrow',
    description: 'Left arrow (←)',
    category: 'arrows',
    parameters: [],
    example: '\\leftarrow',
    insertText: '\\leftarrow',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'leftrightarrow',
    description: 'Left-right arrow (↔)',
    category: 'arrows',
    parameters: [],
    example: '\\leftrightarrow',
    insertText: '\\leftrightarrow',
    kind: monaco.languages.CompletionItemKind.Variable,
  },
  {
    command: 'Rightarrow',
    description: 'Double right arrow (⇒)',
    category: 'arrows',
    parameters: [],
    example: '\\Rightarrow',
    insertText: '\\Rightarrow',
    kind: monaco.languages.CompletionItemKind.Variable,
  },

  // Environments
  {
    command: 'begin{equation}',
    description: 'Numbered equation environment',
    category: 'environments',
    parameters: [],
    example: '\\begin{equation}\n  E = mc^2\n\\end{equation}',
    insertText: '\\begin{equation}\n  ${1:equation}\n\\end{equation}',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },
  {
    command: 'begin{align}',
    description: 'Aligned equations environment',
    category: 'environments',
    parameters: [],
    example: '\\begin{align}\n  x &= y \\\\\n  a &= b\n\\end{align}',
    insertText: '\\begin{align}\n  ${1:equation} &= ${2:expression} \\\\\n  ${3:equation} &= ${4:expression}\n\\end{align}',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },
  {
    command: 'begin{matrix}',
    description: 'Matrix environment',
    category: 'environments',
    parameters: [],
    example: '\\begin{matrix}\n  a & b \\\\\n  c & d\n\\end{matrix}',
    insertText: '\\begin{matrix}\n  ${1:a} & ${2:b} \\\\\n  ${3:c} & ${4:d}\n\\end{matrix}',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },
  {
    command: 'begin{cases}',
    description: 'Cases environment for piecewise functions',
    category: 'environments',
    parameters: [],
    example: '\\begin{cases}\n  x, & \\text{if } x > 0 \\\\\n  0, & \\text{otherwise}\n\\end{cases}',
    insertText: '\\begin{cases}\n  ${1:expression}, & \\text{if } ${2:condition} \\\\\n  ${3:expression}, & \\text{otherwise}\n\\end{cases}',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },

  // Math Functions
  {
    command: 'sin',
    description: 'Sine function',
    category: 'math-functions',
    parameters: [],
    example: '\\sin(x)',
    insertText: '\\sin(${1:x})',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'cos',
    description: 'Cosine function',
    category: 'math-functions',
    parameters: [],
    example: '\\cos(x)',
    insertText: '\\cos(${1:x})',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'tan',
    description: 'Tangent function',
    category: 'math-functions',
    parameters: [],
    example: '\\tan(x)',
    insertText: '\\tan(${1:x})',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'log',
    description: 'Logarithm function',
    category: 'math-functions',
    parameters: [],
    example: '\\log(x)',
    insertText: '\\log(${1:x})',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'ln',
    description: 'Natural logarithm function',
    category: 'math-functions',
    parameters: [],
    example: '\\ln(x)',
    insertText: '\\ln(${1:x})',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'exp',
    description: 'Exponential function',
    category: 'math-functions',
    parameters: [],
    example: '\\exp(x)',
    insertText: '\\exp(${1:x})',
    kind: monaco.languages.CompletionItemKind.Function,
  },

  // Formatting
  {
    command: 'text',
    description: 'Text in math mode',
    category: 'formatting',
    parameters: [
      { name: 'text', type: 'required', description: 'Text content' }
    ],
    example: '\\text{some text}',
    insertText: '\\text{${1:text}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'textbf',
    description: 'Bold text',
    category: 'formatting',
    parameters: [
      { name: 'text', type: 'required', description: 'Text to make bold' }
    ],
    example: '\\textbf{bold text}',
    insertText: '\\textbf{${1:text}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'textit',
    description: 'Italic text',
    category: 'formatting',
    parameters: [
      { name: 'text', type: 'required', description: 'Text to make italic' }
    ],
    example: '\\textit{italic text}',
    insertText: '\\textit{${1:text}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },

  // Delimiters
  {
    command: 'left(',
    description: 'Left parenthesis with automatic sizing',
    category: 'delimiters',
    parameters: [],
    example: '\\left( ... \\right)',
    insertText: '\\left( ${1:content} \\right)',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'left[',
    description: 'Left bracket with automatic sizing',
    category: 'delimiters',
    parameters: [],
    example: '\\left[ ... \\right]',
    insertText: '\\left[ ${1:content} \\right]',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'left{',
    description: 'Left brace with automatic sizing',
    category: 'delimiters',
    parameters: [],
    example: '\\left\\{ ... \\right\\}',
    insertText: '\\left\\{ ${1:content} \\right\\}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
];

// Helper function to get commands by category
export function getCommandsByCategory(category: LaTeXCategory): LaTeXCommand[] {
  return LATEX_COMMANDS.filter(cmd => cmd.category === category);
}

// Helper function to search commands
export function searchCommands(query: string): LaTeXCommand[] {
  const lowerQuery = query.toLowerCase();
  return LATEX_COMMANDS.filter(cmd => 
    cmd.command.toLowerCase().includes(lowerQuery) ||
    cmd.description.toLowerCase().includes(lowerQuery)
  );
}
