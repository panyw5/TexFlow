import React, { useState } from 'react';

interface DragDropTestProps {
  content: string;
  filename?: string;
}

const DragDropTest: React.FC<DragDropTestProps> = ({ content, filename = 'untitled.tex' }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
    
    if (window.electronAPI && window.electronAPI.startDrag) {
      // 基于文件扩展名确定文件类型
      const ext = filename.split('.').pop()?.toLowerCase();
      let filetype: 'tex' | 'pdf' | 'png' | 'html' = 'tex';
      
      if (ext === 'pdf') filetype = 'pdf';
      else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') filetype = 'png';
      else if (ext === 'html' || ext === 'htm') filetype = 'html';
      
      window.electronAPI.startDrag({
        filename,
        content,
        filetype
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="drag-drop-test">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        🚀 拖放测试功能
      </h3>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          拖拽下面的文件框到桌面或文件管理器来保存当前文档：
        </p>
        
        {/* LaTeX 文件拖放 */}
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={`
            border-2 border-dashed rounded-lg p-4 cursor-grab
            transition-all duration-200 select-none
            ${isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105 shadow-lg' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📄</div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {filename}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                LaTeX 源文件 ({Math.round(content.length / 1024 * 100) / 100} KB)
              </div>
            </div>
          </div>
          
          {isDragging && (
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
              正在拖拽到目标位置...
            </div>
          )}
        </div>

        {/* 额外的测试文件类型 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            draggable
            onDragStart={(e) => {
              e.preventDefault();
              window.electronAPI?.startDrag({
                filename: filename.replace(/\.[^.]+$/, '.html'),
                content: `<!DOCTYPE html>
<html>
<head>
    <title>TexFlow Export</title>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>
    <h1>LaTeX 文档导出</h1>
    <pre>${content}</pre>
</body>
</html>`,
                filetype: 'html'
              });
            }}
            className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 cursor-grab hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">🌐</span>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">HTML 预览</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">拖拽保存为 HTML</div>
              </div>
            </div>
          </div>

          <div
            draggable
            onDragStart={(e) => {
              e.preventDefault();
              const readmeContent = `# ${filename}

这是一个由 TexFlow 生成的 LaTeX 文档。

## 文档信息
- 文件名: ${filename}
- 大小: ${content.length} 字符
- 创建时间: ${new Date().toLocaleString()}

## LaTeX 源码

\`\`\`latex
${content}
\`\`\`

---
由 TexFlow 自动生成
`;
              window.electronAPI?.startDrag({
                filename: 'README.md',
                content: readmeContent,
                filetype: 'tex'
              });
            }}
            className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 cursor-grab hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">📝</span>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">README</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">拖拽保存 Markdown</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <strong>使用说明：</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li>拖拽文件框到桌面、文件管理器或其他应用程序</li>
            <li>文件会自动保存到目标位置</li>
            <li>支持多种文件格式：LaTeX、HTML、Markdown</li>
            <li>这是一个实验性功能，用于测试 Electron 的拖放能力</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export { DragDropTest };
