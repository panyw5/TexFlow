// KaTeX Web Worker for heavy rendering
importScripts('/katex.min.js');

self.onmessage = function(e) {
  const { latex, options } = e.data;
  
  try {
    const html = katex.renderToString(latex, options);
    self.postMessage({
      success: true,
      html: html
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message
    });
  }
};