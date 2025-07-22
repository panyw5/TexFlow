import { contextBridge, ipcRenderer } from 'electron';

console.log('[preload] preload-standalone.js loaded');

// 直接定义所有需要的常量和类型，不依赖任何外部模块
const CHANNELS = {
  FILE_OPEN: 'file:open',
  FILE_SAVE: 'file:save',
  FILE_SAVE_AS: 'file:save-as',
  FILE_SAVE_BINARY: 'file:save-binary',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_TOGGLE_PIN: 'window:toggle-pin',
  APP_GET_VERSION: 'app:get-version',
  APP_QUIT: 'app:quit',
  CLIPBOARD_WRITE_TEXT: 'clipboard:write-text',
  CLIPBOARD_READ_TEXT: 'clipboard:read-text',
  CONFIG_SAVE: 'config:save',
  CONFIG_LOAD: 'config:load',
};

const MENU_CHANNELS = [
  'menu:new-file',
  'menu:open-file',
  'menu:save-file',
  'menu:save-as',
  'menu:copy-latex',
  'menu:toggle-preview',
  'menu:toggle-theme',
];

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  openFile: () => ipcRenderer.invoke(CHANNELS.FILE_OPEN),
  saveFile: (content: string, filePath?: string) => 
    ipcRenderer.invoke(CHANNELS.FILE_SAVE, content, filePath),
  saveFileAs: (content: string) => 
    ipcRenderer.invoke(CHANNELS.FILE_SAVE_AS, content),
  saveBinaryFile: (data: string, defaultName: string) => 
    ipcRenderer.invoke(CHANNELS.FILE_SAVE_BINARY, data, defaultName),

  // 窗口操作
  minimizeWindow: () => ipcRenderer.invoke(CHANNELS.WINDOW_MINIMIZE),
  maximizeWindow: () => ipcRenderer.invoke(CHANNELS.WINDOW_MAXIMIZE),
  closeWindow: () => ipcRenderer.invoke(CHANNELS.WINDOW_CLOSE),
  togglePin: () => ipcRenderer.invoke(CHANNELS.WINDOW_TOGGLE_PIN),

  // 应用操作
  getAppVersion: () => ipcRenderer.invoke(CHANNELS.APP_GET_VERSION),
  quitApp: () => ipcRenderer.invoke(CHANNELS.APP_QUIT),

  // 剪贴板操作
  writeToClipboard: (text: string) => 
    ipcRenderer.invoke(CHANNELS.CLIPBOARD_WRITE_TEXT, text),
  readFromClipboard: () => 
    ipcRenderer.invoke(CHANNELS.CLIPBOARD_READ_TEXT),

  // 配置操作
  saveConfig: (config: any) => 
    ipcRenderer.invoke(CHANNELS.CONFIG_SAVE, config),
  loadConfig: () => 
    ipcRenderer.invoke(CHANNELS.CONFIG_LOAD),

  // 菜单事件监听
  onMenuAction: (callback: (action: string) => void) => {
    MENU_CHANNELS.forEach(channel => {
      ipcRenderer.on(channel, () => callback(channel));
    });
  },

  removeMenuListeners: () => {
    MENU_CHANNELS.forEach(channel => {
      ipcRenderer.removeAllListeners(channel);
    });
  },
});

// 全局类型声明
declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<any>;
      saveFile: (content: string, filePath?: string) => Promise<any>;
      saveFileAs: (content: string) => Promise<any>;
      saveBinaryFile: (data: string, defaultName: string) => Promise<any>;
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;
      togglePin: () => Promise<boolean>;
      getAppVersion: () => Promise<string>;
      quitApp: () => Promise<void>;
      writeToClipboard: (text: string) => Promise<void>;
      readFromClipboard: () => Promise<string>;
      saveConfig: (config: any) => Promise<any>;
      loadConfig: () => Promise<any>;
      onMenuAction: (callback: (action: string) => void) => void;
      removeMenuListeners: () => void;
    };
  }
}
