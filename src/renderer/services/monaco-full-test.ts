// 临时测试：使用完整的Monaco Editor
import * as monaco from 'monaco-editor';

// 简化工作线程配置，避免构建问题
(self as any).MonacoEnvironment = {
  getWorkerUrl: function (moduleId: string, label: string) {
    return './editor.worker.bundle.js';
  }
};

// 导出完整的Monaco API用于测试
export { monaco };

export const { 
  editor, 
  languages, 
  Uri, 
  Position, 
  Range, 
  KeyMod, 
  KeyCode
} = monaco;

export type { IRange } from 'monaco-editor';

// 预定义的主题
export const themes = {
  light: 'vs',
  dark: 'vs-dark'
};

// 编辑器配置
export const defaultEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 28,
  fontFamily: "'SF Mono', Monaco, Inconsolata, 'Roboto Mono', Consolas, 'Courier New', monospace",
  lineNumbers: 'on',
  minimap: { enabled: false },
  wordWrap: 'on',
  automaticLayout: true,
  scrollBeyondLastLine: false,
  renderWhitespace: 'none',
  tabSize: 2,
  insertSpaces: true,
  bracketPairColorization: { enabled: true },
  renderLineHighlight: 'none',
  selectionHighlight: false,
  occurrencesHighlight: 'off',
  codeLens: false,
  folding: false,
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 3,
  glyphMargin: false,
  contextmenu: false
};
