// 优化的 Monaco Editor 加载 - 只加载必要模块
import { 
  editor, 
  languages, 
  Uri, 
  Position, 
  Range, 
  KeyMod, 
  KeyCode,
  IRange
} from 'monaco-editor/esm/vs/editor/editor.api';

// 只导入必要的工作线程
import 'monaco-editor/esm/vs/editor/editor.worker?worker';

// 配置工作线程
self.MonacoEnvironment = {
  getWorker: function (moduleId, label) {
    switch (label) {
      case 'editorWorkerService':
        return new Worker(
          new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url),
          { type: 'module' }
        );
      default:
        throw new Error(`Unknown label ${label}`);
    }
  }
};

// 导出优化的Monaco API
export { 
  editor, 
  languages, 
  Uri, 
  Position, 
  Range, 
  KeyMod, 
  KeyCode
};

// 导出类型
export type { IRange };

// 预定义的主题
export const themes = {
  light: 'vs',
  dark: 'vs-dark'
};

// 优化的编辑器配置
export const defaultEditorOptions: editor.IStandaloneEditorConstructionOptions = {
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
