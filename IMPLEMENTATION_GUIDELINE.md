# 可切换渲染引擎与自定义模板功能实现指南

本文档旨在为 TexFlow 应用添加**可切换的 LaTeX 渲染引擎（KaTeX/MathJax）**以及**自定义模板和包**功能提供详细的实现计划。

## 1. 功能概述

1.  **双引擎支持**: 用户可以在 **KaTeX** (速度快) 和 **MathJax** (功能强，兼容性好) 之间自由切换，以适应不同的需求。
2.  **自定义模板 (Preamble)**: 允许用户创建和管理自己的 LaTeX preamble，用于定义常用的宏、命令和文档设置。此功能将主要由 MathJax 支持。
3.  **自定义包**: 允许用户加载特定的 MathJax 扩展包（如 `mhchem`, `physics` 等），以使用高级的、特定领域的排版功能。

## 2. UI/UX 设计

### 2.1 预览面板 (Preview Panel)

- 在预览面板的工具栏或状态栏中，增加一个**切换按钮** (例如，一个带有 KaTeX/MathJax 图标的 Toggle Switch)。
- 用户点击此按钮可以即时切换当前文档的渲染引擎。
- 应用应记住用户对每个文档的选择。

### 2.2 设置界面

在应用的“设置” > “LaTeX”部分，进行如下设计：

- **渲染引擎默认设置**: 提供一个选项，让用户选择新建文档时默认使用的渲染引擎。
- **模板管理**: 
    - 显示一个自定义模板列表（例如，“我的通用模板”、“物理论文模板”）。
    - 提供“新建模板”、“编辑”、“删除”功能。
    - “新建/编辑”时，弹出一个代码编辑器，让用户直接编写和修改模板的 LaTeX 代码 (Preamble 内容)。
- **包管理 (针对 MathJax)**:
    - 提供一个界面，让用户可以启用或禁用常用的 MathJax 扩展包。
    - 可以是一个复选框列表，列出诸如 `ams`, `mhchem`, `bussproofs`, `physics` 等常用包。

## 3. 文件结构变更

```
src/
├── main/
│   └── ...
├── renderer/
│   ├── components/
│   │   ├── Preview/
│   │   │   └── RendererToggle.tsx   // 新增：渲染引擎切换按钮组件
│   │   ├── Settings/
│   │   │   └── LatexSettings.tsx    // 修改：管理模板和包的 UI
│   │   └── ...
│   ├── services/
│   │   ├── rendering/
│   │   │   ├── IRenderer.ts         // 新增：渲染器接口
│   │   │   ├── katex-renderer.ts    // 修改：实现 IRenderer
│   │   │   ├── mathjax-renderer.ts  // 新增：实现 IRenderer
│   │   │   └── renderer-manager.ts  // 新增：管理和切换渲染器
│   │   ├── user-config-manager.ts // 新增：管理用户模板和包的配置
│   │   └── ...
│   ├── types/
│   │   ├── user-config.ts         // 新增：定义模板和包的数据结构
│   │   └── ...
│   └── ...
└── shared/
    └── ... // 用户数据仍由主进程通过 IPC 管理
```

## 4. 实现步骤

### 步骤 1: 渲染器抽象化

创建渲染器接口 `src/renderer/services/rendering/IRenderer.ts`：

```typescript
export interface IRenderer {
  render(latex: string, options?: any): Promise<string>;
}
```

- 修改 `katex-renderer.ts` 和新建 `mathjax-renderer.ts` 来实现此接口。
- `mathjax-renderer.ts` 的 `render` 方法将接收一个 `options` 对象，其中包含要应用的自定义模板 (preamble) 和包。

### 步骤 2: 渲染管理器 (`renderer-manager.ts`)

- 创建 `RendererManager`，负责根据用户选择实例化和切换渲染器。
- 提供方法如 `getRenderer(engine: 'katex' | 'mathjax'): IRenderer`。
- 实现动态加载逻辑：默认加载 KaTeX，当用户首次切换到 MathJax 时，异步加载 MathJax 库。

### 步骤 3: 用户配置管理

- 创建 `UserConfigManager` (`user-config-manager.ts`) 和相应的数据类型 (`user-config.ts`)。
- `UserConfigManager` 负责通过 IPC 与主进程通信，增删改查存储在 `userData` 目录下的模板和包配置 (例如，一个 `latex-settings.json` 文件)。

### 步骤 4: MathJax 渲染器实现 (`mathjax-renderer.ts`)

这是实现自定义功能的核心。

```typescript
import { MathJax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
// ... 其他所需组件

export class MathJaxRenderer implements IRenderer {
  async render(latex: string, options: { preamble: string, packages: string[] }): Promise<string> {
    const texConfig = {
      packages: ['base', ...options.packages],
      macros: { ... }, // 可以从 preamble 解析宏
      // 这里是关键：将用户的 preamble 内容整合进来
      preamble: options.preamble 
    };

    const mathjax_document = MathJax.document('', { InputJax: new TeX(texConfig), OutputJax: new CHTML() });
    
    // ... 调用 MathJax 的渲染方法
    // ... 返回渲染后的 HTML
  }
}
```

### 步骤 5: UI 组件实现

- **`RendererToggle.tsx`**: 实现切换按钮，并与状态管理（如 React Context）挂钩，以通知应用渲染引擎的变化。
- **`LatexSettings.tsx`**: 使用 `UserConfigManager` 来构建模板和包的管理界面。用户的更改将通过 IPC 保存到本地。

### 步骤 6: 主进程 IPC Handlers

- 在 `src/main/ipc-handlers.ts` 中扩展 IPC 接口，以支持对 `latex-settings.json` 文件的读写操作，确保数据的持久化存储。

## 5. 数据管理

- **用户配置**: 在 `app.getPath('userData')` 目录下创建一个 `latex-settings.json` 文件，用于存储所有模板内容、启用的包列表以及默认渲染引擎等设置。
- **模板内容**: 直接将模板的 LaTeX 字符串存储在上述 JSON 文件中。

## 6. 总结

该方案通过引入渲染器抽象层和专门的用户配置管理器，提供了一个灵活且可扩展的架构。它不仅实现了 KaTeX 和 MathJax 的动态切换，还为 MathJax 提供了强大的自定义模板和包管理接口，极大地提升了应用的专业性和灵活性。