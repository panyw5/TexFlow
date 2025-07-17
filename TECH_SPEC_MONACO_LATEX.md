# Monaco Editor LaTeX Integration Technical Specification

## Overview
This document provides detailed technical specifications for integrating Monaco Editor with comprehensive LaTeX support, including syntax highlighting, autocomplete, and error detection.

## Monaco Editor LaTeX Language Service Architecture

### 1. Language Definition Structure
```typescript
// monaco-latex-language.ts
export const LaTeXLanguageConfig: monaco.languages.LanguageConfiguration = {
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
};
```

### 2. LaTeX Tokenizer Implementation
```typescript
// latex-tokenizer.ts
export const LaTeXTokenizer: monaco.languages.IMonarchLanguage = {
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
};
```

### 3. LaTeX Command Database
```typescript
// latex-commands.ts
export interface LaTeXCommand {
  command: string;
  description: string;
  category: LaTeXCategory;
  parameters: LaTeXParameter[];
  example: string;
  documentation?: string;
  insertText?: string;
  kind: monaco.languages.CompletionItemKind;
}

export interface LaTeXParameter {
  name: string;
  type: 'required' | 'optional';
  description: string;
  default?: string;
}

export type LaTeXCategory = 
  | 'math-symbols'
  | 'math-operators'
  | 'math-functions'
  | 'environments'
  | 'formatting'
  | 'structure'
  | 'references';

export const LATEX_COMMANDS: LaTeXCommand[] = [
  {
    command: 'frac',
    description: 'Creates a fraction',
    category: 'math-operators',
    parameters: [
      { name: 'numerator', type: 'required', description: 'The numerator' },
      { name: 'denominator', type: 'required', description: 'The denominator' }
    ],
    example: '\\frac{1}{2}',
    insertText: '\\frac{${1:numerator}}{${2:denominator}}',
    kind: monaco.languages.CompletionItemKind.Function,
  },
  // ... more commands
];
```

### 4. Autocomplete Provider
```typescript
// latex-completion-provider.ts
export class LaTeXCompletionProvider implements monaco.languages.CompletionItemProvider {
  
  provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };

    // Get context (are we in math mode?)
    const mathContext = this.getMathContext(model, position);
    
    // Filter commands based on context
    const suggestions = this.getFilteredSuggestions(word.word, mathContext);
    
    return {
      suggestions: suggestions.map(cmd => ({
        label: cmd.command,
        kind: cmd.kind,
        documentation: {
          value: this.formatDocumentation(cmd),
          isTrusted: true,
        },
        insertText: cmd.insertText || cmd.command,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
        detail: cmd.description,
        sortText: this.getSortText(cmd, word.word),
      })),
    };
  }

  private getMathContext(model: monaco.editor.ITextModel, position: monaco.Position): MathContext {
    // Analyze surrounding text to determine if we're in math mode
    const lineContent = model.getLineContent(position.lineNumber);
    const beforeCursor = lineContent.substring(0, position.column - 1);
    
    // Check for inline math ($...$)
    const inlineMathMatches = beforeCursor.match(/\$/g);
    const isInInlineMath = inlineMathMatches && inlineMathMatches.length % 2 === 1;
    
    // Check for display math ($$...$$)
    const displayMathMatches = beforeCursor.match(/\$\$/g);
    const isInDisplayMath = displayMathMatches && displayMathMatches.length % 2 === 1;
    
    // Check for math environments
    const mathEnvironments = ['equation', 'align', 'gather', 'multline'];
    const isInMathEnvironment = this.isInEnvironment(model, position, mathEnvironments);
    
    return {
      isInMath: isInInlineMath || isInDisplayMath || isInMathEnvironment,
      mathType: isInDisplayMath ? 'display' : isInInlineMath ? 'inline' : 'environment',
    };
  }
}
```

