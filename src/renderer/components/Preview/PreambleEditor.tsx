import React, { useState, useEffect } from 'react';

interface PreambleEditorProps {
  initialPreamble: string;
  onSave: (preamble: string) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export const PreambleEditor: React.FC<PreambleEditorProps> = ({
  initialPreamble,
  onSave,
  onCancel,
  isVisible
}) => {
  const [preamble, setPreamble] = useState(initialPreamble);

  useEffect(() => {
    setPreamble(initialPreamble);
  }, [initialPreamble]);

  const handleSave = () => {
    onSave(preamble);
    onCancel(); // Close the editor after saving
  };  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1e1e1e',
        border: '1px solid #333',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: 'white', fontSize: '16px' }}>
            Edit MathJax Macros
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '12px' }}>
            Define custom commands using \newcommand (packages must be enabled separately)
          </p>
        </div>
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#666';
          }}
          title="Close (Esc)"
        >
          ×
        </button>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <textarea
          value={preamble}
          onChange={(e) => setPreamble(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="% Enter custom macro definitions...&#10;% Only \\newcommand and similar are supported here&#10;% Packages must be enabled in settings&#10;&#10;\\newcommand{\\R}{\\mathbb{R}}&#10;\\newcommand{\\norm}[1]{\\left\\|#1\\right\\|}"
          style={{
            width: '100%',
            flex: 1,
            backgroundColor: '#2d2d2d',
            color: 'white',
            border: '1px solid #444',
            borderRadius: '4px',
            padding: '12px',
            fontSize: '14px',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            resize: 'none',
            outline: 'none',
            lineHeight: '1.4',
          }}
          autoFocus
        />
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '12px', color: '#888' }}>
          Press Ctrl/Cmd+S to save, Esc to cancel • Changes apply immediately after saving
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#3a3a3a',
              color: '#999',
              border: '1px solid #555',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4a4a4a';
              e.currentTarget.style.color = '#ccc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3a3a3a';
              e.currentTarget.style.color = '#999';
            }}
            title="Cancel (Esc)"
          >
            ✕
          </button>
          <button
            onClick={handleSave}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: '1px solid #28a745',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#34ce57';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#28a745';
            }}
            title="Save & Exit (Ctrl/Cmd+S)"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
};
