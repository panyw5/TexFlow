// LaTeX-related type definitions

export interface LaTeXError {
  line: number;
  column: number;
  message: string;
  type: 'syntax' | 'rendering' | 'warning';
}

export interface LaTeXEnvironment {
  name: string;
  startLine: number;
  endLine: number;
  content: string;
}

export interface LaTeXCommand {
  name: string;
  line: number;
  column: number;
  parameters: string[];
}

export interface LaTeXDocument {
  content: string;
  environments: LaTeXEnvironment[];
  commands: LaTeXCommand[];
  errors: LaTeXError[];
}

export interface RenderOptions {
  displayMode: boolean;
  throwOnError: boolean;
  strict: boolean;
  macros?: Record<string, string>;
}

export interface RenderResult {
  success: boolean;
  html?: string;
  error?: string;
  warnings?: string[];
}
