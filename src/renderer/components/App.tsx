import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LaTeXEditor } from './Editor/LaTeXEditor';
import { LaTeXPreview } from './Preview/LaTeXPreview';
import { ResizableSplitPane } from './Layout/ResizableSplitPane';
// import { Toolbar } from './Layout/Toolbar';
// import { StatusBar } from './Layout/StatusBar';

interface AppState {
  content: string;
  filePath: string | null;
  isDirty: boolean;
  theme: 'light' | 'dark';
  previewVisible: boolean;
  splitDirection: 'horizontal' | 'vertical';
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    content: '% Welcome to InsTex!\n% Start typing your LaTeX equations here\n\n\\begin{equation}\n  E = mc^2\n\\end{equation}\n\n\\begin{align}\n  \\nabla \\times \\vec{E} &= -\\frac{\\partial \\vec{B}}{\\partial t} \\\\\n  \\nabla \\times \\vec{B} &= \\mu_0\\vec{J} + \\mu_0\\epsilon_0\\frac{\\partial \\vec{E}}{\\partial t}\n\\end{align}',
    filePath: null,
    isDirty: false,
    theme: 'dark',
    previewVisible: true,
    splitDirection: 'horizontal',
  });

  const handleContentChange = useCallback((newContent: string) => {
    setState(prev => ({
      ...prev,
      content: newContent,
      isDirty: true,
    }));
  }, []);

  const handleCopyToClipboard = useCallback(async () => {
    try {
      // Select all text in the editor
      if (editorRef.current && editorRef.current.getEditor) {
        const editor = editorRef.current.getEditor();
        if (editor) {
          // Select all content
          const model = editor.getModel();
          if (model) {
            const fullRange = model.getFullModelRange();
            editor.setSelection(fullRange);
            editor.focus();
          }
        }
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(state.content);

      // Show success feedback
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1500); // Show green tick for 1.5 seconds

    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [state.content]);

  const handleToggleTheme = useCallback(() => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const handleToggleLayout = useCallback(() => {
    setState(prev => ({
      ...prev,
      splitDirection: prev.splitDirection === 'horizontal' ? 'vertical' : 'horizontal',
    }));
  }, []);

  const handleNewDocument = useCallback(() => {
    setState(prev => ({
      ...prev,
      content: '',
      filePath: null,
      isDirty: false,
    }));
  }, []);

  const [isPinned, setIsPinned] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const editorRef = useRef<any>(null);

  const handleTogglePin = useCallback(async () => {
    try {
      if (window.electronAPI) {
        const newPinState = await window.electronAPI.togglePin();
        setIsPinned(newPinState);
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  }, []);

  const toggleEditorType = useCallback(() => {
    setState(prev => ({
      ...prev,
      useLatexEditor: !prev.useLatexEditor,
    }));
  }, []);

  // Test version with explicit inline styles to override any CSS conflicts
  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#111827',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        backgroundColor: '#1f2937',
        padding: '12px 16px',
        borderBottom: '1px solid #374151'
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {/* Copy to Clipboard */}
            <button
              onClick={handleCopyToClipboard}
              style={{
                backgroundColor: isCopied ? '#10b981' : '#374151',
                color: 'white',
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                transition: 'background-color 0.2s ease'
              }}
              title="Copy LaTeX to clipboard (⌘⇧C)"
            >
              {isCopied ? (
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              ) : (
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              )}
            </button>

            {/* Toggle Theme */}
            <button
              onClick={handleToggleTheme}
              style={{
                backgroundColor: '#374151',
                color: 'white',
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px'
              }}
              title="Toggle theme"
            >
              {state.theme === 'dark' ? (
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                </svg>
              ) : (
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
                </svg>
              )}
            </button>

            {/* Toggle Layout */}
            <button
              onClick={handleToggleLayout}
              style={{
                backgroundColor: '#374151',
                color: 'white',
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px'
              }}
              title="Toggle layout direction"
            >
              {state.splitDirection === 'horizontal' ? (
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18v4H3V3zm0 6h8v12H3V9zm10 0h8v12h-8V9z"/>
                </svg>
              ) : (
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h4v18H3V3zm6 0h12v8H9V3zm0 10h12v8H9v-8z"/>
                </svg>
              )}
            </button>

            {/* New Document */}
            <button
              onClick={handleNewDocument}
              style={{
                backgroundColor: '#374151',
                color: 'white',
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px'
              }}
              title="New document"
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
            </button>

            {/* Pin Window */}
            <button
              onClick={handleTogglePin}
              style={{
                backgroundColor: isPinned ? '#10b981' : '#374151',
                color: 'white',
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px'
              }}
              title={isPinned ? "Unpin window" : "Pin window on top"}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ResizableSplitPane
          direction={state.splitDirection}
          defaultSize={50}
          minSize={20}
          maxSize={80}
        >
          <LaTeXEditor
            ref={editorRef}
            value={state.content}
            onChange={handleContentChange}
            theme={state.theme}
          />
          <LaTeXPreview
            content={state.content}
            theme={state.theme}
          />
        </ResizableSplitPane>
      </div>

      <div style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '8px',
        fontSize: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          Status: Ready | Characters: {state.content.length} | Lines: {state.content.split('\n').length}
        </div>
        <div>
          LaTeX Mode | Theme: {state.theme} | {state.isDirty ? 'Modified' : 'Saved'}
        </div>
      </div>
    </div>
  );
};

export default App;
