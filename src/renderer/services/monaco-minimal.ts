// Import only essential Monaco features
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';

// Only import LaTeX if available
try {
  await import('monaco-editor/esm/vs/basic-languages/latex/latex.contribution.js');
} catch (e) {
  console.warn('LaTeX language support not available');
}

// Minimal worker configuration
self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    return './editor.worker.bundle.js';
  }
};

export { monaco };
