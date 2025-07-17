import React, { useEffect, useRef, useState, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { debounce } from '../../utils/debounce';

interface LaTeXPreviewProps {
  content: string;
  theme: 'light' | 'dark';
  fontSize?: number;
}

interface RenderError {
  line?: number;
  message: string;
  type: 'error' | 'warning';
}

export const LaTeXPreview: React.FC<LaTeXPreviewProps> = ({
  content,
  theme,
  fontSize = 16,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedContent, setRenderedContent] = useState<string>('');
  const [errors, setErrors] = useState<RenderError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced render function
  const debouncedRender = useMemo(
    () => debounce((content: string) => {
      renderLaTeX(content);
    }, 300),
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
      // Try to render the entire content as display math
      const html = katex.renderToString(content, {
        displayMode: true,
        throwOnError: false,
        strict: false,
        trust: true,
      });
      return `<div style="margin: 1rem 0; text-align: center;">${html}</div>`;
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

      // If it's just plain math without delimiters, wrap it in math delimiters
      if (!cleanContent.includes('$') && !cleanContent.includes('\\begin{')) {
        cleanContent = `$${cleanContent}$`;
      }

      // Process inline math ($...$)
      if (cleanContent.includes('$')) {
        return processInlineAndDisplayMath(cleanContent);
      }

      // If content looks like math (contains backslashes), try to render as display math
      if (cleanContent.includes('\\')) {
        const html = katex.renderToString(cleanContent, {
          displayMode: true,
          throwOnError: false,
          strict: false,
          trust: true,
        });
        console.log('Rendered HTML:', html);
        return `<div style="margin: 1rem 0; text-align: center;">${html}</div>`;
      } else {
        // Plain text
        return `<div style="padding: 1rem; font-family: monospace; background: #f3f4f6; border-radius: 0.25rem;">${cleanContent}</div>`;
      }
    } catch (error) {
      console.error('Math rendering error:', error);
      return `<div style="color: #f87171; padding: 0.5rem; background: #fef2f2; border-radius: 0.25rem;">
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
          return `<div style="margin: 1rem 0; text-align: center;">${html}</div>`;
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

      return `<div style="padding: 1rem; line-height: 1.6;">${result}</div>`;
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
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff'
    }}>
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
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          color: theme === 'dark' ? 'white' : 'black',
          backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
          fontSize: `${fontSize}px`
        }}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    </div>
  );
};
