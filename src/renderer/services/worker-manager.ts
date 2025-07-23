import { TokenizeOptions } from './latex-tokenizer';
// Import worker with static URL - commented out for build compatibility
// import LaTeXTokenizerWorker from '../workers/latex-tokenizer.worker.ts?worker';

export class WorkerManager {
  private workers = new Map<string, Worker>();
  private requestId = 0;
  private pendingRequests = new Map<number, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>();
  
  async tokenizeInWorker(content: string, options?: TokenizeOptions): Promise<any[]> {
    const worker = this.getOrCreateWorker('latex-tokenizer');
    const id = ++this.requestId;
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Worker timeout'));
      }, 5000);
      
      this.pendingRequests.set(id, { resolve, reject, timeout });
      
      worker.postMessage({ id, content, options });
    });
  }
  
  private getOrCreateWorker(type: string): Worker {
    if (!this.workers.has(type)) {
      let worker: Worker;
      
      switch (type) {
        case 'latex-tokenizer':
          // Create worker using URL constructor for build compatibility
          worker = new Worker(new URL('../workers/latex-tokenizer.worker.ts', import.meta.url), {
            type: 'module'
          });
          break;
        default:
          throw new Error(`Unknown worker type: ${type}`);
      }
      
      worker.onmessage = this.handleWorkerMessage.bind(this);
      worker.onerror = this.handleWorkerError.bind(this);
      
      this.workers.set(type, worker);
    }
    
    return this.workers.get(type)!;
  }
  
  private handleWorkerMessage(event: MessageEvent): void {
    const { id, success, tokens, error } = event.data;
    const request = this.pendingRequests.get(id);
    
    if (request) {
      clearTimeout(request.timeout);
      this.pendingRequests.delete(id);
      
      if (success) {
        request.resolve(tokens);
      } else {
        request.reject(new Error(error));
      }
    }
  }
  
  private handleWorkerError(error: ErrorEvent): void {
    console.error('Worker error:', error);
    // Reject all pending requests
    this.pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Worker error'));
    });
    this.pendingRequests.clear();
  }
  
  dispose(): void {
    // Clear all pending requests
    this.pendingRequests.forEach(({ timeout }) => {
      clearTimeout(timeout);
    });
    this.pendingRequests.clear();
    
    // Terminate all workers
    this.workers.forEach(worker => {
      worker.terminate();
    });
    this.workers.clear();
  }
}
