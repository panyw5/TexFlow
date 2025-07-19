import React, { useEffect, useRef, useState, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { debounce } from '../../utils/debounce';

interface LaTeXPreviewProps {
  content: string;
  theme: 'light' | 'dark';
  fontSize?: number;
  onExport?: (format: 'png' | 'jpg') => void;
  exportStatus?: 'idle' | 'success' | 'error';
  showOutputDropdown?: boolean;
  onToggleOutputDropdown?: () => void;
  outputDropdownRef?: React.RefObject<HTMLDivElement>;
}

interface RenderError {
  line?: number;
  message: string;
  type: 'error' | 'warning';
}

export const LaTeXPreview: React.FC<LaTeXPreviewProps> = ({
  content,
  theme,
  fontSize = 32, // Doubled from 16
  onExport,
  exportStatus = 'idle',
  showOutputDropdown = false,
  onToggleOutputDropdown,
  outputDropdownRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedContent, setRenderedContent] = useState<string>('');
  const [errors, setErrors] = useState<RenderError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced render function
  const debouncedRender = useMemo(
    () => debounce((content: string) => {
      renderLaTeX(content);
    }, 100),
    []
  );

  // Render LaTeX content
  const renderLaTeX = async (latexContent: string) => {
    setIsLoading(true);
    setErrors([]);

    try {
      const html = await processLaTeXContent(latexContent);
      setRenderedContent(html);
    } catch (error) {
      console.error('LaTeX rendering error:', error);
      setErrors([{
        message: error instanceof Error ? error.message : 'Unknown rendering error',
        type: 'error',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Process LaTeX content and convert to HTML
  const processLaTeXContent = async (content: string): Promise<string> => {
    if (!content.trim()) {
      return '<div style="color: #888; font-style: italic; text-align: center; margin-top: 2rem;">Start typing LaTeX to see the preview...</div>';
    }

    try {
      // Simple approach: try to render the entire content as LaTeX
      let processedContent = content;

      // Remove comments
      processedContent = processedContent.replace(/%.*$/gm, '');

      // If content contains environments, try to render them
      if (processedContent.includes('\\begin{')) {
        return processEnvironments(processedContent);
      }

      // Otherwise, treat as inline/display math
      return processSimpleMath(processedContent);

    } catch (error) {
      console.error('LaTeX processing error:', error);
      return `<div style="color: #f87171; padding: 1rem; background: #fef2f2; border-radius: 0.5rem;">
        <strong>Rendering Error:</strong><br/>
        ${error instanceof Error ? error.message : 'Unknown error'}<br/><br/>
        <strong>Original Content:</strong><br/>
        <pre style="white-space: pre-wrap; font-family: monospace;">${content}</pre>
      </div>`;
    }
  };

  // Process LaTeX environments
  const processEnvironments = (content: string): string => {
    try {
      // Replace numbered environments with unnumbered versions to avoid equation numbers
      let processedContent = content
        .replace(/\\begin{align}/g, '\\begin{align*}')
        .replace(/\\end{align}/g, '\\end{align*}')
        .replace(/\\begin{equation}/g, '\\begin{equation*}')
        .replace(/\\end{equation}/g, '\\end{equation*}')
        .replace(/\\begin{gather}/g, '\\begin{gather*}')
        .replace(/\\end{gather}/g, '\\end{gather*}');

      // Try to render the entire content as display math
      const html = katex.renderToString(processedContent, {
        displayMode: true,
        throwOnError: false,
        strict: false,
        trust: true,
      });
      return `<div style="margin: 1rem 0; text-align: center; width: 100%;">${html}</div>`;
    } catch (error) {
      console.error('Environment rendering error:', error);
      return `<div style="color: #f87171; padding: 0.5rem; background: #fef2f2; border-radius: 0.25rem;">
        Error rendering LaTeX environment: ${error instanceof Error ? error.message : 'Unknown error'}
      </div>`;
    }
  };

  // Process simple math expressions
  const processSimpleMath = (content: string): string => {
    try {
      console.log('Processing simple math:', content);

      // Clean the content
      let cleanContent = content.trim();

      // If it's just plain math without delimiters, render as display math
      if (!cleanContent.includes('$') && !cleanContent.includes('\\begin{') && cleanContent.includes('\\')) {
        const html = katex.renderToString(cleanContent, {
          displayMode: true,
          throwOnError: false,
          strict: false,
          trust: true,
        });
        console.log('Rendered HTML (direct LaTeX):', html);
        return `<div style="margin: 1rem 0; text-align: center; width: 100%;">${html}</div>`;
      }

      // Check if content looks like math (contains ^, _, {, }, or common math patterns, or is just letters/numbers)
      const mathPatterns = /[\^_{}]|\\[a-zA-Z]+|[a-zA-Z]\s*[\^_]|^[a-zA-Z0-9\s+\-*/=()]+$/;
      if (mathPatterns.test(cleanContent) && !cleanContent.includes('$')) {
        // Treat as math expression and render in display mode
        const html = katex.renderToString(cleanContent, {
          displayMode: true,
          throwOnError: false,
          strict: false,
          trust: true,
        });
        console.log('Rendered HTML (detected math):', html);
        return `<div style="margin: 1rem 0; text-align: center; width: 100%; color: white;">${html}</div>`;
      }

      // Process inline and display math ($...$, $$...$$)
      if (cleanContent.includes('$')) {
        return processInlineAndDisplayMath(cleanContent);
      }

      // For any remaining content, try to render as math first
      try {
        const html = katex.renderToString(cleanContent, {
          displayMode: true,
          throwOnError: true,
          strict: false,
          trust: true,
        });
        return `<div style="margin: 1rem 0; text-align: center; width: 100%; color: white;">${html}</div>`;
      } catch {
        // If KaTeX fails, show as styled text with dark theme
        return `<div style="padding: 1rem; font-family: monospace; background: #2b2b2b; border-radius: 0.25rem; color: white; text-align: center;">${cleanContent}</div>`;
      }
    } catch (error) {
      console.error('Math rendering error:', error);
      return `<div style="color: #f87171; padding: 0.5rem; background: #2b2b2b; border-radius: 0.25rem;">
        <strong>Error rendering math:</strong> ${error instanceof Error ? error.message : 'Unknown error'}<br/>
        <strong>Input:</strong> ${content}
      </div>`;
    }
  };

  // Process inline and display math
  const processInlineAndDisplayMath = (content: string): string => {
    try {
      let result = content;

      // Process display math ($$...$$)
      result = result.replace(/\$\$(.*?)\$\$/gs, (match, math) => {
        try {
          const html = katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false,
            strict: false,
            trust: true,
          });
          return `<div style="margin: 1rem 0; text-align: center; width: 100%;">${html}</div>`;
        } catch (error) {
          return `<div style="color: #f87171;">Error rendering display math: ${math}</div>`;
        }
      });

      // Process inline math ($...$)
      result = result.replace(/\$([^$]+)\$/g, (match, math) => {
        try {
          const html = katex.renderToString(math.trim(), {
            displayMode: false,
            throwOnError: false,
            strict: false,
            trust: true,
          });
          return html;
        } catch (error) {
          return `<span style="color: #f87171;">Error: ${math}</span>`;
        }
      });

      return `<div style="padding: 1rem; line-height: 1.6; text-align: center;">${result}</div>`;
    } catch (error) {
      console.error('Inline/Display math error:', error);
      return `<div style="color: #f87171;">Error processing math: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
    }
  };



  // Effect to render content when it changes
  useEffect(() => {
    debouncedRender(content);
    
    return () => {
      debouncedRender.cancel();
    };
  }, [content, debouncedRender]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedRender.cancel();
    };
  }, [debouncedRender]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Error display */}
      {errors.length > 0 && (
        <div style={{
          backgroundColor: '#dc2626',
          color: 'white',
          padding: '8px',
          fontSize: '12px',
          flexShrink: 0
        }}>
          <div style={{ fontWeight: 'bold' }}>Rendering Errors:</div>
          {errors.map((error, index) => (
            <div key={index} style={{ marginTop: '4px' }}>
              {error.line && `Line ${error.line}: `}{error.message}
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '8px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div className="spinner" style={{ marginRight: '8px' }}></div>
          Rendering LaTeX...
        </div>
      )}

      {/* Preview content */}
      <div
        ref={containerRef}
        className="latex-preview-content"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          color: theme === 'dark' ? 'white' : 'black',
          backgroundColor: '#2b2b2b',
          fontSize: `${fontSize}px`
        }}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />

      {/* Export Button - positioned at bottom right */}
      {onExport && onToggleOutputDropdown && (
        <div style={{ position: 'absolute', bottom: '12px', right: '12px' }} ref={outputDropdownRef}>
          <button
            onClick={onToggleOutputDropdown}
            disabled={!content.trim()}
            style={{
              backgroundColor: !content.trim() ? '#2a2a2a' : 
                              exportStatus === 'success' ? '#10b981' :
                              exportStatus === 'error' ? '#ef4444' :
                              (showOutputDropdown ? '#4a4a4a' : '#3a3a3a'),
              color: !content.trim() ? '#666' : 'white',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid rgba(85, 85, 85, 0.5)',
              cursor: !content.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
            title={!content.trim() ? "No content to export" : "Export output"}
          >
            {exportStatus === 'success' ? (
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            ) : exportStatus === 'error' ? (
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            ) : (
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            )}
          </button>

          {/* Dropdown Menu */}
          {showOutputDropdown && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                right: '0',
                marginBottom: '4px',
                backgroundColor: '#2a2a2a',
                border: '1px solid rgba(85, 85, 85, 0.5)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                zIndex: 1000,
                minWidth: '120px'
              }}
            >
              {[
                { format: 'png' as const, label: 'PNG' },
                { format: 'jpg' as const, label: 'JPG' }
              ].map(({ format, label }) => (
                <button
                  key={format}
                  onClick={() => onExport(format)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'background-color 0.2s ease',
                    borderRadius: format === 'png' ? '6px 6px 0 0' : '0 0 6px 6px'
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
      )}
    </div>
  );
};
