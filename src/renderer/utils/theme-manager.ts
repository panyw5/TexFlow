// Theme management utilities

export type Theme = 'light' | 'dark';
export type SplitDirection = 'horizontal' | 'vertical';

export interface ThemeColors {
  background: string;
  foreground: string;
  border: string;
  accent: string;
  error: string;
  warning: string;
  success: string;
}

export interface AppSettings {
  theme: Theme;
  splitDirection: SplitDirection;
}

export const LIGHT_THEME: ThemeColors = {
  background: '#ffffff',
  foreground: '#000000',
  border: '#e5e5e5',
  accent: '#0078d4',
  error: '#d73a49',
  warning: '#f9c513',
  success: '#28a745',
};

export const DARK_THEME: ThemeColors = {
  background: '#2d1b3d',
  foreground: '#ffffff',
  border: '#3c3c3c',
  accent: '#6b46c1',
  error: '#f14c4c',
  warning: '#ffcc02',
  success: '#89d185',
};

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme = 'dark';
  private splitDirection: SplitDirection = 'vertical'; // 默认上下布局
  private listeners: Array<(theme: Theme) => void> = [];
  private layoutListeners: Array<(direction: SplitDirection) => void> = [];

  private constructor() {
    // Load settings from localStorage if available
    const savedTheme = localStorage.getItem('instex-theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.currentTheme = savedTheme;
    }

    const savedLayout = localStorage.getItem('instex-layout') as SplitDirection;
    if (savedLayout && (savedLayout === 'horizontal' || savedLayout === 'vertical')) {
      this.splitDirection = savedLayout;
    }
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  public getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  public setTheme(theme: Theme): void {
    if (this.currentTheme !== theme) {
      this.currentTheme = theme;
      localStorage.setItem('instex-theme', theme);
      this.notifyListeners();
    }
  }

  public toggleTheme(): void {
    this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
  }

  public getThemeColors(): ThemeColors {
    return this.currentTheme === 'dark' ? DARK_THEME : LIGHT_THEME;
  }

  public addListener(listener: (theme: Theme) => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (theme: Theme) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }

  public getSplitDirection(): SplitDirection {
    return this.splitDirection;
  }

  public setSplitDirection(direction: SplitDirection): void {
    if (this.splitDirection !== direction) {
      this.splitDirection = direction;
      localStorage.setItem('instex-layout', direction);
      this.notifyLayoutListeners();
    }
  }

  public toggleSplitDirection(): void {
    this.setSplitDirection(this.splitDirection === 'horizontal' ? 'vertical' : 'horizontal');
  }

  public addLayoutListener(listener: (direction: SplitDirection) => void): void {
    this.layoutListeners.push(listener);
  }

  public removeLayoutListener(listener: (direction: SplitDirection) => void): void {
    const index = this.layoutListeners.indexOf(listener);
    if (index > -1) {
      this.layoutListeners.splice(index, 1);
    }
  }

  private notifyLayoutListeners(): void {
    this.layoutListeners.forEach(listener => listener(this.splitDirection));
  }
}
