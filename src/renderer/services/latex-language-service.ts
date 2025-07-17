import * as monaco from 'monaco-editor';
import { LATEX_COMMANDS, LaTeXCommand } from '../data/latex-commands';

export class LaTeXLanguageService {
  private static isRegistered = false;

  public static register(): void {
    if (this.isRegistered) {
      return;
    }

    // Register the LaTeX language
    monaco.languages.register({ id: 'latex' });

    // Set language configuration
    monaco.languages.setLanguageConfiguration('latex', {
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
      folding: {
        markers: {
          start: new RegExp('^\\s*\\\\begin\\{([^}]+)\\}'),
          end: new RegExp('^\\s*\\\\end\\{([^}]+)\\}'),
        },
      },
    });

    // Set tokenizer
    monaco.languages.setMonarchTokensProvider('latex', {
      tokenizer: {
        root: [
          // Math environments
          [/\$\$/, 'math.display', '@displayMath'],
          [/\$/, 'math.inline', '@inlineMath'],
          
          // Commands
          [/\\[a-zA-Z@]+/, 'command'],
          [/\\[^a-zA-Z@]/, 'command.special'],
          
          // Environments
          [/\\begin\{([^}]+)\}/, ['environment.begin', 'environment.name']],
          [/\\end\{([^}]+)\}/, ['environment.end', 'environment.name']],
          
          // Comments
          [/%.*$/, 'comment'],
          
          // Braces and brackets
          [/[{}]/, 'delimiter.curly'],
          [/[\[\]]/, 'delimiter.square'],
          [/[()]/, 'delimiter.parenthesis'],
          
          // Text
          [/[^\\$%{}[\]()]+/, 'text'],
        ],
        
        displayMath: [
          [/\$\$/, 'math.display', '@pop'],
          [/\\[a-zA-Z@]+/, 'command.math'],
          [/[^\\$]+/, 'math.content'],
        ],
        
        inlineMath: [
          [/\$/, 'math.inline', '@pop'],
          [/\\[a-zA-Z@]+/, 'command.math'],
          [/[^\\$]+/, 'math.content'],
        ],
      },
    });

    // Set theme
    monaco.editor.defineTheme('latex-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'command', foreground: '#569cd6' },
        { token: 'command.special', foreground: '#569cd6' },
        { token: 'command.math', foreground: '#4ec9b0' },
        { token: 'environment.begin', foreground: '#c586c0' },
        { token: 'environment.end', foreground: '#c586c0' },
        { token: 'environment.name', foreground: '#ce9178' },
        { token: 'math.display', foreground: '#d7ba7d' },
        { token: 'math.inline', foreground: '#d7ba7d' },
        { token: 'math.content', foreground: '#dcdcaa' },
        { token: 'comment', foreground: '#6a9955', fontStyle: 'italic' },
        { token: 'delimiter.curly', foreground: '#ffd700' },
        { token: 'delimiter.square', foreground: '#da70d6' },
        { token: 'delimiter.parenthesis', foreground: '#87ceeb' },
        { token: 'text', foreground: '#d4d4d4' },
      ],
      colors: {},
    });

    monaco.editor.defineTheme('latex-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'command', foreground: '#0000ff' },
        { token: 'command.special', foreground: '#0000ff' },
        { token: 'command.math', foreground: '#008080' },
        { token: 'environment.begin', foreground: '#800080' },
        { token: 'environment.end', foreground: '#800080' },
        { token: 'environment.name', foreground: '#a31515' },
        { token: 'math.display', foreground: '#795e26' },
        { token: 'math.inline', foreground: '#795e26' },
        { token: 'math.content', foreground: '#795e26' },
        { token: 'comment', foreground: '#008000', fontStyle: 'italic' },
        { token: 'delimiter.curly', foreground: '#ff8c00' },
        { token: 'delimiter.square', foreground: '#9932cc' },
        { token: 'delimiter.parenthesis', foreground: '#0000cd' },
        { token: 'text', foreground: '#000000' },
      ],
      colors: {},
    });

    // Register completion provider
    monaco.languages.registerCompletionItemProvider('latex', new LaTeXCompletionProvider(), {
      triggerCharacters: ['\\', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
    });

    // Register hover provider
    monaco.languages.registerHoverProvider('latex', new LaTeXHoverProvider());

    this.isRegistered = true;
  }
}