### 5. Syntax Error Detection
```typescript
// latex-diagnostics-provider.ts
export class LaTeXDiagnosticsProvider {
  
  async validateDocument(model: monaco.editor.ITextModel): Promise<monaco.editor.IMarkerData[]> {
    const content = model.getValue();
    const diagnostics: monaco.editor.IMarkerData[] = [];
    
    // Check for unmatched braces
    diagnostics.push(...this.checkUnmatchedBraces(content, model));
    
    // Check for unmatched math delimiters
    diagnostics.push(...this.checkUnmatchedMathDelimiters(content, model));
    
    // Check for unknown commands
    diagnostics.push(...this.checkUnknownCommands(content, model));
    
    // Check for environment mismatches
    diagnostics.push(...this.checkEnvironmentMismatches(content, model));
    
    return diagnostics;
  }

  private checkUnmatchedBraces(content: string, model: monaco.editor.ITextModel): monaco.editor.IMarkerData[] {
    const diagnostics: monaco.editor.IMarkerData[] = [];
    const stack: Array<{ char: string; position: monaco.Position }> = [];
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const position = model.getPositionAt(i);
      
      if (char === '{') {
        stack.push({ char, position });
      } else if (char === '}') {
        if (stack.length === 0) {
          diagnostics.push({
            severity: monaco.MarkerSeverity.Error,
            message: 'Unmatched closing brace',
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column + 1,
          });
        } else {
          stack.pop();
        }
      }
    }
    
    // Check for unmatched opening braces
    stack.forEach(item => {
      diagnostics.push({
        severity: monaco.MarkerSeverity.Error,
        message: 'Unmatched opening brace',
        startLineNumber: item.position.lineNumber,
        startColumn: item.position.column,
        endLineNumber: item.position.lineNumber,
        endColumn: item.position.column + 1,
      });
    });
    
    return diagnostics;
  }
}
```

## Integration with React Component

### Monaco Editor React Wrapper
```typescript
// components/LaTeXEditor.tsx
import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { LaTeXLanguageService } from '../services/latex-language-service';

interface LaTeXEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: 'light' | 'dark';
}

export const LaTeXEditor: React.FC<LaTeXEditorProps> = ({ value, onChange, theme }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      // Register LaTeX language
      LaTeXLanguageService.register();
      
      // Create editor instance
      monacoRef.current = monaco.editor.create(editorRef.current, {
        value,
        language: 'latex',
        theme: theme === 'dark' ? 'vs-dark' : 'vs',
        fontSize: 14,
        lineNumbers: 'on',
        minimap: { enabled: false },
        wordWrap: 'on',
        automaticLayout: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false,
        },
      });

      // Set up change listener
      monacoRef.current.onDidChangeModelContent(() => {
        const newValue = monacoRef.current?.getValue() || '';
        onChange(newValue);
      });
    }

    return () => {
      monacoRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (monacoRef.current && value !== monacoRef.current.getValue()) {
      monacoRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (monacoRef.current) {
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }
  }, [theme]);

  return <div ref={editorRef} style={{ height: '100%', width: '100%' }} />;
};
```

## Performance Optimizations

### 1. Debounced Validation
```typescript
// Debounce syntax validation to avoid excessive computation
const debouncedValidation = debounce((model: monaco.editor.ITextModel) => {
  LaTeXDiagnosticsProvider.validateDocument(model);
}, 300);
```

### 2. Incremental Parsing
```typescript
// Only re-parse changed sections of the document
class IncrementalLaTeXParser {
  private lastParsedVersion: number = 0;
  private cachedTokens: Map<number, LaTeXToken[]> = new Map();
  
  parseIncremental(model: monaco.editor.ITextModel): LaTeXToken[] {
    const currentVersion = model.getVersionId();
    if (currentVersion === this.lastParsedVersion) {
      return this.getCachedTokens();
    }
    
    // Only re-parse changed lines
    const changes = model.getValueInRange(/* changed range */);
    // ... incremental parsing logic
  }
}
```

### 3. Lazy Loading of Command Database
```typescript
// Load command database progressively
class LazyCommandDatabase {
  private loadedCategories: Set<LaTeXCategory> = new Set();
  
  async getCommands(category: LaTeXCategory): Promise<LaTeXCommand[]> {
    if (!this.loadedCategories.has(category)) {
      await this.loadCategory(category);
      this.loadedCategories.add(category);
    }
    return this.commands.get(category) || [];
  }
}
```

## Testing Strategy

### Unit Tests
- LaTeX tokenizer accuracy
- Command database completeness
- Autocomplete provider functionality
- Diagnostics provider accuracy

### Integration Tests
- Editor-preview synchronization
- Real-time validation
- Performance under load

### E2E Tests
- Complete user workflows
- Keyboard shortcuts
- Error handling scenarios
