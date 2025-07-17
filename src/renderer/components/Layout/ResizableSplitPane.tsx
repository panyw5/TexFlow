import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ResizableSplitPaneProps {
  direction: 'horizontal' | 'vertical';
  children: [React.ReactNode, React.ReactNode];
  defaultSize?: number; // Percentage (0-100)
  minSize?: number; // Percentage
  maxSize?: number; // Percentage
}

export const ResizableSplitPane: React.FC<ResizableSplitPaneProps> = ({
  direction,
  children,
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
}) => {
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      let newSize: number;

      if (direction === 'horizontal') {
        const relativeX = e.clientX - containerRect.left;
        newSize = (relativeX / containerRect.width) * 100;
      } else {
        const relativeY = e.clientY - containerRect.top;
        newSize = (relativeY / containerRect.height) * 100;
      }

      // Clamp size to min/max bounds
      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(newSize);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [direction, minSize, maxSize]);

  // Add cursor style to body when dragging
  useEffect(() => {
    if (isDragging) {
      const cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.cursor = cursor;
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, direction]);

  const firstPaneStyle = direction === 'horizontal' 
    ? { width: `${size}%`, height: '100%' }
    : { width: '100%', height: `${size}%` };

  const secondPaneStyle = direction === 'horizontal'
    ? { width: `${100 - size}%`, height: '100%' }
    : { width: '100%', height: `${100 - size}%` };

  const resizerStyle = {
    backgroundColor: isDragging ? '#60a5fa' : '#374151',
    cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
    flexShrink: 0,
    transition: isDragging ? 'none' : 'background-color 0.2s ease',
    ...(direction === 'horizontal' 
      ? { width: '4px', height: '100%' }
      : { width: '100%', height: '4px' }
    ),
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex', 
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        overflow: 'hidden'
      }}
    >
      {/* First pane */}
      <div style={firstPaneStyle}>
        {children[0]}
      </div>

      {/* Resizer */}
      <div
        style={{
          ...resizerStyle,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={() => setSize(50)} // Double-click to reset to 50%
      >
        {/* Visual indicator */}
        <div style={{
          pointerEvents: 'none',
          opacity: isDragging ? 1 : 0.5,
          transition: 'opacity 0.2s ease',
          color: isDragging ? '#ffffff' : '#9ca3af'
        }}>
          {direction === 'horizontal' ? (
            <div style={{
              width: '2px',
              height: '16px',
              backgroundColor: 'currentColor',
              borderRadius: '1px'
            }} />
          ) : (
            <div style={{
              width: '16px',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px'
            }} />
          )}
        </div>
      </div>

      {/* Second pane */}
      <div style={secondPaneStyle}>
        {children[1]}
      </div>
    </div>
  );
};
