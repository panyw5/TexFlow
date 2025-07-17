import React from 'react';

interface ToolbarProps {
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onToggleTheme: () => void;
  onTogglePreview: () => void;
  onToggleSplitDirection: () => void;
  theme: 'light' | 'dark';
  previewVisible: boolean;
  splitDirection: 'horizontal' | 'vertical';
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onNewFile,
  onOpenFile,
  onSaveFile,
  onToggleTheme,
  onTogglePreview,
  onToggleSplitDirection,
  theme,
  previewVisible,
  splitDirection,
}) => {
  const buttonClass = `
    px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200
    border border-gray-600 hover:border-gray-500
    ${theme === 'dark' 
      ? 'bg-gray-700 text-white hover:bg-gray-600' 
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
    }
  `;

  const activeButtonClass = `
    px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200
    border border-blue-500 bg-blue-600 text-white hover:bg-blue-700
  `;

  return (
    <div className={`
      flex items-center gap-2 px-4 py-2 border-b
      ${theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-gray-100 border-gray-300'
      }
    `}>
      {/* File operations */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewFile}
          className={buttonClass}
          title="New File (⌘N)"
        >
          <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>
        
        <button
          onClick={onOpenFile}
          className={buttonClass}
          title="Open File (⌘O)"
        >
          <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Open
        </button>
        
        <button
          onClick={onSaveFile}
          className={buttonClass}
          title="Save File (⌘S)"
        >
          <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save
        </button>
      </div>

      {/* Separator */}
      <div className={`w-px h-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-400'}`} />

      {/* View options */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePreview}
          className={previewVisible ? activeButtonClass : buttonClass}
          title="Toggle Preview (⌘⇧P)"
        >
          <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </button>

        {previewVisible && (
          <button
            onClick={onToggleSplitDirection}
            className={buttonClass}
            title="Toggle Split Direction"
          >
            {splitDirection === 'horizontal' ? (
              <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5l7 7-7 7" />
              </svg>
            )}
            {splitDirection === 'horizontal' ? 'Horizontal' : 'Vertical'}
          </button>
        )}

        <button
          onClick={onToggleTheme}
          className={buttonClass}
          title="Toggle Theme (⌘⇧T)"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side info */}
      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        <span className="font-medium">InsTex</span>
        <span className="ml-2">LaTeX Editor</span>
      </div>
    </div>
  );
};
