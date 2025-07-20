import { languages, editor, monaco } from './monaco-full-test';
import { LATEX_COMMANDS } from '../data/latex-commands';

export class LaTeXLanguageService {
  private static isRegistered = false;

  public static register(): void {
    if (this.isRegistered) {
      console.log('LaTeX language service already registered');
      return;
    }

    console.log('Registering LaTeX language service...');

    // Register the LaTeX language
    languages.register({ id: 'latex' });
    console.log('LaTeX language registered');

    // Set basic language configuration
    languages.setLanguageConfiguration('latex', {
      comments: {
        lineComment: '%',
      },
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
        { open: '$$', close: '$$' },
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '$', close: '$' },
      ],
    });

    // Set enhanced tokenizer for LaTeX with better syntax highlighting
    languages.setMonarchTokensProvider('latex', {
      // Define case-insensitive
      ignoreCase: false,
      
      // Define brackets
      brackets: [
        { open: '{', close: '}', token: 'delimiter.curly' },
        { open: '[', close: ']', token: 'delimiter.square' },
        { open: '(', close: ')', token: 'delimiter.parenthesis' }
      ],

      // Keywords
      keywords: [
        'begin', 'end', 'documentclass', 'usepackage', 'newcommand', 'renewcommand',
        'def', 'let', 'section', 'subsection', 'subsubsection', 'paragraph',
        'chapter', 'part', 'title', 'author', 'date', 'maketitle', 'tableofcontents',
        'label', 'ref', 'cite', 'bibliography', 'bibliographystyle'
      ],

      // Math operators and symbols
      operators: [
        'sum', 'int', 'prod', 'lim', 'infty', 'alpha', 'beta', 'gamma', 'delta',
        'epsilon', 'theta', 'lambda', 'mu', 'pi', 'sigma', 'phi', 'omega',
        'sin', 'cos', 'tan', 'log', 'ln', 'exp', 'sqrt', 'frac', 'over'
      ],

      tokenizer: {
        root: [
          // Math display environments ($$...$$)
          [/\$\$/, { token: 'string.math.display', next: '@mathDisplay' }],
          
          // Math inline environments ($...$)
          [/\$/, { token: 'string.math.inline', next: '@mathInline' }],
          
          // LaTeX environments
          [/\\begin\s*\{([^}]+)\}/, { token: 'keyword.control', next: '@environment.$1' }],
          [/\\end\s*\{([^}]+)\}/, 'keyword.control'],
          
          // Commands with arguments
          [/\\([a-zA-Z@]+)\s*\{/, { token: 'keyword.control', next: '@commandArg' }],
          [/\\([a-zA-Z@]+)\s*\[/, { token: 'keyword.control', next: '@commandOpt' }],
          
          // Simple commands
          [/\\([a-zA-Z@]+)/, {
            cases: {
              '@keywords': 'keyword.control',
              '@operators': 'keyword.operator',
              '@default': 'keyword'
            }
          }],
          
          // Special characters and symbols
          [/\\[^a-zA-Z@\s]/, 'keyword.operator'],
          
          // Comments (must be before other single character matches)
          [/%.*$/, 'comment'],
          
          // Math operators and special characters (moved up for higher priority)
          [/[\^_]/, 'operator.math.super-sub'],
          [/[*+\-=<>]/, 'operator.math.binary'],
          [/[!&|~]/, 'operator.math.logical'],
          [/[,;:]/, 'punctuation.math'],
          
          // Brackets and delimiters
          [/[{}]/, 'delimiter.curly'],
          [/[\[\]]/, 'delimiter.square'],
          [/[()]/, 'delimiter.parenthesis'],
          
          // Numbers
          [/\d*\.?\d+([eE][-+]?\d+)?/, 'number'],
          
          // Strings (for file names, etc.)
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, { token: 'string.quote', next: '@string' }],
          
          // Whitespace
          [/\s+/, 'white'],
          
          // Single characters (letters, etc.) - moved to end for lowest priority
          [/[a-zA-Z]/, 'text'],
          
          // Other text (catch-all, moved to very end)
          [/./, 'text'],
        ],

        // Math display mode
        mathDisplay: [
          [/\$\$/, { token: 'string.math.display', next: '@pop' }],
          [/\\[a-zA-Z@]+/, 'keyword.operator.math'],
          // 运算符优先匹配
          [/[\^_]/, 'operator.math.super-sub'],
          [/[*+\-=<>]/, 'operator.math.binary'],
          [/[!&|~]/, 'operator.math.logical'],
          [/[,;:]/, 'punctuation.math'],
          [/[{}[\]()]/, 'delimiter.math'],
          [/\d*\.?\d+([eE][-+]?\d+)?/, 'number.math'],
          // 单个字符（字母等）
          [/[a-zA-Z]/, 'string.math'],
          [/[^$\\]+/, 'string.math'],
          [/./, 'string.math']
        ],

        // Math inline mode
        mathInline: [
          [/\$/, { token: 'string.math.inline', next: '@pop' }],
          [/\\[a-zA-Z@]+/, 'keyword.operator.math'],
          // 运算符优先匹配
          [/[\^_]/, 'operator.math.super-sub'],
          [/[*+\-=<>]/, 'operator.math.binary'],
          [/[!&|~]/, 'operator.math.logical'],
          [/[,;:]/, 'punctuation.math'],
          [/[{}[\]()]/, 'delimiter.math'],
          [/\d*\.?\d+([eE][-+]?\d+)?/, 'number.math'],
          // 单个字符（字母等）
          [/[a-zA-Z]/, 'string.math'],
          [/[^$\\]+/, 'string.math'],
          [/./, 'string.math']
        ],

        // Environment content
        environment: [
          [/\\end\s*\{$S1\}/, { token: 'keyword.control', next: '@pop' }],
          [/\\begin\s*\{([^}]+)\}/, { token: 'keyword.control', next: '@environment.$1' }],
          { include: 'root' }
        ],

        // Command arguments {...}
        commandArg: [
          [/\}/, { token: 'delimiter.curly', next: '@pop' }],
          [/\{/, 'delimiter.curly'],
          { include: 'root' }
        ],

        // Command optional arguments [...]
        commandOpt: [
          [/\]/, { token: 'delimiter.square', next: '@pop' }],
          [/\[/, 'delimiter.square'],
          { include: 'root' }
        ],

        // String handling
        string: [
          [/[^\\"]+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/"/, { token: 'string.quote', next: '@pop' }]
        ],
      },

      // Escape sequences
      escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    });

    // Register completion provider
    languages.registerCompletionItemProvider('latex', {
      triggerCharacters: ['\\', '{', '^', '_'],
      provideCompletionItems: (model, position, context) => {
        console.log('🔥 Completion provider called!');
        console.log('Position:', position);
        console.log('Context:', context);
        console.log('Trigger kind:', context.triggerKind);
        console.log('Trigger character:', context.triggerCharacter);
        
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        console.log('Text until position:', JSON.stringify(textUntilPosition));

        // 匹配反斜杠开头的命令
        const commandMatch = textUntilPosition.match(/\\(\w*)$/);
        if (commandMatch) {
          console.log('Command match found:', commandMatch);
          const word = commandMatch[1];
          const range: monaco.IRange = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column - word.length - 1,
            endColumn: position.column,
          };

          const suggestions = LATEX_COMMANDS
            .filter(cmd => cmd.command.toLowerCase().includes(word.toLowerCase()))
            .slice(0, 50) // 限制建议数量以提高性能
            .map(cmd => ({
              label: '\\' + cmd.command,
              kind: languages.CompletionItemKind.Function,
              insertText: (cmd.insertText || ('\\' + cmd.command)),
              documentation: cmd.example,
              range: range,
              insertTextRules: cmd.insertText ? languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
            }));

          console.log('Returning suggestions:', suggestions.length);
          return { suggestions };
        }

        // 即使没有匹配到命令，也提供一些基础建议
        if (textUntilPosition.endsWith('\\')) {
          console.log('Backslash detected, providing basic suggestions');
          const range: monaco.IRange = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column - 1,
            endColumn: position.column,
          };

          const suggestions = LATEX_COMMANDS
            .slice(0, 20) // 显示前20个常用命令
            .map(cmd => ({
              label: '\\' + cmd.command,
              kind: languages.CompletionItemKind.Function,
              insertText: (cmd.insertText || ('\\' + cmd.command)),
              documentation: cmd.example,
              range: range,
              insertTextRules: cmd.insertText ? languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
            }));

          console.log('Returning basic suggestions:', suggestions.length);
          return { suggestions };
        }

        console.log('No suggestions returned');
        return { suggestions: [] };
      },
    });

    console.log('LaTeX completion provider registered');
    console.log('Available commands:', LATEX_COMMANDS.length);

    this.isRegistered = true;
    console.log('LaTeX language service registration complete');

    // Define custom LaTeX themes for better syntax highlighting
    monaco.editor.defineTheme('latex-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword.control', foreground: '0000ff', fontStyle: 'bold' },
        { token: 'keyword.operator', foreground: 'ff6600' },
        { token: 'keyword.operator.math', foreground: 'ff6600' },
        { token: 'keyword', foreground: '0066cc' },
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'string.math', foreground: 'aa0000' },
        { token: 'string.math.display', foreground: 'aa0000', fontStyle: 'bold' },
        { token: 'string.math.inline', foreground: 'aa0000' },
        { token: 'delimiter.curly', foreground: '666666', fontStyle: 'bold' },
        { token: 'delimiter.square', foreground: '666666' },
        { token: 'delimiter.math', foreground: 'aa0000', fontStyle: 'bold' },
        { token: 'number', foreground: '098658' },
        { token: 'number.math', foreground: '098658', fontStyle: 'bold' },
        { token: 'string', foreground: 'a31515' },
        // 数学运算符专用颜色
        { token: 'operator.math.super-sub', foreground: 'e91e63', fontStyle: 'bold' }, // 上下标 ^_
        { token: 'operator.math.binary', foreground: '9c27b0', fontStyle: 'bold' },   // 二元运算符 +-*=<>
        { token: 'operator.math.logical', foreground: '673ab7', fontStyle: 'bold' },  // 逻辑运算符 !&|~
        { token: 'punctuation.math', foreground: '795548' }                          // 标点符号 ,:;
      ],
      colors: {}
    });

    monaco.editor.defineTheme('latex-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword.control', foreground: '569cd6', fontStyle: 'bold' },
        { token: 'keyword.operator', foreground: 'ff9900' },
        { token: 'keyword.operator.math', foreground: 'ff9900' },
        { token: 'keyword', foreground: '4fc1ff' },
        { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
        { token: 'string.math', foreground: 'ff6b6b' },
        { token: 'string.math.display', foreground: 'ff6b6b', fontStyle: 'bold' },
        { token: 'string.math.inline', foreground: 'ff6b6b' },
        { token: 'delimiter.curly', foreground: 'ffd700', fontStyle: 'bold' },
        { token: 'delimiter.square', foreground: 'ffd700' },
        { token: 'delimiter.math', foreground: 'ff6b6b', fontStyle: 'bold' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'number.math', foreground: 'b5cea8', fontStyle: 'bold' },
        { token: 'string', foreground: 'ce9178' },
        // 数学运算符专用颜色（暗色主题）
        { token: 'operator.math.super-sub', foreground: 'ff4081', fontStyle: 'bold' }, // 上下标 ^_ (粉红色)
        { token: 'operator.math.binary', foreground: 'ba68c8', fontStyle: 'bold' },   // 二元运算符 +-*=<> (紫色)
        { token: 'operator.math.logical', foreground: '9575cd', fontStyle: 'bold' },  // 逻辑运算符 !&|~ (深紫色)
        { token: 'punctuation.math', foreground: 'a1887f' }                          // 标点符号 ,:; (棕色)
      ],
      colors: {}
    });
  }
}
