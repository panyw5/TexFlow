# Project Setup Guide

## Initial Project Structure
```
latex-editor/
├── src/
│   ├── main/                     # Electron main process
│   │   ├── main.ts              # Main entry point
│   │   ├── menu.ts              # Application menu
│   │   ├── window-manager.ts    # Window management
│   │   └── ipc-handlers.ts      # IPC communication handlers
│   ├── renderer/                # Electron renderer process
│   │   ├── components/          # React components
│   │   │   ├── Editor/
│   │   │   │   ├── LaTeXEditor.tsx
│   │   │   │   ├── EditorToolbar.tsx
│   │   │   │   └── EditorSettings.tsx
│   │   │   ├── Preview/
│   │   │   │   ├── LaTeXPreview.tsx
│   │   │   │   ├── PreviewToolbar.tsx
│   │   │   │   └── ErrorDisplay.tsx
│   │   │   ├── Layout/
│   │   │   │   ├── SplitPane.tsx
│   │   │   │   ├── Toolbar.tsx
│   │   │   │   └── StatusBar.tsx
│   │   │   └── App.tsx
│   │   ├── services/            # Business logic
│   │   │   ├── latex-language-service.ts
│   │   │   ├── latex-completion-provider.ts
│   │   │   ├── latex-diagnostics-provider.ts
│   │   │   ├── katex-renderer.ts
│   │   │   └── file-manager.ts
│   │   ├── utils/               # Utility functions
│   │   │   ├── latex-parser.ts
│   │   │   ├── debounce.ts
│   │   │   └── theme-manager.ts
│   │   ├── types/               # TypeScript definitions
│   │   │   ├── latex.ts
│   │   │   ├── editor.ts
│   │   │   └── app.ts
│   │   ├── data/                # Static data
│   │   │   ├── latex-commands.ts
│   │   │   └── latex-symbols.ts
│   │   ├── styles/              # CSS/SCSS files
│   │   │   ├── globals.css
│   │   │   └── components/
│   │   ├── assets/              # Static assets
│   │   │   ├── icons/
│   │   │   └── images/
│   │   └── index.html           # Renderer HTML
│   ├── shared/                  # Shared between main and renderer
│   │   ├── types/
│   │   ├── constants.ts
│   │   └── ipc-channels.ts
│   └── preload/                 # Preload scripts
│       └── preload.ts
├── tests/                       # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── build/                       # Build configuration
│   ├── webpack.config.js
│   └── electron-builder.json
├── docs/                        # Documentation
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
└── README.md
```

## Package.json Template
```json
{
  "name": "latex-editor",
  "version": "1.0.0",
  "description": "A lightweight macOS application for editing and previewing LaTeX equations in real-time",
  "main": "dist/main/main.js",
  "homepage": "./",
  "scripts": {
    "dev": "concurrently \"npm run dev:renderer\" \"npm run dev:main\"",
    "dev:renderer": "vite",
    "dev:main": "tsc -p tsconfig.main.json && electron dist/main/main.js",
    "build": "npm run build:renderer && npm run build:main",
    "build:renderer": "vite build",
    "build:main": "tsc -p tsconfig.main.json",
    "build:all": "npm run build && electron-builder",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "type-check": "tsc --noEmit",
    "clean": "rimraf dist build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "monaco-editor": "^0.45.0",
    "katex": "^0.16.9",
    "mathjs": "^12.2.1",
    "electron-store": "^8.1.0",
    "lodash.debounce": "^4.0.8"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@types/katex": "^0.16.7",
    "@types/lodash.debounce": "^4.0.9",
    "@types/node": "^20.10.5",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "@vitejs/plugin-react": "^4.2.1",
    "concurrently": "^8.2.2",
    "electron": "^28.1.0",
    "electron-builder": "^24.9.1",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jest": "^29.7.0",
    "playwright": "^1.40.1",
    "prettier": "^3.1.1",
    "rimraf": "^5.0.5",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.10",
    "vite-plugin-electron": "^0.28.1"
  },
  "build": {
    "appId": "com.yourcompany.latex-editor",
    "productName": "LaTeX Editor",
    "directories": {
      "output": "build"
    },
    "files": [
      "dist/**/*",
      "node_modules/**/*"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ]
    },
    "dmg": {
      "title": "LaTeX Editor",
      "icon": "assets/icon.icns"
    }
  },
  "author": "Your Name",
  "license": "MIT"
}
```

## TypeScript Configuration

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/renderer/components/*"],
      "@/services/*": ["src/renderer/services/*"],
      "@/utils/*": ["src/renderer/utils/*"],
      "@/types/*": ["src/renderer/types/*"]
    }
  },
  "include": [
    "src/renderer/**/*",
    "src/shared/**/*",
    "src/preload/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ]
}
```

### tsconfig.main.json
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "dist/main",
    "module": "CommonJS",
    "target": "ES2020",
    "noEmit": false
  },
  "include": [
    "src/main/**/*",
    "src/shared/**/*"
  ]
}
```

## Vite Configuration

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/renderer/components'),
      '@/services': path.resolve(__dirname, 'src/renderer/services'),
      '@/utils': path.resolve(__dirname, 'src/renderer/utils'),
      '@/types': path.resolve(__dirname, 'src/renderer/types'),
    },
  },
  server: {
    port: 3000,
  },
});
```

## ESLint Configuration

### .eslintrc.js
```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

## Prettier Configuration

### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Setup Commands

### 1. Initialize Project
```bash
mkdir latex-editor
cd latex-editor
npm init -y
```

### 2. Install Dependencies
```bash
# Core dependencies
npm install react react-dom monaco-editor katex mathjs electron-store lodash.debounce

# Development dependencies
npm install -D @types/react @types/react-dom @types/katex @types/lodash.debounce @types/node
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D @vitejs/plugin-react concurrently electron electron-builder
npm install -D eslint eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks
npm install -D jest playwright prettier rimraf tailwindcss typescript vite vite-plugin-electron
```

### 3. Create Directory Structure
```bash
mkdir -p src/{main,renderer/{components/{Editor,Preview,Layout},services,utils,types,data,styles,assets},shared,preload}
mkdir -p tests/{unit,integration,e2e}
mkdir -p build docs
```

### 4. Initialize Configuration Files
```bash
# Create TypeScript configs
touch tsconfig.json tsconfig.main.json

# Create build configs
touch vite.config.ts .eslintrc.js .prettierrc

# Create documentation
touch DEVELOPMENT_RULES.md DEVELOPMENT_PLAN.md TECH_SPEC_MONACO_LATEX.md
```

## Next Steps After Setup
1. Create basic Electron main process
2. Set up React renderer with Vite
3. Integrate Monaco Editor
4. Implement basic LaTeX language service
5. Add KaTeX preview functionality
6. Begin iterative development following the development plan
