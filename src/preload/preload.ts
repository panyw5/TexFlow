import { contextBridge, ipcRenderer } from 'electron';
import { 
  IPC_CHANNELS, 
  FileOpenResult, 
  FileSaveResult 
} from '../shared/ipc-channels';

// Define the API that will be exposed to the renderer process
export interface ElectronAPI {
  // File operations
  openFile: () => Promise<FileOpenResult>;
  saveFile: (content: string, filePath?: string) => Promise<FileSaveResult>;
  saveFileAs: (content: string) => Promise<FileSaveResult>;

  // Window operations
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  togglePin: () => Promise<boolean>;

  // Application operations
  getAppVersion: () => Promise<string>;
  quitApp: () => Promise<void>;

  // Clipboard operations
  writeToClipboard: (text: string) => Promise<void>;
  readFromClipboard: () => Promise<string>;

  // Menu event listeners
  onMenuAction: (callback: (action: string) => void) => void;
  removeMenuListeners: () => void;
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFile: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN),
  saveFile: (content: string, filePath?: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE, content, filePath),
  saveFileAs: (content: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE_AS, content),

  // Window operations
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
  togglePin: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_TOGGLE_PIN),

  // Application operations
  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION),
  quitApp: () => ipcRenderer.invoke(IPC_CHANNELS.APP_QUIT),

  // Clipboard operations
  writeToClipboard: (text: string) => 
    ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_WRITE_TEXT, text),
  readFromClipboard: () => 
    ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_READ_TEXT),

  // Menu event listeners
  onMenuAction: (callback: (action: string) => void) => {
    const menuChannels = [
      'menu:new-file',
      'menu:open-file',
      'menu:save-file',
      'menu:save-as',
      'menu:copy-latex',
      'menu:toggle-preview',
      'menu:toggle-theme',
    ];

    menuChannels.forEach(channel => {
      ipcRenderer.on(channel, () => callback(channel));
    });
  },

  removeMenuListeners: () => {
    const menuChannels = [
      'menu:new-file',
      'menu:open-file',
      'menu:save-file',
      'menu:save-as',
      'menu:copy-latex',
      'menu:toggle-preview',
      'menu:toggle-theme',
    ];

    menuChannels.forEach(channel => {
      ipcRenderer.removeAllListeners(channel);
    });
  },
} as ElectronAPI);

// Type declaration for global window object
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
