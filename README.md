# LaTeX Editor

A lightweight macOS application for editing and previewing LaTeX equations in real-time.

## Features

- **Two-panel interface**: Edit LaTeX on the left, see the rendered result on the right
- **Real-time preview**: Instantly see your LaTeX equations rendered with KaTeX
- **Syntax highlighting**: Makes editing LaTeX code easier
- **LaTeX autocomplete**: Quick access to common LaTeX commands through dropdown menu, similar to VSCode
- **Clean, modern UI**: Minimalistic design focused on the content
- **Automatic LaTeX preamble**: No need to write full LaTeX documents
- **Adjustable layout**: Switch between horizontal and vertical split views
- **Dark/Light mode**: Choose your preferred theme
- **Pin to top**: Keep the editor above other windows
- **Copy to clipboard**: Easily copy your LaTeX code

## Supported LaTeX Content

The editor is designed for LaTeX math formulas and environments:

- Single equations: `\int_0^\infty e^{-x^2} dx`
- Equation environments: `\begin{equation}...\end{equation}`
- Align environments: `\begin{align}...\end{align}`

## Keyboard Shortcuts

- **⌘⇧C**: Copy LaTeX to clipboard
- **⌘⇧D**: add section to next find match
- **⌘⇧U**: remove section from current find match
- **⌘z**: undo
- **⌘y**: redo


## Development

- Electron


## Future Features

- LaTeX code history
- Export to PDF/PNG
- Custom LaTeX preamble
- Additional LaTeX environments support