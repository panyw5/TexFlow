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
  enabledPackages: ['base', 'ams', 'newcommand', 'configmacros'],
  defaultRenderer: 'katex',
  mathjaxPreamble: '% Custom MathJax Macros\n% Only \\newcommand and similar macro definitions work here\n% Packages must be enabled in settings, not via \\usepackage\n\n% Example custom commands:\n\\newcommand{\\R}{\\mathbb{R}}\n\\newcommand{\\N}{\\mathbb{N}}\n\\newcommand{\\Z}{\\mathbb{Z}}\n\\newcommand{\\C}{\\mathbb{C}}\n\\newcommand{\\Q}{\\mathbb{Q}}\n\n% More examples:\n\\newcommand{\\norm}[1]{\\left\\|#1\\right\\|}\n\\newcommand{\\abs}[1]{\\left|#1\\right|}\n\\newcommand{\\inner}[2]{\\langle #1, #2 \\rangle}\n',
};

export class UserConfigManager {
  private config: UserConfig = MOCK_CONFIG;

  async loadConfig(): Promise<UserConfig> {
    try {
      // Check if running in Electron environment
      if (!(window as any).electronAPI || !(window as any).electronAPI.loadConfig) {
        // Fallback to localStorage for standalone mode
        const savedConfig = localStorage.getItem('texflow-config');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          this.config = { ...this.config, ...parsedConfig };
          console.log('Loaded config from localStorage (standalone mode):', this.config);
        } else {
          console.log('No saved config found in localStorage, using defaults');
        }
        return Promise.resolve(this.config);
      }
      
      const result = await (window as any).electronAPI.loadConfig();
      if (result.success && result.config) {
        this.config = { ...this.config, ...result.config };
        console.log('Loaded user config from disk:', this.config);
      } else {
        console.log('No saved config found, using defaults');
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
    return Promise.resolve(this.config);
  }

  async saveConfig(config: UserConfig): Promise<void> {
    try {
      // Check if running in Electron environment
      if (!(window as any).electronAPI || !(window as any).electronAPI.saveConfig) {
        // Fallback to localStorage for standalone mode
        localStorage.setItem('texflow-config', JSON.stringify(config));
        this.config = config;
        console.log('Saved config to localStorage (standalone mode)');
        return;
      }
      
      const result = await (window as any).electronAPI.saveConfig(config);
      if (result.success) {
        this.config = config;
        console.log('Successfully saved user config');
      } else {
        console.error('Failed to save config:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
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

  getMathJaxPreamble(): string {
    return this.config.mathjaxPreamble;
  }

  async updateMathJaxPreamble(preamble: string): Promise<void> {
    this.config.mathjaxPreamble = preamble;
    await this.saveConfig(this.config);
  }

  async updateEnabledPackages(packages: string[]): Promise<void> {
    this.config.enabledPackages = packages;
    await this.saveConfig(this.config);
  }

  getAvailablePackages(): string[] {
    // List of available MathJax packages
    return [
      'base',
      'ams',
      'newcommand', 
      'configmacros',
      'mhchem',
      'physics',
      'cancel',
      'color',
      'bbox',
      'braket',
      'enclose',
      'mathtools',
      'cases',
      'unicode',
      'amscd',
      'extpfeil',
      'gensymb',
      'centernot',
      'boldsymbol',
      'upgreek'
    ];
  }
}