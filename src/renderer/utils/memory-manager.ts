export class MemoryManager {
  private static instance: MemoryManager;
  private cleanupTasks: (() => void)[] = [];
  
  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }
  
  // Monitor memory usage
  startMemoryMonitoring(): void {
    setInterval(() => {
      if (performance.memory) {
        const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
        const usage = usedJSHeapSize / totalJSHeapSize;
        
        if (usage > 0.8) {
          this.performCleanup();
        }
      }
    }, 30000); // Check every 30 seconds
  }
  
  private performCleanup(): void {
    this.cleanupTasks.forEach(task => task());
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }
}