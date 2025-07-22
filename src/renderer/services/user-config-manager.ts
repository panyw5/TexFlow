import { UserConfig, LatexTemplate } from '../types/user-config';

// This is a placeholder for the user configuration management.
// It will handle loading, saving, and providing user-defined templates and packages.

const MOCK_CONFIG: UserConfig = {
  templates: [
    {
      id: 'default',
      name: 'Default Template',
      content: `\n\\usepackage{amsmath}\n\\usepackage{amssymb}\n`,
    },
  ],
  enabledPackages: ['base', 'ams', 'amssymb'],
  defaultRenderer: 'katex',
};

export class UserConfigManager {
  private config: UserConfig = MOCK_CONFIG;

  async loadConfig(): Promise<UserConfig> {
    // In a real implementation, this would load from a file via IPC
    console.log('Loading user config (placeholder)...');
    return Promise.resolve(this.config);
  }

  async saveConfig(config: UserConfig): Promise<void> {
    // In a real implementation, this would save to a file via IPC
    console.log('Saving user config (placeholder)...', config);
    this.config = config;
    return Promise.resolve();
  }

  getTemplates(): LatexTemplate[] {
    return this.config.templates;
  }

  getEnabledPackages(): string[] {
    return this.config.enabledPackages;
  }

  getDefaultRenderer(): 'katex' | 'mathjax' {
    return this.config.defaultRenderer;
  }
}