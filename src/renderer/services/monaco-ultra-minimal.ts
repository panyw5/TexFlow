// 超级精简的 Monaco Editor - 只保留核心功能
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

// 最小化的工作线程配置
(self as any).MonacoEnvironment = {
  getWorkerUrl: () => {
    // 返回一个简单的 worker，避免加载完整的语言服务
    return 'data:text/javascript,console.log("minimal worker");';
  }
};

// 超级精简的语言配置
export function registerMinimalLatexLanguage() {
  if (monaco.languages.getLanguages().find(lang => lang.id === 'latex')) {
    return; // 已注册
  }

  monaco.languages.register({ id: 'latex' });

  // 最基本的语言配置
  monaco.languages.setLanguageConfiguration('latex', {
    comments: { lineComment: '%' },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '$', close: '$' },
    ]
  });

  // 极简的 tokenizer - 只识别基本结构
  monaco.languages.setMonarchTokensProvider('latex', {
    tokenizer: {
      root: [
        [/%.*$/, 'comment'],
        [/\\[a-zA-Z]+/, 'keyword'],
        [/\$\$/, 'string.escape'],
        [/\$/, 'string'],
        [/[{}]/, 'delimiter.bracket'],
        [/[\[\]]/, 'delimiter.square'],
        [/[()]/, 'delimiter.parenthesis'],
      ]
    }
  });

  // 超级简化的自动补全
  const basicCommands = [
    'frac', 'sqrt', 'sum', 'int', 'alpha', 'beta', 'gamma', 'theta', 'phi', 'pi',
    'infty', 'partial', 'nabla', 'in', 'to', 'rightarrow', 'leftarrow'
  ];

  monaco.languages.registerCompletionItemProvider('latex', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn - 1, // 包含反斜杠
        endColumn: word.endColumn,
      };

      const suggestions = basicCommands.map(cmd => ({
        label: '\\' + cmd,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: '\\' + cmd,
        range: range,
      }));

      return { suggestions };
    }
  });
}

// 导出精简版本
export { monaco };
export const { editor, languages, Uri, Position, Range, KeyMod, KeyCode } = monaco;
