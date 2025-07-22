# TexFlow 开发规则 (Development Rules)

## 项目概述
TexFlow 是一个基于 Electron + React + TypeScript 的现代 LaTeX 方程编辑器，提供实时预览和智能自动补全功能。本文档定义了项目的开发规范和最佳实践。

## 🏗️ 架构原则

### 1. 分层架构
- **主进程层** (`src/main/`): Electron 主进程，处理系统级操作
- **渲染进程层** (`src/renderer/`): React 应用，处理 UI 和用户交互
- **预加载层** (`src/preload/`): 安全的 IPC 通信桥梁
- **共享层** (`src/shared/`): 跨进程共享的类型定义和常量

### 2. 模块化原则
- 每个功能模块应该具有单一职责
- 组件应该遵循组合模式而非继承
- 服务层应该与 UI 层解耦
- 使用依赖注入模式管理服务实例

### 3. 类型安全
- 所有代码必须使用 TypeScript
- 严格模式下开发 (`strict: true`)
- 禁止使用 `any` 类型，必要时使用 `unknown`
- IPC 通信必须有完整的类型定义

## 📁 文件组织规范

### 目录结构规则
```
src/
├── main/              # Electron 主进程
│   ├── main.ts        # 应用入口
│   ├── menu.ts        # 菜单定义
│   └── ipc-handlers.ts # IPC 处理器
├── preload/           # 预加载脚本
├── renderer/          # React 渲染进程
│   ├── components/    # React 组件
│   │   ├── Editor/    # 编辑器相关组件
│   │   ├── Preview/   # 预览相关组件
│   │   └── Layout/    # 布局组件
│   ├── services/      # 业务逻辑服务
│   ├── utils/         # 工具函数
│   ├── types/         # 类型定义
│   └── styles/        # 样式文件
└── shared/            # 跨进程共享代码
    ├── constants.ts   # 常量定义
    └── ipc-channels.ts # IPC 通道定义
```

### 文件命名规范
- **组件文件**: PascalCase (如 `LaTeXEditor.tsx`)
- **服务文件**: kebab-case (如 `katex-renderer.ts`)
- **工具文件**: kebab-case (如 `theme-manager.ts`)
- **类型文件**: kebab-case (如 `editor.ts`)
- **常量文件**: kebab-case (如 `constants.ts`)

## 💻 代码规范

### TypeScript 规范
```typescript
// ✅ 正确：使用接口定义对象类型
interface EditorConfig {
  fontSize: number;
  theme: 'light' | 'dark';
  language: string;
}

// ✅ 正确：使用类型别名定义联合类型
type ThemeMode = 'light' | 'dark' | 'auto';

// ✅ 正确：使用泛型提高代码复用性
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// ❌ 错误：避免使用 any
function processData(data: any) { } // 禁止

// ✅ 正确：使用具体类型或 unknown
function processData<T>(data: T): T { }
```

### React 组件规范
```typescript
// ✅ 正确：函数组件使用箭头函数
const LaTeXEditor: React.FC<LaTeXEditorProps> = ({ 
  content, 
  onChange, 
  onError 
}) => {
  // 使用 hooks
  const [localContent, setLocalContent] = useState(content);
  
  // 事件处理器使用 useCallback
  const handleContentChange = useCallback((newContent: string) => {
    setLocalContent(newContent);
    onChange?.(newContent);
  }, [onChange]);

  return (
    <div className="latex-editor">
      {/* JSX 内容 */}
    </div>
  );
};

// ✅ 正确：Props 接口定义
interface LaTeXEditorProps {
  content: string;
  onChange?: (content: string) => void;
  onError?: (error: string) => void;
  readOnly?: boolean;
}
```

### IPC 通信规范
```typescript
// ✅ 正确：在 shared/ipc-channels.ts 中定义通道
export const IPC_CHANNELS = {
  FILE_OPEN: 'file:open',
  FILE_SAVE: 'file:save',
} as const;

// ✅ 正确：定义请求和响应类型
export interface FileOpenRequest {
  filters?: FileFilter[];
}

export interface FileOpenResponse {
  filePath: string;
  content: string;
}

// ✅ 正确：在主进程中注册处理器
ipcMain.handle(IPC_CHANNELS.FILE_OPEN, async (_, request: FileOpenRequest) => {
  // 处理逻辑
  return response;
});
```

### 服务层规范
```typescript
// ✅ 正确：使用单例模式管理服务
export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeMode = 'light';

  private constructor() {}

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  public setTheme(theme: ThemeMode): void {
    this.currentTheme = theme;
    this.notifyListeners();
  }
}
```

## 🎨 UI/UX 规范

### 组件设计原则
1. **可复用性**: 组件应该设计为可在多个场景下使用
2. **可访问性**: 遵循 WCAG 2.1 AA 标准
3. **响应式**: 支持不同屏幕尺寸和分辨率
4. **性能优化**: 使用 React.memo 和 useMemo 避免不必要渲染

### 样式管理
- 使用 Tailwind CSS 进行样式管理
- 避免内联样式，使用 CSS 类
- 定义主题变量用于颜色和字体管理
- 使用语义化的 CSS 类名

### 状态管理
- 优先使用 React Hooks 进行状态管理
- 复杂状态使用 useReducer 模式
- 全局状态通过 Context API 管理
- 避免过度使用全局状态

## 🔧 开发工具配置

