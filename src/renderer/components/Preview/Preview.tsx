import React, { useState, useEffect, useMemo } from 'react';
import { RendererManager } from '../../services/rendering/renderer-manager';
import { UserConfigManager } from '../../services/user-config-manager';
import { RendererToggle } from './RendererToggle';
import { IRenderer } from '../../services/rendering/IRenderer';

interface PreviewProps {
  latex: string;
  onExport?: (format: 'png' | 'jpg') => void;
  exportStatus?: 'idle' | 'success' | 'error';
  showOutputDropdown?: boolean;
  onToggleOutputDropdown?: () => void;
  outputDropdownRef?: React.RefObject<HTMLDivElement>;
}

const configManager = new UserConfigManager();

export const Preview: React.FC<PreviewProps> = ({ 
  latex,
  onExport,
  exportStatus = 'idle',
  showOutputDropdown = false,
  onToggleOutputDropdown,
  outputDropdownRef
}) => {
  const [rendererManager, setRendererManager] = useState<RendererManager | null>(null);
  const [currentRenderer, setCurrentRenderer] = useState<'katex' | 'mathjax'>('katex');
  const [renderedHtml, setRenderedHtml] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize managers and load config
    const initialize = async () => {
      const config = await configManager.loadConfig();
      const manager = new RendererManager(config);
      setRendererManager(manager);
      setCurrentRenderer(config.defaultRenderer);
    };
    initialize();
  }, []);

  const activeRenderer: IRenderer | null = useMemo(() => {
    if (!rendererManager) return null;
    return rendererManager.getRenderer(currentRenderer);
  }, [rendererManager, currentRenderer]);

  useEffect(() => {
    if (!activeRenderer || !latex) {
      setRenderedHtml('');
      return;
    }

    let isMounted = true;
    const renderContent = async () => {
      try {
        setError(null);
        const html = await activeRenderer.render(latex);
        if (isMounted) {
          setRenderedHtml(html);
        }
      } catch (e: any) {
        if (isMounted) {
          setError(`Renderer Error: ${e.message}`);
          setRenderedHtml(`<div class="error">${e.message}</div>`);
        }
      }
    };

    renderContent();

    return () => {
      isMounted = false;
    };
  }, [latex, activeRenderer]);

  const handleToggleRenderer = () => {
    const newRenderer = currentRenderer === 'katex' ? 'mathjax' : 'katex';
    setCurrentRenderer(newRenderer);
    // Note: In a full app, this preference change should be saved via UserConfigManager
  };

  return (
    <div
      className="preview-panel"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
    >
      <div className="preview-toolbar">
        {/* Moved toolbar content to avoid collision */}
      </div>
      <div
        className="preview-content"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          fontSize: '2em',
          flex: 1,
          overflow: 'auto',
          paddingTop: '2em',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            width: '100%',
            // 统一样式来确保 KaTeX 和 MathJax 输出一致
            fontSize: 'inherit',
            lineHeight: '1.2',
            textAlign: 'center'
          }}
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
      {error && <div className="preview-error">{error}</div>}
      
      {/* Bottom right controls */}
      <div style={{ 
        position: 'absolute', 
        bottom: '12px', 
        right: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Renderer Toggle Button */}
        <RendererToggle currentRenderer={currentRenderer} onToggle={handleToggleRenderer} />
        
        {/* Export Button */}
        {onExport && onToggleOutputDropdown && (
          <div style={{ position: 'relative' }} ref={outputDropdownRef}>
            <button
              onClick={onToggleOutputDropdown}
              disabled={!latex.trim()}
              style={{
                backgroundColor: !latex.trim() ? '#2a2a2a' : 
                                exportStatus === 'success' ? '#10b981' :
                                exportStatus === 'error' ? '#ef4444' :
                                (showOutputDropdown ? '#4a4a4a' : '#3a3a3a'),
                color: !latex.trim() ? '#666' : 'white',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid rgba(85, 85, 85, 0.5)',
                cursor: !latex.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
              title={!latex.trim() ? "No content to export" : "Export output"}
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
    </div>
  );
};