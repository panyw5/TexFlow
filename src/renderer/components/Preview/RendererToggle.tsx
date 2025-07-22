import React from 'react';

interface RendererToggleProps {
  currentRenderer: 'katex' | 'mathjax';
  onToggle: () => void;
}

export const RendererToggle: React.FC<RendererToggleProps> = ({ currentRenderer, onToggle }) => {
  return (
    <div className="renderer-toggle">
      <button onClick={onToggle} title="Switch Renderer">
        {currentRenderer === 'katex' ? 'KaTeX' : 'MathJax'}
      </button>
    </div>
  );
};