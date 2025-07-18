# TexFlow Development Rules & Guidelines

## Project Overview
A lightweight macOS Electron application for editing and previewing LaTeX equations in real-time with advanced syntax highlighting and autocomplete features.

## Core Development Principles

### 1. Code Quality Standards
- **TypeScript First**: All code must be written in TypeScript for type safety
- **ESLint + Prettier**: Enforce consistent code formatting and style
- **Test Coverage**: Minimum 80% test coverage for all core functionality
- **Documentation**: Every public function/class must have JSDoc comments
- **Error Handling**: Comprehensive error handling with user-friendly messages

### 2. Architecture Guidelines
- **Modular Design**: Separate concerns into distinct modules (editor, preview, autocomplete, etc.)
- **Event-Driven**: Use event emitters for communication between components
- **Performance First**: Optimize for real-time LaTeX rendering and large document handling
- **Accessibility**: Follow WCAG 2.1 AA guidelines for keyboard navigation and screen readers

### 3. Technology Stack Rules

#### Core Framework
- **Electron**: Latest stable version for cross-platform desktop app
- **React**: For UI components and state management
- **TypeScript**: Strict mode enabled for all source files

#### Editor Component
- **Monaco Editor**: Primary choice for LaTeX editing with custom language service
- **Custom LaTeX Language Service**: Build comprehensive LaTeX syntax support
- **Fallback**: CodeMirror 6 if Monaco proves too complex for LaTeX integration

#### LaTeX Processing
- **KaTeX**: Primary LaTeX rendering engine (faster than MathJax)
- **MathJax**: Fallback for complex LaTeX features not supported by KaTeX
- **LaTeX Command Database**: Maintain comprehensive command reference for autocomplete

### 4. File Structure Standards
```
src/
├── main/                 # Electron main process
├── renderer/             # Electron renderer process
│   ├── components/       # React components
│   ├── services/         # Business logic services
│   ├── utils/           # Utility functions
│   └── types/           # TypeScript type definitions
├── shared/              # Code shared between main and renderer
└── assets/              # Static assets
```

### 5. Performance Requirements
- **Startup Time**: Application must start within 3 seconds
- **Real-time Preview**: LaTeX rendering delay must be < 100ms for typical equations
- **Memory Usage**: Keep memory footprint under 200MB for normal usage
- **Responsiveness**: UI must remain responsive during heavy LaTeX processing

### 6. LaTeX Feature Support Priority

#### Phase 1 (MVP)
- Basic math equations: `$...$` and `$$...$$`
- Common math symbols and operators
- Fractions, superscripts, subscripts
- Basic environments: equation, align

#### Phase 2 (Enhanced)
- Advanced math environments (matrix, cases, etc.)
- Custom commands and macros
- Bibliography and references
- Table support

#### Phase 3 (Advanced)
- TikZ diagrams (if feasible)
- Custom LaTeX packages
- Advanced formatting options

### 7. User Experience Guidelines
- **Intuitive Interface**: Two-panel layout with clear visual separation
- **Keyboard-First**: All features accessible via keyboard shortcuts
- **Responsive Design**: Adapt to different screen sizes and orientations
- **Error Feedback**: Clear, actionable error messages for LaTeX syntax errors
- **Undo/Redo**: Comprehensive undo/redo system for all user actions

### 8. Security Considerations
- **Input Sanitization**: Sanitize all LaTeX input to prevent code injection
- **File System Access**: Restrict file access to user-selected directories only
- **Network Requests**: Minimize external network dependencies
- **Update Mechanism**: Secure auto-update system for application updates

### 9. Testing Strategy
- **Unit Tests**: Jest for individual component testing
- **Integration Tests**: Test editor-preview synchronization
- **E2E Tests**: Playwright for full application workflow testing
- **Performance Tests**: Benchmark LaTeX rendering performance
- **Accessibility Tests**: Automated accessibility testing with axe-core

### 10. Development Workflow
- **Git Flow**: Use feature branches with pull request reviews
- **Commit Messages**: Follow conventional commit format
- **CI/CD**: Automated testing and building on every commit
- **Code Reviews**: All code must be reviewed before merging
- **Release Process**: Semantic versioning with automated changelog generation

## Implementation Guidelines

### Monaco Editor Integration
1. Create custom LaTeX language definition
2. Implement LaTeX-specific tokenizer
3. Build autocomplete provider with LaTeX command database
4. Add syntax error detection and highlighting
5. Implement bracket matching for LaTeX environments

### KaTeX Integration
1. Set up real-time rendering pipeline
2. Implement error handling for invalid LaTeX
3. Add support for custom macros and commands
4. Optimize rendering performance for large documents
5. Implement zoom and pan functionality for complex equations

### Electron-Specific Rules
1. Use context isolation for security
2. Implement proper IPC communication patterns
3. Handle window state management
4. Implement native menu integration
5. Add proper app lifecycle management

## Quality Gates
Before any release:
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Security review completed
- [ ] User acceptance testing completed
- [ ] Documentation updated

## Maintenance Guidelines
- **Regular Updates**: Keep all dependencies updated monthly
- **Performance Monitoring**: Monitor app performance in production
- **User Feedback**: Implement feedback collection and response system
- **Bug Triage**: Prioritize bugs based on user impact and frequency
- **Feature Requests**: Evaluate new features against core mission and complexity
