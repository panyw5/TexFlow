// Test script to verify equation numbering removal
const { KaTeXRenderer } = require('./src/renderer/services/katex-renderer.ts');

// Test LaTeX with align environment
const testLatex = `\\begin{align}
x &= y \\\\
a &= b
\\end{align}`;

const renderer = new KaTeXRenderer();

async function testRendering() {
  try {
    console.log('Testing equation numbering removal...');
    console.log('Original LaTeX:', testLatex);
    
    const result = await renderer.render(testLatex);
    console.log('Rendered HTML:', result);
    
    // Check if the result contains align* instead of align
    if (result.includes('align*')) {
      console.log('✓ SUCCESS: Equation numbering removed (align* detected)');
    } else {
      console.log('✗ FAILED: Still contains numbered align environment');
    }
  } catch (error) {
    console.error('Error testing:', error);
  }
}

testRendering();
