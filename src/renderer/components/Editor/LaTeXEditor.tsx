import React, { useEffect, useRef, useCallback } from 'react';
// 临时使用完整Monaco Editor进行测试
import { editor, defaultEditorOptions, themes, Position, Range, KeyMod, KeyCode, monaco } from '../../services/monaco-full-test';
import { LaTeXLanguageService } from '../../services/latex-language-service-optimized';

interface LaTeXEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: 'light' | 'dark';
  fontSize?: number;
  readOnly?: boolean;
  onCopyToClipboard?: () => void;
  isCopied?: boolean;
}

export const LaTeXEditor = React.forwardRef<any, LaTeXEditorProps>(({
  value,
  onChange,
  theme,
  fontSize = 28, // Doubled from 14
  readOnly = false,
  onCopyToClipboard,
  isCopied = false
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const valueRef = useRef(value);

  // Update value ref when prop changes
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    // Configure Monaco worker before creating editor
    (window as any).MonacoEnvironment = {
      getWorkerUrl: function (moduleId: string, label: string) {
        if (label === 'json') {
          return '/monaco-editor/esm/vs/language/json/json.worker.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return '/monaco-editor/esm/vs/language/css/css.worker.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return '/monaco-editor/esm/vs/language/html/html.worker.js';
        }
        if (label === 'typescript' || label === 'javascript') {
          return '/monaco-editor/esm/vs/language/typescript/ts.worker.js';
        }
        return '/monaco-editor/esm/vs/editor/editor.worker.js';
      }
    };

    // Register LaTeX language service
    LaTeXLanguageService.register();

    // Create editor instance
    monacoRef.current = editor.create(editorRef.current, {
      value,
      language: 'latex',
      theme: theme === 'dark' ? 'latex-dark' : 'latex-light',
      fontSize,
      readOnly,
      fontFamily: "'SF Mono', Monaco, Inconsolata, 'Roboto Mono', Consolas, 'Courier New', monospace",
      lineNumbers: 'on',
      minimap: { enabled: false },
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      // 自动完成配置
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showVariables: true,
        filterGraceful: true,
        snippetsPreventQuickSuggestions: false,
        localityBonus: true,
        shareSuggestSelections: false,
        showIcons: true,
        insertMode: 'replace',
        // 强制启用建议，但禁用单词建议以避免显示之前输入的内容
        showWords: false,
        showColors: false,
        showFields: true,
        showConstants: true,
        showConstructors: true,
        showEnums: true,
        showEvents: true,
        showFiles: false,
        showFolders: false,
        showInterfaces: true,
        showIssues: false,
        showMethods: true,
        showModules: true,
        showOperators: true,
        showProperties: true,
        showReferences: true,
        showStructs: true,
        showTypeParameters: true,
        showUnits: false,
        showUsers: false,
        showValues: true,
      },
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      quickSuggestionsDelay: 10, // 更快的触发
      parameterHints: {
        enabled: true,
      },
      hover: { enabled: false },
      folding: false,
      foldingStrategy: 'auto',
      showFoldingControls: 'never',
      bracketPairColorization: { enabled: false },
      guides: { bracketPairs: false, indentation: false },
      renderWhitespace: 'none',
      renderControlCharacters: false,
      smoothScrolling: false,
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: 'off',
      overviewRulerLanes: 0,
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
        verticalSliderSize: 8,
        horizontalSliderSize: 8,
        alwaysConsumeMouseWheel: false
      },
    });

    // Set up change listener
    const disposable = monacoRef.current.onDidChangeModelContent(() => {
      const newValue = monacoRef.current?.getValue() || '';
      if (newValue !== valueRef.current) {
        onChange(newValue);
      }
    });

    // Set up keyboard shortcuts
    monacoRef.current.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {
      // Save command - will be handled by parent
      console.log('Save shortcut triggered');
    });

    // Add expand selection to next bracket command (Cmd+Shift+M)
    monacoRef.current.addCommand(KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyM, () => {
      expandSelectionToNextBracket();
    });

    // Add listener for content changes to debug trigger issues
    monacoRef.current.onDidChangeModelContent((e: any) => {
      const model = monacoRef.current?.getModel();
      const position = monacoRef.current?.getPosition();
      if (model && position) {
        const lineContent = model.getLineContent(position.lineNumber);
        const beforeCursor = lineContent.substring(0, position.column - 1);
        console.log('Content changed:', {
          beforeCursor,
          lastChar: beforeCursor.slice(-1),
          position: position.column
        });
        
        // 强制触发自动完成
        if (beforeCursor.endsWith('\\')) {
          console.log('🚀 Manually triggering suggestions for backslash');
          setTimeout(() => {
            if (monacoRef.current) {
              // 使用完整Monaco Editor的trigger功能
              try {
                monacoRef.current.trigger('keyboard', 'editor.action.triggerSuggest', {});
              } catch (e) {
                console.log('triggerSuggest failed:', e);
                // 如果失败，尝试其他方式
                const position = monacoRef.current.getPosition();
                if (position) {
                  monacoRef.current.focus();
                }
              }
            }
          }, 100);
        }
      }
    });

    // Focus the editor
    monacoRef.current.focus();

    return () => {
      disposable.dispose();
      monacoRef.current?.dispose();
    };
  }, []); // Only run once on mount

  // Update editor value when prop changes
  useEffect(() => {
    if (monacoRef.current && value !== monacoRef.current.getValue()) {
      const editor = monacoRef.current;
      const model = editor.getModel();
      
      if (model) {
        // Preserve cursor position
        const position = editor.getPosition();
        const scrollTop = editor.getScrollTop();
        
        // Update value
        model.setValue(value);
        
        // Restore cursor position and scroll
        if (position) {
          editor.setPosition(position);
        }
        editor.setScrollTop(scrollTop);
      }
    }
  }, [value]);

  // Update theme
  useEffect(() => {
    if (monacoRef.current) {
      const themeToUse = theme === 'dark' ? 'latex-dark' : 'latex-light';
      monaco.editor.setTheme(themeToUse);
    }
  }, [theme]);

  // Update font size
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.updateOptions({ fontSize });
    }
  }, [fontSize]);

  // Update read-only state
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.updateOptions({ readOnly });
    }
  }, [readOnly]);

  // Public methods
  const insertText = useCallback((text: string) => {
    if (monacoRef.current) {
      const editor = monacoRef.current;
      const position = editor.getPosition();
      
      if (position) {
        editor.executeEdits('insert-text', [
          {
            range: new Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
            text,
          },
        ]);
        
        // Move cursor to end of inserted text
        const newPosition = new Position(
          position.lineNumber,
          position.column + text.length
        );
        editor.setPosition(newPosition);
        editor.focus();
      }
    }
  }, []);

  const getSelectedText = useCallback((): string => {
    if (monacoRef.current) {
      const selection = monacoRef.current.getSelection();
      if (selection && !selection.isEmpty()) {
        return monacoRef.current.getModel()?.getValueInRange(selection) || '';
      }
    }
    return '';
  }, []);

  // Function to expand selection to next bracket
  const expandSelectionToNextBracket = useCallback(() => {
    if (!monacoRef.current) return;

    const editor = monacoRef.current;
    const model = editor.getModel();
    if (!model) return;

    const position = editor.getPosition();
    if (!position) return;

    const currentSelection = editor.getSelection();
    if (!currentSelection) return;

    // Define bracket pairs
    const bracketPairs = [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '$', close: '$' },  // LaTeX inline math
    ];

    const text = model.getValue();
    const startOffset = model.getOffsetAt(new Position(currentSelection.startLineNumber, currentSelection.startColumn));
    const endOffset = model.getOffsetAt(new Position(currentSelection.endLineNumber, currentSelection.endColumn));

    // Find all bracket pairs that contain the current selection
    let allMatches: { start: number; end: number; type: string; size: number }[] = [];

    for (const bracketPair of bracketPairs) {
      // Find all bracket pairs of this type
      const matches = findBracketPairs(text, bracketPair.open, bracketPair.close);
      
      for (const match of matches) {
        // Check if this bracket pair contains the current selection
        const contains = match.start < startOffset && match.end > endOffset;
        
        if (contains) {
          allMatches.push({
            start: match.start,
            end: match.end,
            type: bracketPair.open + bracketPair.close,
            size: match.end - match.start
          });
        }
      }
    }

    if (allMatches.length === 0) return;

    // Sort by size (smallest first) to get the next level of expansion
    allMatches.sort((a, b) => a.size - b.size);

    // Find the smallest bracket pair that's larger than current selection
    const currentSize = endOffset - startOffset;
    const nextMatch = allMatches.find(match => match.size > currentSize);

    if (nextMatch) {
      const startPos = model.getPositionAt(nextMatch.start + 1); // Start after the opening bracket
      const endPos = model.getPositionAt(nextMatch.end); // End before the closing bracket

      const newSelection = new monaco.Selection(
        startPos.lineNumber,
        startPos.column,
        endPos.lineNumber,
        endPos.column
      );

      editor.setSelection(newSelection);
      editor.focus();
    }
  }, []);

  // Helper function to find bracket pairs in text
  const findBracketPairs = (text: string, openChar: string, closeChar: string) => {
    const pairs: { start: number; end: number }[] = [];
    const stack: number[] = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (char === openChar) {
        stack.push(i);
      } else if (char === closeChar && stack.length > 0) {
        const start = stack.pop()!;
        pairs.push({ start, end: i });
      }
    }

    return pairs;
  };

  const replaceSelection = useCallback((text: string) => {
    if (monacoRef.current) {
      const editor = monacoRef.current;
      const selection = editor.getSelection();
      
      if (selection) {
        editor.executeEdits('replace-selection', [
          {
            range: selection,
            text,
          },
        ]);
        
        // Move cursor to end of replaced text
        const newPosition = new Position(
          selection.startLineNumber,
          selection.startColumn + text.length
        );
        editor.setPosition(newPosition);
        editor.focus();
      }
    }
  }, []);

  // Expose methods via ref
  React.useImperativeHandle(
    ref,
    () => ({
      insertText,
      getSelectedText,
      replaceSelection,
      focus: () => monacoRef.current?.focus(),
      getEditor: () => monacoRef.current,
    }),
    [insertText, getSelectedText, replaceSelection]
  );

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Monaco Editor */}
      <div style={{ height: '100%' }}>
        <div
          ref={editorRef}
          style={{
            height: '100%',
            width: '100%',
            position: 'relative',
            backgroundColor: '#27262F'
          }}
        />
      </div>
      
      {/* Copy Button - positioned at bottom right */}
      {onCopyToClipboard && (
        <button
          onClick={onCopyToClipboard}
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: isCopied ? '#10b981' : '#3a3a3a',
            color: 'white',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid rgba(85, 85, 85, 0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          title="Copy LaTeX to clipboard (⌘⇧C)"
        >
          {isCopied ? (
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          ) : (
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          )}
        </button>
      )}
    </div>
  );
});
