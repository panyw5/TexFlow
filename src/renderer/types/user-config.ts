export interface LatexTemplate {
  id: string; // UUID
  name: string;
  content: string; // The actual LaTeX preamble content
}

export interface UserConfig {
  templates: LatexTemplate[];
  enabledPackages: string[]; // For MathJax, e.g., ['ams', 'mhchem']
  defaultRenderer: 'katex' | 'mathjax';
  mathjaxPreamble: string; // Custom macros for MathJax (only \newcommand, not \usepackage)
}