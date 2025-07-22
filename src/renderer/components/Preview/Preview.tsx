import React, { useState, useEffect, useMemo } from 'react';
import { RendererManager } from '../../services/rendering/renderer-manager';
import { UserConfigManager } from '../../services/user-config-manager';
import { RendererToggle } from './RendererToggle';
import { IRenderer } from '../../services/rendering/IRenderer';

interface PreviewProps {
  latex: string;
}

const configManager = new UserConfigManager();

export const Preview: React.FC<PreviewProps> = ({ latex }) => {
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
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div className="preview-toolbar">
        <RendererToggle currentRenderer={currentRenderer} onToggle={handleToggleRenderer} />
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
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
      {error && <div className="preview-error">{error}</div>}
    </div>
  );
};