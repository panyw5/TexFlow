import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LaTeXEditor } from './Editor/LaTeXEditor';
import { Preview } from './Preview/Preview';
import { ResizableSplitPane } from './Layout/ResizableSplitPane';
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
            {/* Toggle Layout */}
            <button
              onClick={handleToggleLayout}
              style={{
                backgroundColor: '#3a3a3a',
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
                WebkitAppRegion: 'no-drag'
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4a4a4a';
                e.currentTarget.style.borderColor = 'rgba(102, 102, 102, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3a3a3a';
                e.currentTarget.style.borderColor = 'rgba(85, 85, 85, 0.5)';
              }}
              title="Toggle layout direction"
            >
              {state.splitDirection === 'horizontal' ? (
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18v4H3V3zm0 6h8v12H3V9zm10 0h8v12h-8V9z"/>
                </svg>
              ) : (
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h4v18H3V3zm6 0h12v8H9V3zm0 10h12v8H9v-8z"/>
                </svg>
              )}
            </button>

            {/* New Document */}
            <button
              onClick={handleNewDocument}
              style={{
                backgroundColor: '#3a3a3a',
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
                WebkitAppRegion: 'no-drag'
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4a4a4a';
                e.currentTarget.style.borderColor = 'rgba(102, 102, 102, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3a3a3a';
                e.currentTarget.style.borderColor = 'rgba(85, 85, 85, 0.5)';
              }}
              title="New document"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
            </button>

            {/* Pin Window */}
            <button
              onClick={handleTogglePin}
              style={{
                backgroundColor: isPinned ? '#10b981' : '#3a3a3a',
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
                WebkitAppRegion: 'no-drag'
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                if (!isPinned) {
                  e.currentTarget.style.backgroundColor = '#4a4a4a';
                  e.currentTarget.style.borderColor = 'rgba(102, 102, 102, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isPinned) {
                  e.currentTarget.style.backgroundColor = '#3a3a3a';
                  e.currentTarget.style.borderColor = 'rgba(85, 85, 85, 0.5)';
                }
              }}
              title={isPinned ? "Unpin window" : "Pin window on top"}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
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
            onCopyToClipboard={handleCopyToClipboard}
            isCopied={isCopied}
          />
          <Preview 
            latex={state.content}
          />
        </ResizableSplitPane>
      </div>
    </div>
  );
};

export default App;
