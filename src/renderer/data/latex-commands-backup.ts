import { languages, monaco } from '../services/monaco-full-test';

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
    command: 'begin{align*}',
    description: 'Aligned equations environment (no numbering)',
    category: 'environments',
    parameters: [],
    example: '\\begin{align*}\n  x &= y \\\\\n  a &= b\n\\end{align*}',
    insertText: '\\begin{align*}\n  ${1:equation} &= ${2:expression} \\\\\n  ${3:equation} &= ${4:expression}\n\\end{align*}',
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
    command: 'begin{pmatrix}',
    description: 'Matrix with parentheses ()',
    category: 'environments',
    parameters: [],
    example: '\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}',
    insertText: '\\begin{pmatrix}\n  ${1:a} & ${2:b} \\\\\n  ${3:c} & ${4:d}\n\\end{pmatrix}',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },
  {
    command: 'begin{bmatrix}',
    description: 'Matrix with square brackets []',
    category: 'environments',
    parameters: [],
    example: '\\begin{bmatrix}\n  a & b \\\\\n  c & d\n\\end{bmatrix}',
    insertText: '\\begin{bmatrix}\n  ${1:a} & ${2:b} \\\\\n  ${3:c} & ${4:d}\n\\end{bmatrix}',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },
  {
    command: 'begin{vmatrix}',
    description: 'Matrix with vertical bars (determinant)',
    category: 'environments',
    parameters: [],
    example: '\\begin{vmatrix}\n  a & b \\\\\n  c & d\n\\end{vmatrix}',
    insertText: '\\begin{vmatrix}\n  ${1:a} & ${2:b} \\\\\n  ${3:c} & ${4:d}\n\\end{vmatrix}',
    kind: monaco.languages.CompletionItemKind.Snippet,
  },
  {
    command: 'begin{Vmatrix}',
    description: 'Matrix with double vertical bars',
    category: 'environments',
    parameters: [],
    example: '\\begin{Vmatrix}\n  a & b \\\\\n  c & d\n\\end{Vmatrix}',
    insertText: '\\begin{Vmatrix}\n  ${1:a} & ${2:b} \\\\\n  ${3:c} & ${4:d}\n\\end{Vmatrix}',
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

  // Math Fonts and Formatting
  {
    command: 'mathbb',
    description: 'Blackboard bold (for sets like ℝ, ℕ, ℤ)',
    category: 'formatting',
    parameters: [
      { name: 'letter', type: 'required', description: 'Letter to format' }
    ],
    example: '\\mathbb{R}',
    insertText: '\\mathbb{${1:R}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'mathbf',
    description: 'Bold math font',
    category: 'formatting',
    parameters: [
      { name: 'text', type: 'required', description: 'Text to make bold' }
    ],
    example: '\\mathbf{x}',
    insertText: '\\mathbf{${1:x}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'mathscr',
    description: 'Script/calligraphy font',
    category: 'formatting',
    parameters: [
      { name: 'text', type: 'required', description: 'Text in script font' }
    ],
    example: '\\mathscr{L}',
    insertText: '\\mathscr{${1:L}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'mathcal',
    description: 'Calligraphy font',
    category: 'formatting',
    parameters: [
      { name: 'text', type: 'required', description: 'Text in calligraphy font' }
    ],
    example: '\\mathcal{A}',
    insertText: '\\mathcal{${1:A}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'mathrm',
    description: 'Roman (upright) math font',
    category: 'formatting',
    parameters: [
      { name: 'text', type: 'required', description: 'Text in roman font' }
    ],
    example: '\\mathrm{d}',
    insertText: '\\mathrm{${1:d}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'mathit',
    description: 'Italic math font',
    category: 'formatting',
    parameters: [
      { name: 'text', type: 'required', description: 'Text in italic font' }
    ],
    example: '\\mathit{text}',
    insertText: '\\mathit{${1:text}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'mathfrak',
    description: 'Fraktur font',
    category: 'formatting',
    parameters: [
      { name: 'text', type: 'required', description: 'Text in fraktur font' }
    ],
    example: '\\mathfrak{g}',
    insertText: '\\mathfrak{${1:g}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'mathsf',
    description: 'Sans-serif math font',
    category: 'formatting',
    parameters: [
      { name: 'text', type: 'required', description: 'Text in sans-serif font' }
    ],
    example: '\\mathsf{text}',
    insertText: '\\mathsf{${1:text}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'mathtt',
    description: 'Typewriter math font',
    category: 'formatting',
    parameters: [
      { name: 'text', type: 'required', description: 'Text in typewriter font' }
    ],
    example: '\\mathtt{text}',
    insertText: '\\mathtt{${1:text}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },

  // More Math Functions
  {
    command: 'lim',
    description: 'Limit function',
    category: 'math-functions',
    parameters: [],
    example: '\\lim_{x \\to 0}',
    insertText: '\\lim_{${1:x \\to 0}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'sup',
    description: 'Supremum',
    category: 'math-functions',
    parameters: [],
    example: '\\sup_{x \\in S}',
    insertText: '\\sup_{${1:x \\in S}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'inf',
    description: 'Infimum',
    category: 'math-functions',
    parameters: [],
    example: '\\inf_{x \\in S}',
    insertText: '\\inf_{${1:x \\in S}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'max',
    description: 'Maximum function',
    category: 'math-functions',
    parameters: [],
    example: '\\max_{x \\in S}',
    insertText: '\\max_{${1:x \\in S}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'min',
    description: 'Minimum function',
    category: 'math-functions',
    parameters: [],
    example: '\\min_{x \\in S}',
    insertText: '\\min_{${1:x \\in S}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'det',
    description: 'Determinant',
    category: 'math-functions',
    parameters: [],
    example: '\\det(A)',
    insertText: '\\det(${1:A})',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'dim',
    description: 'Dimension',
    category: 'math-functions',
    parameters: [],
    example: '\\dim(V)',
    insertText: '\\dim(${1:V})',
    kind: monaco.languages.CompletionItemKind.Function,
  },

  // More Math Symbols
  {
    command: 'partial',
    description: 'Partial derivative symbol ∂',
    category: 'math-symbols',
    parameters: [],
    example: '\\partial f',
    insertText: '\\partial ${1:f}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'nabla',
    description: 'Nabla operator ∇',
    category: 'math-symbols',
    parameters: [],
    example: '\\nabla f',
    insertText: '\\nabla ${1:f}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'infty',
    description: 'Infinity symbol ∞',
    category: 'math-symbols',
    parameters: [],
    example: '\\infty',
    insertText: '\\infty',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'emptyset',
    description: 'Empty set symbol ∅',
    category: 'math-symbols',
    parameters: [],
    example: '\\emptyset',
    insertText: '\\emptyset',
    kind: monaco.languages.CompletionItemKind.Function,
  },

  // More Operators
  {
    command: 'cdot',
    description: 'Center dot ·',
    category: 'math-operators',
    parameters: [],
    example: 'a \\cdot b',
    insertText: '\\cdot',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'times',
    description: 'Multiplication sign ×',
    category: 'math-operators',
    parameters: [],
    example: 'a \\times b',
    insertText: '\\times',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'pm',
    description: 'Plus-minus symbol ±',
    category: 'math-operators',
    parameters: [],
    example: 'a \\pm b',
    insertText: '\\pm',
    kind: monaco.languages.CompletionItemKind.Function,
  },

  // Set Theory
  {
    command: 'in',
    description: 'Element of ∈',
    category: 'math-symbols',
    parameters: [],
    example: 'x \\in S',
    insertText: '\\in',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'subset',
    description: 'Subset ⊂',
    category: 'math-symbols',
    parameters: [],
    example: 'A \\subset B',
    insertText: '\\subset',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'subseteq',
    description: 'Subset or equal ⊆',
    category: 'math-symbols',
    parameters: [],
    example: 'A \\subseteq B',
    insertText: '\\subseteq',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'cup',
    description: 'Union ∪',
    category: 'math-operators',
    parameters: [],
    example: 'A \\cup B',
    insertText: '\\cup',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'cap',
    description: 'Intersection ∩',
    category: 'math-operators',
    parameters: [],
    example: 'A \\cap B',
    insertText: '\\cap',
    kind: monaco.languages.CompletionItemKind.Function,
  },

  // More Arrows and Relations
  {
    command: 'to',
    description: 'Right arrow →',
    category: 'arrows',
    parameters: [],
    example: 'f: A \\to B',
    insertText: '\\to',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'mapsto',
    description: 'Maps to ↦',
    category: 'arrows',
    parameters: [],
    example: 'x \\mapsto f(x)',
    insertText: '\\mapsto',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'gets',
    description: 'Left arrow ←',
    category: 'arrows',
    parameters: [],
    example: 'x \\gets y',
    insertText: '\\gets',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'iff',
    description: 'If and only if ⟺',
    category: 'arrows',
    parameters: [],
    example: 'P \\iff Q',
    insertText: '\\iff',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'implies',
    description: 'Implies ⟹',
    category: 'arrows',
    parameters: [],
    example: 'P \\implies Q',
    insertText: '\\implies',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'equiv',
    description: 'Equivalent ≡',
    category: 'math-symbols',
    parameters: [],
    example: 'a \\equiv b',
    insertText: '\\equiv',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'approx',
    description: 'Approximately equal ≈',
    category: 'math-symbols',
    parameters: [],
    example: 'a \\approx b',
    insertText: '\\approx',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'neq',
    description: 'Not equal ≠',
    category: 'math-symbols',
    parameters: [],
    example: 'a \\neq b',
    insertText: '\\neq',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'leq',
    description: 'Less than or equal ≤',
    category: 'math-symbols',
    parameters: [],
    example: 'a \\leq b',
    insertText: '\\leq',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  {
    command: 'geq',
    description: 'Greater than or equal ≥',
    category: 'math-symbols',
    parameters: [],
    example: 'a \\geq b',
    insertText: '\\geq',
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
