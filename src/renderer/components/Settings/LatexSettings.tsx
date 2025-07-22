import React, { useState, useEffect } from 'react';
import { UserConfigManager } from '../../services/user-config-manager';
import { LatexTemplate, UserConfig } from '../../types/user-config';

const configManager = new UserConfigManager();

export const LatexSettings: React.FC = () => {
  const [config, setConfig] = useState<UserConfig | null>(null);

  useEffect(() => {
    configManager.loadConfig().then(setConfig);
  }, []);

  if (!config) {
    return <div>Loading...</div>;
  }

  const handleDefaultRendererChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newConfig = { ...config, defaultRenderer: e.target.value as 'katex' | 'mathjax' };
    setConfig(newConfig);
    configManager.saveConfig(newConfig);
  };

  return (
    <div className="latex-settings">
      <h2>LaTeX Settings</h2>
      <div className="setting-item">
        <label>Default Renderer</label>
        <select value={config.defaultRenderer} onChange={handleDefaultRendererChange}>
          <option value="katex">KaTeX (Fast)</option>
          <option value="mathjax">MathJax (Compatible)</option>
        </select>
      </div>
      <div className="setting-item">
        <h3>Custom Templates</h3>
        {/* Template management UI will be implemented here */}
        <p>Template management coming soon.</p>
      </div>
    </div>
  );
};