class LaTeXCompletionProvider implements monaco.languages.CompletionItemProvider {
  provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {

    const lineContent = model.getLineContent(position.lineNumber);
    const beforeCursor = lineContent.substring(0, position.column - 1);

    // Check if we're after a backslash
    const backslashMatch = beforeCursor.match(/\\([a-zA-Z]*)$/);

    let word: string;
    let range: monaco.IRange;

    if (backslashMatch) {
      // We're completing a LaTeX command after \
      word = backslashMatch[1]; // Get the part after \
      range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: position.column - word.length - 1, // Include the \
        endColumn: position.column,
      };
      console.log('Backslash completion:', { word, beforeCursor, range });
    } else {
      // Regular word completion
      const wordInfo = model.getWordUntilPosition(position);
      word = wordInfo.word;
      range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: wordInfo.startColumn,
        endColumn: wordInfo.endColumn,
      };
      console.log('Regular completion:', { word, range });
    }

    // Get context (are we in math mode?)
    const mathContext = this.getMathContext(model, position);

    // Filter commands based on context and input
    const suggestions = this.getFilteredSuggestions(word, mathContext);
    console.log('Filtered suggestions:', { word, suggestionsCount: suggestions.length, firstFew: suggestions.slice(0, 3).map(s => s.command) });

    return {
      suggestions: suggestions.map(cmd => {
        let insertText = cmd.insertText || cmd.command;

        // Ensure insertText always starts with backslash for LaTeX commands
        if (!insertText.startsWith('\\')) {
          insertText = '\\' + insertText;
        }

        return {
          label: cmd.command,
          kind: cmd.kind,
          documentation: {
            value: this.formatDocumentation(cmd),
            isTrusted: true,
          },
          insertText: insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range,
          detail: cmd.description,
          sortText: this.getSortText(cmd, word),
        };
      }),
    };
  }

  private getMathContext(model: monaco.editor.ITextModel, position: monaco.Position): MathContext {
    const lineContent = model.getLineContent(position.lineNumber);
    const beforeCursor = lineContent.substring(0, position.column - 1);
    
    // Check for inline math ($...$)
    const inlineMathMatches = beforeCursor.match(/\$/g);
    const isInInlineMath = inlineMathMatches && inlineMathMatches.length % 2 === 1;
    
    // Check for display math ($$...$$)
    const displayMathMatches = beforeCursor.match(/\$\$/g);
    const isInDisplayMath = displayMathMatches && displayMathMatches.length % 2 === 1;
    
    // Check for math environments
    const mathEnvironments = ['equation', 'align', 'gather', 'multline', 'eqnarray'];
    const isInMathEnvironment = this.isInEnvironment(model, position, mathEnvironments);
    
    return {
      isInMath: isInInlineMath || isInDisplayMath || isInMathEnvironment,
      mathType: isInDisplayMath ? 'display' : isInInlineMath ? 'inline' : 'environment',
    };
  }

  private isInEnvironment(model: monaco.editor.ITextModel, position: monaco.Position, environments: string[]): boolean {
    const content = model.getValue();
    const offset = model.getOffsetAt(position);
    
    for (const env of environments) {
      const beginRegex = new RegExp(`\\\\begin\\{${env}\\}`, 'g');
      const endRegex = new RegExp(`\\\\end\\{${env}\\}`, 'g');
      
      let beginMatch;
      let endMatch;
      let inEnvironment = false;
      
      while ((beginMatch = beginRegex.exec(content)) !== null) {
        if (beginMatch.index < offset) {
          inEnvironment = true;
          endRegex.lastIndex = beginMatch.index;
          
          while ((endMatch = endRegex.exec(content)) !== null) {
            if (endMatch.index > beginMatch.index && endMatch.index < offset) {
              inEnvironment = false;
              break;
            }
          }
        }
      }
      
      if (inEnvironment) {
        return true;
      }
    }
    
    return false;
  }

  private getFilteredSuggestions(input: string, mathContext: MathContext): LaTeXCommand[] {
    const lowerInput = input.toLowerCase();

    const filtered = LATEX_COMMANDS.filter(cmd => {
      // Filter by input match - check if command starts with input
      const matchesInput = cmd.command.toLowerCase().startsWith(lowerInput);

      if (!matchesInput) return false;

      // Filter by context
      if (mathContext.isInMath) {
        // In math mode, prioritize math-related commands
        return ['math-symbols', 'math-operators', 'math-functions', 'greek-letters', 'arrows', 'delimiters'].includes(cmd.category);
      } else {
        // Outside math mode, show all commands
        return true;
      }
    });

    console.log('Filtering debug:', {
      input: lowerInput,
      totalCommands: LATEX_COMMANDS.length,
      filteredCount: filtered.length,
      lambdaMatch: LATEX_COMMANDS.find(cmd => cmd.command === 'lambda'),
      lambdaStartsWith: 'lambda'.startsWith(lowerInput)
    });

    return filtered.slice(0, 20); // Limit to 20 suggestions
  }

  private formatDocumentation(cmd: LaTeXCommand): string {
    let doc = `**${cmd.command}**\n\n${cmd.description}\n\n`;
    
    if (cmd.parameters.length > 0) {
      doc += '**Parameters:**\n';
      cmd.parameters.forEach(param => {
        doc += `- \`${param.name}\` (${param.type}): ${param.description}\n`;
      });
      doc += '\n';
    }
    
    doc += `**Example:**\n\`\`\`latex\n${cmd.example}\n\`\`\``;
    
    return doc;
  }

  private getSortText(cmd: LaTeXCommand, input: string): string {
    const lowerInput = input.toLowerCase();
    const lowerCommand = cmd.command.toLowerCase();
    
    // Exact match gets highest priority
    if (lowerCommand === lowerInput) return '0' + cmd.command;
    
    // Starts with input gets second priority
    if (lowerCommand.startsWith(lowerInput)) return '1' + cmd.command;
    
    // Contains input gets third priority
    if (lowerCommand.includes(lowerInput)) return '2' + cmd.command;
    
    // Everything else
    return '3' + cmd.command;
  }
}

class LaTeXHoverProvider implements monaco.languages.HoverProvider {
  provideHover(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.languages.ProviderResult<monaco.languages.Hover> {
    
    const word = model.getWordAtPosition(position);
    if (!word) return null;
    
    const command = LATEX_COMMANDS.find(cmd => cmd.command === word.word);
    if (!command) return null;
    
    const documentation = this.formatHoverDocumentation(command);
    
    return {
      range: new monaco.Range(
        position.lineNumber,
        word.startColumn,
        position.lineNumber,
        word.endColumn
      ),
      contents: [
        { value: documentation }
      ],
    };
  }

  private formatHoverDocumentation(cmd: LaTeXCommand): string {
    let doc = `**\\${cmd.command}**\n\n${cmd.description}`;
    
    if (cmd.parameters.length > 0) {
      doc += '\n\n**Parameters:**\n';
      cmd.parameters.forEach(param => {
        doc += `- \`${param.name}\` (${param.type}): ${param.description}\n`;
      });
    }
    
    return doc;
  }
}

interface MathContext {
  isInMath: boolean;
  mathType: 'inline' | 'display' | 'environment';
}
