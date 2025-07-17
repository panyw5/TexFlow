import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LaTeXEditor } from './Editor/LaTeXEditor';
import { LaTeXPreview } from './Preview/LaTeXPreview';
import { ResizableSplitPane } from './Layout/ResizableSplitPane';
// import { Toolbar } from './Layout/Toolbar';
// import { StatusBar } from './Layout/StatusBar';
import { ThemeManager } from '../utils/theme-manager';

interface AppState {
  content: string;
  filePath: string | null;
  isDirty: boolean;
  theme: 'light' | 'dark';
  previewVisible: boolean;
  splitDirection: 'horizontal' | 'vertical';
}

const App: React.FC = () => {
  const themeManager = ThemeManager.getInstance();
  
  const [state, setState] = useState<AppState>({
    content: '',
    filePath: null,
    isDirty: false,
    theme: themeManager.getCurrentTheme(),
    previewVisible: true,
    splitDirection: themeManager.getSplitDirection(), // 使用保存的布局
  });

  // 监听布局变化
  useEffect(() => {
    const handleLayoutChange = (direction: 'horizontal' | 'vertical') => {
      setState(prev => ({
        ...prev,
        splitDirection: direction,
      }));
    };

    themeManager.addLayoutListener(handleLayoutChange);

    return () => {
      themeManager.removeLayoutListener(handleLayoutChange);
    };
  }, [themeManager]);

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
    themeManager.toggleSplitDirection();
  }, [themeManager]);

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
      } else {
        console.error('[renderer] window.electronAPI is undefined!');
        // 移除了 alert 警告
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  }, []);

  // Test version with explicit inline styles to override any CSS conflicts
  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#2b2b2b',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div 
        className="title-bar"
        style={{
          height: '60px',
          backgroundColor: 'rgb(52, 48, 51)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid #444'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {/* Copy to Clipboard */}
            <button
              onClick={handleCopyToClipboard}
              style={{
                backgroundColor: isCopied ? '#10b981' : 'rgb(52, 48, 51)',
                color: 'white',
                padding: '16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '72px',
                height: '72px',
                transition: 'background-color 0.2s ease',
                WebkitAppRegion: 'no-drag'
              }}
              title="Copy LaTeX to clipboard (⌘⇧C)"
            >
              {isCopied ? (
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              ) : (
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              )}
            </button>

            {/* Toggle Layout */}
            <button
              onClick={handleToggleLayout}
              style={{
                backgroundColor: 'rgb(52, 48, 51)',
                color: 'white',
                padding: '16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '72px',
                height: '72px',
                WebkitAppRegion: 'no-drag'
              }}
              title="Toggle layout direction"
            >
              {state.splitDirection === 'horizontal' ? (
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18v4H3V3zm0 6h8v12H3V9zm10 0h8v12h-8V9z"/>
                </svg>
              ) : (
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h4v18H3V3zm6 0h12v8H9V3zm0 10h12v8H9v-8z"/>
                </svg>
              )}
            </button>

            {/* New Document */}
            <button
              onClick={handleNewDocument}
              style={{
                backgroundColor: 'rgb(52, 48, 51)',
                color: 'white',
                padding: '16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '72px',
                height: '72px',
                WebkitAppRegion: 'no-drag'
              }}
              title="New document"
            >
              <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
            </button>

            {/* Pin Window */}
            <button
              onClick={handleTogglePin}
              style={{
                backgroundColor: isPinned ? '#10b981' : 'rgb(52, 48, 51)',
                color: 'white',
                padding: '16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '72px',
                height: '72px',
                WebkitAppRegion: 'no-drag'
              }}
              title={isPinned ? "Unpin window" : "Pin window on top"}
            >
              <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
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
    </div>
  );
};

export default App;
