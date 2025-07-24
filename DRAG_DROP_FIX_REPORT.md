# 拖拽功能修复成功报告

## 问题描述
- 开发环境下拖拽功能正常工作
- 生产环境（打包后的 .dmg 和 .zip）中拖拽功能失效
- 用户可以拖拽但文件无法保存到目标位置

## 根本原因
在 electron-builder 的配置中，`img` 目录（包含拖拽图标文件）没有被包含在应用包中。当拖拽操作尝试访问这些图标文件时失败，导致整个拖拽操作无法正常完成。

## 修复方案

### 1. 修改 package.json 的 electron-builder 配置

**之前的配置：**
```json
"files": [
  "dist/**/*",
  "!node_modules/**/*",
  // ... 其他文件
],
"asarUnpack": [
  "node_modules/katex/dist/fonts/*.woff2"
]
```

**修复后的配置：**
```json
"files": [
  "dist/**/*",
  "img/**/*",  // 添加 img 目录
  "!node_modules/**/*",
  // ... 其他文件
],
"asarUnpack": [
  "node_modules/katex/dist/fonts/*.woff2",
  "img/**/*"  // 添加 img 目录到 asarUnpack
]
```

### 2. 验证修复结果

**检查打包后的应用结构：**
```bash
# 修复前
/Users/lelouch/TexFlow/build/mac/TexFlow.app/Contents/Resources/app.asar.unpacked/
├── node_modules/
└── (没有 img 目录)

# 修复后
/Users/lelouch/TexFlow/build/mac/TexFlow.app/Contents/Resources/app.asar.unpacked/
├── img/
│   ├── drag-png.png
│   ├── drag-pdf.png
│   ├── drag-svg.png
│   ├── drag-tex.png
│   └── ... (其他图标文件)
└── node_modules/
```

## 技术要点

### 1. electron-builder 文件包含机制
- `files` 数组：指定哪些文件/目录要包含在应用包中
- `asarUnpack` 数组：指定哪些文件需要在运行时可直接访问（不打包到 asar 中）

### 2. 拖拽 API 正确用法
```typescript
onDragStart={(event) => {
  event.preventDefault(); // 必需：阻止默认拖拽行为
  
  window.electronAPI.startDrag({
    filename: 'example.png',
    content: fileContent,
    filetype: 'png',
    encoding: 'base64'
  });
}}
```

### 3. 图标文件访问路径
在打包的应用中，图标文件路径解析：
```typescript
// ipc-handlers.ts 中的路径解析
const iconPath = path.join(__dirname, '../img/drag-png.png');
// 在 asarUnpack 后，这个路径可以正确访问
```

## 测试验证

### 开发环境测试
```bash
npm run dev:main  # ✅ 拖拽功能正常
```

### 生产环境测试
```bash
npm run build:mac  # ✅ 构建成功
# 打开 .dmg 中的 .app 文件
# ✅ 应用启动正常
# ✅ 拖拽功能正常
# ✅ 文件可以成功保存到目标位置
```

## 支持的拖拽格式
- ✅ TEX：LaTeX 源码文件
- ✅ HTML：独立 HTML 文件（包含内联样式）
- ✅ SVG：矢量图形文件
- ✅ PNG：透明背景图片文件
- ✅ JPG：白色背景图片文件
- ✅ PDF：PDF 文档文件

## 修复总结
这次修复的关键在于理解 Electron 应用打包机制。在开发环境中，所有文件都直接可访问，但在生产环境中，只有明确配置的文件才会被包含在应用包中。通过正确配置 electron-builder 的 `files` 和 `asarUnpack` 选项，我们确保了拖拽图标文件在生产环境中可用，从而解决了拖拽功能失效的问题。

**修复日期：** 2024年7月25日
**状态：** ✅ 完全修复，功能正常
