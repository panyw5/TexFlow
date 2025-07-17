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

    // Register completion provider with trigger characters
    monaco.languages.registerCompletionItemProvider('latex', {
      triggerCharacters: ['\\'],
      provideCompletionItems: (model, position, context) => {
        const provider = new LaTeXCompletionProvider();
        return provider.provideCompletionItems(model, position, context);
      }
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

    console.log('=== LaTeX Completion Provider Called ===');

    const lineContent = model.getLineContent(position.lineNumber);
    const beforeCursor = lineContent.substring(0, position.column - 1);

    console.log('Completion triggered:', {
      beforeCursor,
      triggerCharacter: context.triggerCharacter,
      triggerKind: context.triggerKind,
      position: position.column
    });

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
    } else if (beforeCursor.endsWith('\\')) {
      // Just typed a backslash
      word = '';
      range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: position.column - 1, // Include the \
        endColumn: position.column,
      };
      console.log('Just typed backslash:', { word, beforeCursor, range });
    } else {
      // Not a LaTeX command context
      console.log('Not a LaTeX command context, skipping');
      return { suggestions: [] };
    }

    // Get context (are we in math mode?)
    const mathContext = this.getMathContext(model, position);

    // Filter commands based on context and input
    const suggestions = this.getFilteredSuggestions(word, mathContext);
    console.log('Filtered suggestions:', {
      word,
      wordLength: word.length,
      suggestionsCount: suggestions.length,
      firstFew: suggestions.slice(0, 5).map(s => s.command),
      mathContext: mathContext.isInMath
    });

    // Generate suggestions from LATEX_COMMANDS using the same simple format
    const filteredSuggestions = word === '' ?
      suggestions.slice(0, 15) : // Show top 15 when no input
      suggestions.filter(cmd => cmd.command.toLowerCase().startsWith(word.toLowerCase())).slice(0, 15);

    const completionItems = filteredSuggestions.map(cmd => {
      // Use the insertText if available (for snippets like environments), otherwise just the command
      let insertText = cmd.insertText || cmd.command;

      // Remove leading backslash if present, Monaco will add it
      if (insertText.startsWith('\\')) {
        insertText = insertText.substring(1);
      }

      return {
        label: cmd.command,
        kind: cmd.kind,
        insertText: insertText,
        insertTextRules: cmd.insertText ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
      };
    });

    console.log('Returning LaTeX completion items:', {
      count: completionItems.length,
      word: word,
      firstFew: completionItems.slice(0, 3).map(item => ({ label: item.label, insertText: item.insertText })),
      position: position
    });

    return {
      suggestions: completionItems,
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

    console.log('getFilteredSuggestions called:', {
      input: lowerInput,
      inputLength: lowerInput.length,
      totalCommands: LATEX_COMMANDS.length,
      mathContext: mathContext.isInMath
    });

    const filtered = LATEX_COMMANDS.filter(cmd => {
      // Filter by input match - check if command starts with input
      // If input is empty (just typed \), show all commands
      const matchesInput = lowerInput === '' || cmd.command.toLowerCase().startsWith(lowerInput);

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

    console.log('Filtering result:', {
      input: lowerInput,
      filteredCount: filtered.length,
      firstFew: filtered.slice(0, 5).map(cmd => cmd.command),
      lambdaFound: filtered.find(cmd => cmd.command === 'lambda')
    });

    // If no input, prioritize common commands
    if (lowerInput === '') {
      const commonCommands = ['alpha', 'beta', 'gamma', 'lambda', 'mu', 'pi', 'sigma', 'frac', 'sqrt', 'sum', 'int', 'lim'];
      const prioritized = filtered.sort((a, b) => {
        const aIndex = commonCommands.indexOf(a.command);
        const bIndex = commonCommands.indexOf(b.command);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.command.localeCompare(b.command);
      });
      return prioritized.slice(0, 20);
    }

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
