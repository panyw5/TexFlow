import React, { useEffect, useRef, useState } from 'react';
import { editor, monaco } from '../../services/monaco-ultra-minimal';
import { registerMinimalLatexLanguage } from '../../services/monaco-ultra-minimal';
import { katexRenderer } from '../../services/katex-ultra-minimal';

interface MinimalLaTeXEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  onPreviewChange?: (html: string) => void;
}

export const MinimalLaTeXEditor: React.FC<MinimalLaTeXEditorProps> = ({
  initialValue = '',
  onChange,
  onPreviewChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [currentValue, setCurrentValue] = useState(initialValue);

  useEffect(() => {
    if (editorRef.current && !monacoEditor.current) {
      // 注册精简的 LaTeX 语言
      registerMinimalLatexLanguage();

      // 创建编辑器实例
      monacoEditor.current = editor.create(editorRef.current, {
        value: initialValue,
        language: 'latex',
        theme: 'vs',
        fontSize: 14,
        lineNumbers: 'on',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on',
        // 禁用高级功能以提升性能
        codeLens: false,
        contextmenu: false,
        hover: { enabled: false },
        lightbulb: { enabled: false },
        parameterHints: { enabled: false },
        quickSuggestions: { other: true, comments: false, strings: false },
        suggest: {
          showSnippets: false,
          showWords: false,
          showMethods: false,
          showFunctions: true,
          showConstructors: false,
          showFields: false,
          showVariables: false,
          showClasses: false,
          showStructs: false,
          showInterfaces: false,
          showModules: false,
          showProperties: false,
          showEvents: false,
          showOperators: false,
          showUnits: false,
          showValues: false,
          showConstants: false,
          showEnums: false,
          showEnumMembers: false,
          showKeywords: false,
          showColors: false,
          showFiles: false,
          showReferences: false,
          showFolders: false,
          showTypeParameters: false,
          showIssues: false,
          showUsers: false,
        }
      });

      // 监听内容变化
      monacoEditor.current.onDidChangeModelContent(() => {
        const value = monacoEditor.current?.getValue() || '';
        setCurrentValue(value);
        onChange?.(value);
        
        // 实时预览
        try {
          const html = katexRenderer.renderToString(value);
          onPreviewChange?.(html);
        } catch (error) {
          console.warn('Preview render error:', error);
        }
      });
    }

    return () => {
      monacoEditor.current?.dispose();
    };
  }, []);

  return (
    <div 
      ref={editorRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        border: '1px solid #d1d5db',
        borderRadius: '4px'
      }} 
    />
  );
};
