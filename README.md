# Core functionality
- MacOS application
- A simple two-panel text editor
  - Panel 1: Syntax highlighting for LaTeX in the editor
  - Panel 2: Real-time LaTeX preview


# Other features

- LaTeX Preamble should be taken care of automatically
- Panel 1 should expect only LaTeX code for one formula or math environment
  - Example 1:
    ```
    \int_0^\infty e^{-x^2} dx
    ```
  - Example 2:
    ```
    \begin{equation}
    \int_0^\infty e^{-x^2} dx
    \end{equation}
    ```
  - Example 3:
    ```
    \begin{align}
    y = & \ \int_0^\infty e^{-x^2} dx \\
    z = & \ \int_0^\infty e^{-x^2} dx
    \end{align}
    ```
- Panel 1 has autocomplete for LaTeX commands
- Split-pane interface with adjustable divider
- Button: Light/Dark mode toggle
- Button: Copy to clipboard functionality
- Button: Toggle between horizontal/vertical layout
- Button: Pin the app window to the top of the screen

# Future features

- LaTex code history