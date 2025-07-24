import React, { useState, useEffect, useMemo } from 'react';
import { RendererManager } from '../../services/rendering/renderer-manager';
import { UserConfigManager } from '../../services/user-config-manager';
import { RendererToggle } from './RendererToggle';
import { PreambleEditor } from './PreambleEditor';
import { PackageManager } from './PackageManager';
import { ExportButton } from '../Export/ExportButton';
import { DraggablePreview, AllExportFormat } from './DraggablePreview';
import { IRenderer } from '../../services/rendering/IRenderer';

interface PreviewProps {
  latex: string;
  filePath?: string | null;
}

const configManager = new UserConfigManager();

export const Preview: React.FC<PreviewProps> = ({ 
  latex,
  filePath = null
}) => {
  const [rendererManager, setRendererManager] = useState<RendererManager | null>(null);
  const [currentRenderer, setCurrentRenderer] = useState<'katex' | 'mathjax'>('katex');
  const [renderedHtml, setRenderedHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPreambleEditorVisible, setIsPreambleEditorVisible] = useState(false);
  const [currentPreamble, setCurrentPreamble] = useState('');
  const [isPackageManagerVisible, setIsPackageManagerVisible] = useState(false);
  const [enabledPackages, setEnabledPackages] = useState<string[]>([]);
  const [availablePackages, setAvailablePackages] = useState<string[]>([]);
  const [configVersion, setConfigVersion] = useState(0); // Force re-render when config changes
  const [currentFormat, setCurrentFormat] = useState<AllExportFormat>('tex');

  useEffect(() => {
    // Initialize managers and load config
    const initialize = async () => {
      const config = await configManager.loadConfig();
      const manager = new RendererManager(config);
      setRendererManager(manager);
      setCurrentRenderer(config.defaultRenderer);
      setCurrentPreamble(config.mathjaxPreamble);
      setEnabledPackages(config.enabledPackages);
      setAvailablePackages(configManager.getAvailablePackages());
    };
    initialize();
  }, []);

  const activeRenderer: IRenderer | null = useMemo(() => {
    if (!rendererManager) return null;
    return rendererManager.getRenderer(currentRenderer);
  }, [rendererManager, currentRenderer, configVersion]); // Add configVersion dependency

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
  }, [latex, activeRenderer, configVersion]); // Add configVersion to force re-render

  const handleToggleRenderer = () => {
    const newRenderer = currentRenderer === 'katex' ? 'mathjax' : 'katex';
    setCurrentRenderer(newRenderer);
  };

  const handleEditPreamble = () => {
    setIsPreambleEditorVisible(true);
  };

  const handleSavePreamble = async (newPreamble: string) => {
    try {
      await configManager.updateMathJaxPreamble(newPreamble);
      setCurrentPreamble(newPreamble);
      
      // Recreate renderer manager with new config to ensure changes take effect
      const config = await configManager.loadConfig();
      const newRendererManager = new RendererManager(config);
      setRendererManager(newRendererManager);
      
      setIsPreambleEditorVisible(false);
      setConfigVersion(prev => prev + 1); // Force re-render
    } catch (error) {
      console.error('Failed to save preamble:', error);
    }
  };

  const handleCancelPreambleEdit = () => {
    setIsPreambleEditorVisible(false);
  };

  const handleManagePackages = () => {
    setIsPackageManagerVisible(true);
  };

  const handlePackagesChange = async (newPackages: string[]) => {
    try {
      await configManager.updateEnabledPackages(newPackages);
      setEnabledPackages(newPackages);
      
      // Recreate renderer manager with new config to ensure changes take effect
      const config = await configManager.loadConfig();
      const newRendererManager = new RendererManager(config);
      setRendererManager(newRendererManager);
      
      setIsPackageManagerVisible(false);
      setConfigVersion(prev => prev + 1); // Force re-render
    } catch (error) {
      console.error('Failed to update packages:', error);
    }
  };

  const handleCancelPackageManager = () => {
    setIsPackageManagerVisible(false);
  };

  return (
    <div
      className="preview-panel"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
    >
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
          position: 'relative'
        }}
      >
        {/* 格式选择器 - 右上角 */}
        <div 
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10
          }}
        >
          <div style={{ position: 'relative' }}>
            <select
              value={currentFormat}
              onChange={(e) => setCurrentFormat(e.target.value as AllExportFormat)}
              style={{
                backgroundColor: 'rgb(45,45,45)',
                color: 'white',
                border: '1px solid #4B5563',
                borderRadius: '4px',
                padding: '8px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                minWidth: '60px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                textAlign: 'center'
              }}
            >
              <option value="tex">TEX</option>
              <option value="html">HTML</option>
              <option value="svg">SVG</option>
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>

        <DraggablePreview
          latex={latex}
          renderedHtml={renderedHtml}
          filename={filePath ? filePath.split('/').pop() || 'untitled.tex' : 'untitled.tex'}
          currentFormat={currentFormat}
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
        </DraggablePreview>
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
        {/* Preamble Edit Button - only show when MathJax is selected */}
        {currentRenderer === 'mathjax' && !isPreambleEditorVisible && !isPackageManagerVisible && (
          <>
            <button
              onClick={handleManagePackages}
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4a4a4a';
                e.currentTarget.style.borderColor = 'rgba(102, 102, 102, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3a3a3a';
                e.currentTarget.style.borderColor = 'rgba(85, 85, 85, 0.5)';
              }}
              title="Manage MathJax Packages"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
            
            <button
              onClick={handleEditPreamble}
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4a4a4a';
                e.currentTarget.style.borderColor = 'rgba(102, 102, 102, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3a3a3a';
                e.currentTarget.style.borderColor = 'rgba(85, 85, 85, 0.5)';
              }}
              title="Edit MathJax Macros"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          </>
        )}
        
        {/* Renderer Toggle Button */}
        <RendererToggle currentRenderer={currentRenderer} onToggle={handleToggleRenderer} />
        
        {/* Export Button */}
        <ExportButton latex={latex} />
      </div>

      {/* Preamble Editor Overlay */}
      <PreambleEditor
        initialPreamble={currentPreamble}
        onSave={handleSavePreamble}
        onCancel={handleCancelPreambleEdit}
        isVisible={isPreambleEditorVisible}
      />

      {/* Package Manager Overlay */}
      <PackageManager
        availablePackages={availablePackages}
        enabledPackages={enabledPackages}
        onPackagesChange={handlePackagesChange}
        onClose={handleCancelPackageManager}
        isVisible={isPackageManagerVisible}
      />
    </div>
  );
};