import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface SimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: 'light' | 'dark';
}

export const SimpleEditor: React.FC<SimpleEditorProps> = ({
  value,
  onChange,
  theme,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    console.log('Initializing Monaco Editor...', editorRef.current);

    // Create a simple Monaco editor without custom language
    monacoRef.current = monaco.editor.create(editorRef.current, {
      value,
      language: 'plaintext', // Start with plaintext instead of custom LaTeX
      theme: theme === 'dark' ? 'vs-dark' : 'vs',
      fontSize: 14,
      lineNumbers: 'on',
      minimap: { enabled: false },
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      readOnly: false,
    });

    console.log('Monaco Editor created:', monacoRef.current);

    // Set up change listener
    const disposable = monacoRef.current.onDidChangeModelContent(() => {
      const newValue = monacoRef.current?.getValue() || '';
      onChange(newValue);
    });

    // Force layout after a short delay
    setTimeout(() => {
      monacoRef.current?.layout();
    }, 100);

    return () => {
      disposable.dispose();
      monacoRef.current?.dispose();
    };
  }, []);

  // Update theme
  useEffect(() => {
    if (monacoRef.current) {
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }
  }, [theme]);

  // Update value
  useEffect(() => {
    if (monacoRef.current && value !== monacoRef.current.getValue()) {
      monacoRef.current.setValue(value);
    }
  }, [value]);

  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1e1e1e'
    }}>
      <div style={{
        backgroundColor: '#374151',
        padding: '8px',
        fontSize: '14px',
        color: 'white',
        flexShrink: 0
      }}>
        Simple Monaco Editor (PlainText Mode)
      </div>
      <div
        ref={editorRef}
        style={{
          flex: 1,
          width: '100%',
          minHeight: '200px',
          position: 'relative',
          backgroundColor: '#1e1e1e'
        }}
      />
    </div>
  );
};
