// Web Worker for LaTeX tokenization
import { LaTeXTokenizer, TokenizeOptions } from '../services/latex-tokenizer';

const tokenizer = new LaTeXTokenizer();

self.onmessage = async (event: MessageEvent) => {
  const { id, content, options } = event.data;
  
  try {
    const tokens = await tokenizer.tokenize(content, options as TokenizeOptions);
    
    self.postMessage({
      id,
      success: true,
      tokens,
    });
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Handle worker termination
self.onclose = () => {
  tokenizer.dispose();
};

// Handle worker errors
self.onerror = (error) => {
  console.error('Worker error:', error);
};
