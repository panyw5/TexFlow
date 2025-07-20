declare global {
  interface Window {
    electronAPI?: {
      togglePin: () => Promise<boolean>;
      saveBinaryFile: (base64String: string, filename: string) => Promise<{ success: boolean; path?: string; error?: string }>;
    };
  }
}

export {};
