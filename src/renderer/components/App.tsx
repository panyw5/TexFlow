import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LaTeXEditor } from './Editor/LaTeXEditor';
import { LaTeXPreview } from './Preview/LaTeXPreview';
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
  const [showOutputDropdown, setShowOutputDropdown] = useState(false);
  const editorRef = useRef<any>(null);
  const outputDropdownRef = useRef<HTMLDivElement>(null);

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

  const handleOutput = useCallback(() => {
    setShowOutputDropdown(prev => !prev);
  }, []);

  const handleOutputFormat = useCallback(async (format: 'png' | 'jpg' | 'pdf' | 'svg') => {
    try {
      console.log(`Starting export as ${format}`);
      
      // Debug: Let's see what elements exist
      console.log('All elements with "preview" in class:', document.querySelectorAll('[class*="preview"]'));
      console.log('All elements with "latex" in class:', document.querySelectorAll('[class*="latex"]'));
      console.log('All divs in document:', document.querySelectorAll('div').length);
      
      // Get the specific math element instead of the entire preview
      let mathElement = document.querySelector('.katex-display .katex') || 
                       document.querySelector('.katex');
      
      if (!mathElement) {
        // Fallback to preview container if no math found
        mathElement = document.querySelector('.latex-preview-content');
      }
      
      console.log('Math element found:', mathElement);
      
      if (!mathElement) {
        console.error('Math element not found');
        alert('Math content not found. Make sure LaTeX is rendered.');
        return;
      }

      let dataUrl: string;
      let fileName: string;
      let fileExtension: string;

      switch (format) {
        case 'png':
        case 'jpg':
          console.log('Capturing math element with html2canvas...');
          // Dynamic import for html2canvas
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(mathElement as HTMLElement, {
            backgroundColor: format === 'png' ? null : '#ffffff', // Transparent for PNG
            scale: 8, // Ultra-high resolution for crisp math
            useCORS: true,
            allowTaint: true,
            removeContainer: true,
            // Let html2canvas determine optimal size based on content
            logging: false,
            // Add minimal padding
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0,
          });
          console.log('Canvas created:', canvas.width, 'x', canvas.height);
          dataUrl = canvas.toDataURL(`image/${format}`, 0.95);
          fileExtension = format;
          break;

        case 'pdf':
          // Dynamic import for jsPDF
          const { jsPDF } = await import('jspdf');
          const html2canvasPdf = (await import('html2canvas')).default;
          const canvas2 = await html2canvasPdf(mathElement as HTMLElement, {
            backgroundColor: '#ffffff',
            scale: 8,
            useCORS: true,
            allowTaint: true,
            removeContainer: true,
          });
          
          const imgData = canvas2.toDataURL('image/png');
          const pdf = new jsPDF();
          const imgWidth = 210;
          const pageHeight = 295;
          const imgHeight = (canvas2.height * imgWidth) / canvas2.width;
          let heightLeft = imgHeight;

          let position = 0;
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          const pdfBlob = pdf.output('blob');
          dataUrl = URL.createObjectURL(pdfBlob);
          fileExtension = 'pdf';
          break;

        case 'svg':
          // Extract SVG content
          const svgElement = mathElement.querySelector('svg');
          if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
            dataUrl = URL.createObjectURL(svgBlob);
          } else {
            // Fallback: convert to SVG using canvas
            const html2canvasSvg = (await import('html2canvas')).default;
            const canvas3 = await html2canvasSvg(mathElement as HTMLElement, {
              backgroundColor: null,
              scale: 8,
              useCORS: true,
              allowTaint: true,
              removeContainer: true,
            });
            // Note: This creates a raster SVG, not true vector
            const imgData3 = canvas3.toDataURL('image/png');
            const svgContent = `
              <svg xmlns="http://www.w3.org/2000/svg" width="${canvas3.width}" height="${canvas3.height}">
                <image href="${imgData3}" width="${canvas3.width}" height="${canvas3.height}"/>
              </svg>
            `;
            const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
            dataUrl = URL.createObjectURL(svgBlob);
          }
          fileExtension = 'svg';
          break;

        default:
          return;
      }

      // Generate filename
      fileName = `latex-export-${Date.now()}.${fileExtension}`;

      // Use Electron's save dialog
      if (window.electronAPI) {
        console.log('Using Electron API to save file...');
        // Convert dataUrl to buffer for Electron
        const response = await fetch(dataUrl);
        const buffer = await response.arrayBuffer();
        
        // Save file through Electron
        const result = await window.electronAPI.saveBinaryFile(
          Buffer.from(buffer).toString('base64'), 
          fileName
        );
        console.log('Save result:', result);
        if (result.success) {
          console.log(`Exported as ${format.toUpperCase()}: ${result.filePath}`);
          alert(`Successfully exported as ${format.toUpperCase()}`);
        } else {
          console.error('Save failed:', result.error);
          alert(`Export failed: ${result.error}`);
        }
      } else {
        console.log('Using browser download fallback...');
        // Fallback: browser download
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert(`Downloaded as ${fileName}`);
      }

      // Clean up object URLs
      if (format === 'pdf' || format === 'svg') {
        URL.revokeObjectURL(dataUrl);
      }

    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
    } finally {
      setShowOutputDropdown(false);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (outputDropdownRef.current && !outputDropdownRef.current.contains(event.target as Node)) {
        setShowOutputDropdown(false);
      }
    };

    if (showOutputDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOutputDropdown]);

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
                WebkitAppRegion: 'no-drag'
              }}
              onMouseEnter={(e) => {
                if (!isCopied) {
                  e.currentTarget.style.backgroundColor = '#4a4a4a';
                  e.currentTarget.style.borderColor = 'rgba(102, 102, 102, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isCopied) {
                  e.currentTarget.style.backgroundColor = '#3a3a3a';
                  e.currentTarget.style.borderColor = 'rgba(85, 85, 85, 0.5)';
                }
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
              }}
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
              }}
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
              }}
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

            {/* Output */}
            <div style={{ position: 'relative' }} ref={outputDropdownRef}>
              <button
                onClick={handleOutput}
                style={{
                  backgroundColor: showOutputDropdown ? '#4a4a4a' : '#3a3a3a',
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
                }}
                onMouseEnter={(e) => {
                  if (!showOutputDropdown) {
                    e.currentTarget.style.backgroundColor = '#4a4a4a';
                    e.currentTarget.style.borderColor = 'rgba(102, 102, 102, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showOutputDropdown) {
                    e.currentTarget.style.backgroundColor = '#3a3a3a';
                    e.currentTarget.style.borderColor = 'rgba(85, 85, 85, 0.5)';
                  }
                }}
                title="Export output"
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showOutputDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '4px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid rgba(85, 85, 85, 0.5)',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    zIndex: 1000,
                    minWidth: '120px',
                    WebkitAppRegion: 'no-drag'
                  }}
                >
                  {[
                    { format: 'png' as const, label: 'PNG' },
                    { format: 'jpg' as const, label: 'JPG' },
                    { format: 'pdf' as const, label: 'PDF' },
                    { format: 'svg' as const, label: 'SVG' }
                  ].map(({ format, label }) => (
                    <button
                      key={format}
                      onClick={() => handleOutputFormat(format)}
                      style={{
                        width: '50%',
                        padding: '15px 12px',
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: 'none',
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'background-color 0.2s ease',
                        borderRadius: format === 'png' ? '6px 6px 0 0' : format === 'svg' ? '0 0 6px 6px' : '0'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#3a3a3a';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            
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
