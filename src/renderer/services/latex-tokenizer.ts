export interface TokenizeOptions {
  includeMath?: boolean;
  includeComments?: boolean;
  maxTokens?: number;
}

export interface LaTeXToken {
  type: 'command' | 'environment' | 'math' | 'comment' | 'text' | 'delimiter';
  value: string;
  start: number;
  end: number;
  line: number;
  column: number;
}

export class LaTeXTokenizer {
  private static readonly COMMAND_REGEX = /\\[a-zA-Z@]+\*?/g;
  private static readonly ENVIRONMENT_BEGIN_REGEX = /\\begin\{([^}]+)\}/g;
  private static readonly ENVIRONMENT_END_REGEX = /\\end\{([^}]+)\}/g;
  private static readonly MATH_DISPLAY_REGEX = /\$\$[\s\S]*?\$\$/g;
  private static readonly MATH_INLINE_REGEX = /\$[^$\n]*\$/g;
  private static readonly COMMENT_REGEX = /%.*$/gm;

  async tokenize(content: string, options: TokenizeOptions = {}): Promise<LaTeXToken[]> {
    const tokens: LaTeXToken[] = [];
    const lines = content.split('\n');
    
    let globalOffset = 0;
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineTokens = this.tokenizeLine(line, lineIndex, globalOffset, options);
      tokens.push(...lineTokens);
      globalOffset += line.length + 1; // +1 for newline
    }
    
    return this.sortTokens(tokens);
  }

  private tokenizeLine(
    line: string, 
    lineNumber: number, 
    lineOffset: number, 
    options: TokenizeOptions
  ): LaTeXToken[] {
    const tokens: LaTeXToken[] = [];
    
    // Tokenize comments first (they override everything else)
    if (options.includeComments !== false) {
      const commentMatch = line.match(/%.*$/);
      if (commentMatch && commentMatch.index !== undefined) {
        tokens.push({
          type: 'comment',
          value: commentMatch[0],
          start: lineOffset + commentMatch.index,
          end: lineOffset + commentMatch.index + commentMatch[0].length,
          line: lineNumber,
          column: commentMatch.index,
        });
        
        // Only process content before the comment
        line = line.substring(0, commentMatch.index);
      }
    }
    
    // Tokenize math expressions
    if (options.includeMath !== false) {
      tokens.push(...this.tokenizeMath(line, lineNumber, lineOffset));
    }
    
    // Tokenize commands
    tokens.push(...this.tokenizeCommands(line, lineNumber, lineOffset));
    
    // Tokenize environments
    tokens.push(...this.tokenizeEnvironments(line, lineNumber, lineOffset));
    
    // Tokenize delimiters
    tokens.push(...this.tokenizeDelimiters(line, lineNumber, lineOffset));
    
    return tokens;
  }

  private tokenizeMath(line: string, lineNumber: number, lineOffset: number): LaTeXToken[] {
    const tokens: LaTeXToken[] = [];
    
    // Display math ($$...$$)
    let match;
    const displayRegex = /\$\$([^$]*)\$\$/g;
    while ((match = displayRegex.exec(line)) !== null) {
      tokens.push({
        type: 'math',
        value: match[0],
        start: lineOffset + match.index,
        end: lineOffset + match.index + match[0].length,
        line: lineNumber,
        column: match.index,
      });
    }
    
    // Inline math ($...$) - avoid matching display math
    const inlineRegex = /(?<!\$)\$([^$\n]+)\$(?!\$)/g;
    while ((match = inlineRegex.exec(line)) !== null) {
      tokens.push({
        type: 'math',
        value: match[0],
        start: lineOffset + match.index,
        end: lineOffset + match.index + match[0].length,
        line: lineNumber,
        column: match.index,
      });
    }
    
    return tokens;
  }

  private tokenizeCommands(line: string, lineNumber: number, lineOffset: number): LaTeXToken[] {
    const tokens: LaTeXToken[] = [];
    const regex = /\\[a-zA-Z@]+\*?/g;
    let match;
    
    while ((match = regex.exec(line)) !== null) {
      tokens.push({
        type: 'command',
        value: match[0],
        start: lineOffset + match.index,
        end: lineOffset + match.index + match[0].length,
        line: lineNumber,
        column: match.index,
      });
    }
    
    return tokens;
  }

  private tokenizeEnvironments(line: string, lineNumber: number, lineOffset: number): LaTeXToken[] {
    const tokens: LaTeXToken[] = [];
    
    // Begin environments
    const beginRegex = /\\begin\{([^}]+)\}/g;
    let match;
    while ((match = beginRegex.exec(line)) !== null) {
      tokens.push({
        type: 'environment',
        value: match[0],
        start: lineOffset + match.index,
        end: lineOffset + match.index + match[0].length,
        line: lineNumber,
        column: match.index,
      });
    }
    
    // End environments
    const endRegex = /\\end\{([^}]+)\}/g;
    while ((match = endRegex.exec(line)) !== null) {
      tokens.push({
        type: 'environment',
        value: match[0],
        start: lineOffset + match.index,
        end: lineOffset + match.index + match[0].length,
        line: lineNumber,
        column: match.index,
      });
    }
    
    return tokens;
  }

  private tokenizeDelimiters(line: string, lineNumber: number, lineOffset: number): LaTeXToken[] {
    const tokens: LaTeXToken[] = [];
    const delimiters = ['{', '}', '[', ']', '(', ')'];
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (delimiters.includes(char)) {
        tokens.push({
          type: 'delimiter',
          value: char,
          start: lineOffset + i,
          end: lineOffset + i + 1,
          line: lineNumber,
          column: i,
        });
      }
    }
    
    return tokens;
  }

  private sortTokens(tokens: LaTeXToken[]): LaTeXToken[] {
    return tokens.sort((a, b) => a.start - b.start);
  }

  dispose(): void {
    // Cleanup if needed
  }
}