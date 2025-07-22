import React, { useState, useRef } from 'react';
import { ExportModal } from './ExportModal';

interface ExportButtonProps {
  latex: string;
  disabled?: boolean;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ 
  latex, 
  disabled = false,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExportClick = () => {
    if (!disabled && latex.trim()) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleExportClick}
        disabled={disabled || !latex.trim()}
        className={className}
        style={{
          backgroundColor: '#3a3a3a',
          color: 'white',
          padding: '8px',
          borderRadius: '6px',
          border: '1px solid rgba(85, 85, 85, 0.5)',
          cursor: disabled || !latex.trim() ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          transition: 'all 0.2s ease',
          opacity: disabled || !latex.trim() ? 0.5 : 1
        }}
        onMouseEnter={(e) => {
          if (!disabled && latex.trim()) {
            e.currentTarget.style.backgroundColor = '#4a4a4a';
            e.currentTarget.style.borderColor = 'rgba(102, 102, 102, 0.5)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && latex.trim()) {
            e.currentTarget.style.backgroundColor = '#3a3a3a';
            e.currentTarget.style.borderColor = 'rgba(85, 85, 85, 0.5)';
          }
        }}
        title={latex.trim() ? "Export Formula" : "Enter LaTeX to export"}
      >
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-13h-6v1.99h6V19H3V4.99h6V3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>

      {isModalOpen && (
        <ExportModal
          latex={latex}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
