# MathJax Export Feature Test Document

## Test 1: Basic Formula Export
Try exporting this simple formula:
```latex
E = mc^2
```

## Test 2: Complex Mathematical Expression
Test with a more complex formula:
```latex
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
```

## Test 3: Matrix Export
Test matrix formatting:
```latex
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
```

## Test 4: Fraction and Sum
Test fractions and summations:
```latex
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
```

## Test 5: Greek Letters and Symbols
Test various symbols:
```latex
\alpha + \beta = \gamma \implies \Delta \Omega \approx \infty
```

## Export Testing Checklist
- [ ] SVG export works and produces scalable vector graphics
- [ ] PNG export works with transparent background option
- [ ] JPG export works with configurable quality and background color
- [ ] Export modal opens and closes properly
- [ ] Export options (scale, quality, background) are functional
- [ ] File saving works via Electron IPC
- [ ] Error handling works for invalid LaTeX
- [ ] Export is disabled when no LaTeX content is present

## Expected Results
1. **SVG**: Should be small, scalable, and viewable in browsers
2. **PNG**: Should support transparency and high DPI scaling
3. **JPG**: Should be compressed with configurable quality
4. **UI**: Should be intuitive and provide clear feedback

## Known Limitations
- PDF export is currently disabled (requires additional setup)
- Export quality depends on the complexity of the LaTeX expression
- Very large formulas may take longer to process