### ESLint 规则
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
```

### Prettier 配置
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

### TypeScript 配置
- 启用严格模式
- 使用路径映射简化导入
- 配置适当的目标版本 (ES2020)

## 🧪 测试规范

### 测试策略
- **单元测试**: 使用 Jest 测试工具函数和组件
- **集成测试**: 测试组件间交互
- **E2E 测试**: 使用 Playwright 测试完整用户流程

### 测试文件组织
```
src/
├── components/
│   ├── Editor/
│   │   ├── LaTeXEditor.tsx
│   │   └── LaTeXEditor.test.tsx  # 组件测试
├── services/
│   ├── katex-renderer.ts
│   └── katex-renderer.test.ts    # 服务测试
└── utils/
    ├── theme-manager.ts
    └── theme-manager.test.ts      # 工具测试
```

### 测试覆盖率要求
- 新增代码测试覆盖率不低于 80%
- 核心业务逻辑测试覆盖率不低于 90%
- 关键组件必须有完整的测试用例

## 🚀 性能优化规范

### 渲染性能
```typescript
// ✅ 使用 React.memo 优化组件渲染
const LaTeXPreview = React.memo<LaTeXPreviewProps>(({ content }) => {
  // 组件实现
});

// ✅ 使用 useMemo 缓存计算结果
const processedContent = useMemo(() => {
  return processLaTeX(content);
}, [content]);

// ✅ 使用 useCallback 缓存事件处理器
const handleContentChange = useCallback((newContent: string) => {
  onChange(newContent);
}, [onChange]);
```

### 包大小优化
- 使用动态导入分割代码
- 配置 Webpack 分包策略
- 移除未使用的依赖和代码
- 使用 Tree Shaking 优化打包

### 内存管理
- 及时清理事件监听器
- 避免内存泄漏
- 合理使用 React Effect 依赖数组

## 📦 构建和部署

### 构建流程
1. **类型检查**: `npm run type-check`
2. **代码检查**: `npm run lint`
3. **格式化**: `npm run format`
4. **测试**: `npm run test`
5. **构建**: `npm run build`
6. **打包**: `npm run build:all`

### 版本管理
- 遵循语义化版本 (Semantic Versioning)
- 使用 Git 标签标记发布版本
- 维护详细的 CHANGELOG.md

### 发布流程
1. 更新版本号
2. 运行完整测试套件
3. 生成发布说明
4. 创建 Git 标签
5. 构建发布包
6. 发布到相应平台

## 🔒 安全规范

### Electron 安全
- 禁用 Node.js 集成在渲染进程中
- 使用预加载脚本进行安全的 IPC 通信
- 启用上下文隔离
- 验证所有 IPC 消息

### 数据安全
- 敏感数据加密存储
- 输入验证和清理
- 避免 XSS 攻击
- 安全的文件操作

## 📝 文档规范

### 代码注释
```typescript
/**
 * LaTeX 渲染服务
 * 提供 LaTeX 到 HTML 的转换功能
 */
export class KaTeXRenderer {
  /**
   * 渲染 LaTeX 表达式
   * @param latex - LaTeX 表达式字符串
   * @param options - 渲染选项
   * @returns 渲染后的 HTML 字符串
   * @throws {LaTeXSyntaxError} 当 LaTeX 语法错误时抛出
   */
  public render(latex: string, options?: RenderOptions): string {
    // 实现
  }
}
```

### API 文档
- 所有公共 API 必须有完整文档
- 包含参数说明、返回值和示例
- 更新代码时同步更新文档

## 🐛 错误处理

### 错误分类
- **用户错误**: LaTeX 语法错误、文件格式错误
- **系统错误**: 文件读写失败、网络错误
- **程序错误**: 未捕获的异常、逻辑错误

### 错误处理策略
```typescript
// ✅ 正确：使用统一的错误处理
export class LaTeXError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly line?: number
  ) {
    super(message);
    this.name = 'LaTeXError';
  }
}

// ✅ 正确：优雅的错误处理
try {
  const result = await renderLaTeX(input);
  return result;
} catch (error) {
  if (error instanceof LaTeXError) {
    // 处理 LaTeX 特定错误
    showErrorMessage(error.message, error.line);
  } else {
    // 处理其他错误
    logger.error('Unexpected error:', error);
    showGenericErrorMessage();
  }
}
```

## 📊 监控和日志

### 日志记录
- 使用结构化日志记录
- 不同级别的日志 (DEBUG, INFO, WARN, ERROR)
- 敏感信息不记录到日志

### 性能监控
- 监控应用启动时间
- 跟踪渲染性能
- 记录内存使用情况

## 🤝 代码审查

### 审查清单
- [ ] 代码符合项目规范
- [ ] 测试覆盖率满足要求
- [ ] 性能影响评估
- [ ] 安全性检查
- [ ] 文档更新完整

### Pull Request 规范
- 清晰的描述和目的
- 合理的提交粒度
- 包含必要的测试
- 通过所有 CI 检查

## 📅 维护和更新

### 依赖管理
- 定期更新依赖包
- 关注安全漏洞报告
- 测试兼容性

### 代码重构
- 定期进行代码重构
- 保持测试覆盖率
- 逐步迁移过时 API

---

## 📌 重要提醒

1. **所有开发者必须熟悉并遵循此规范**
2. **规范会根据项目发展持续更新**
3. **违反规范的 PR 将不被合并**
4. **有问题或建议请及时提出讨论**

---

*最后更新时间: 2025-07-21*
*版本: 1.0.0*
