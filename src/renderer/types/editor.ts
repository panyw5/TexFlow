// Editor-related type definitions

export interface EditorSettings {
  fontSize: number;
  theme: 'light' | 'dark';
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  autoComplete: boolean;
}

export interface EditorPosition {
  line: number;
  column: number;
}

export interface EditorSelection {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface EditorError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface EditorState {
  content: string;
  position: EditorPosition;
  selection: EditorSelection | null;
  errors: EditorError[];
  isDirty: boolean;
}
