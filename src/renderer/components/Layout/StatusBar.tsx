import React from 'react';
import * as path from 'path';

interface StatusBarProps {
  filePath: string | null;
  isDirty: boolean;
  lineCount: number;
  theme: 'light' | 'dark';
  currentLine?: number;
  currentColumn?: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  filePath,
  isDirty,
  lineCount,
  theme,
  currentLine = 1,
  currentColumn = 1,
}) => {
  const getFileName = (filePath: string | null): string => {
    if (!filePath) return 'Untitled';
    return path.basename(filePath);
  };

  const getFileDirectory = (filePath: string | null): string => {
    if (!filePath) return '';
    return path.dirname(filePath);
  };

  return (
    <div className={`
      flex items-center justify-between px-4 py-1 text-xs border-t
      ${theme === 'dark' 
        ? 'bg-blue-600 text-white border-blue-500' 
        : 'bg-blue-500 text-white border-blue-400'
      }
    `}>
      {/* Left side - File info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="font-medium">
            {getFileName(filePath)}
            {isDirty && <span className="ml-1">•</span>}
          </span>
          {filePath && (
            <span className="ml-2 opacity-75">
              {getFileDirectory(filePath)}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span>Lines: {lineCount}</span>
          <span>•</span>
          <span>Ln {currentLine}, Col {currentColumn}</span>
        </div>
      </div>

      {/* Right side - Editor info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span>LaTeX</span>
          <span>•</span>
          <span>UTF-8</span>
        </div>

        <div className="flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
};
