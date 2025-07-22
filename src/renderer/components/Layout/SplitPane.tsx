import React, { useState, useRef, useCallback, useEffect } from 'react';

interface SplitPaneProps {
  direction: 'horizontal' | 'vertical';
  children: [React.ReactNode, React.ReactNode];
  defaultSize?: number; // Percentage (0-100)
  minSize?: number; // Percentage
  maxSize?: number; // Percentage
  onResize?: (size: number) => void;
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  direction,
  children,
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
  onResize,
}) => {
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    // Add global mouse event listeners
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      let newSize: number;

      if (direction === 'horizontal') {
        const relativeY = e.clientY - containerRect.top;
        newSize = (relativeY / containerRect.height) * 100;
      } else {
        const relativeX = e.clientX - containerRect.left;
        newSize = (relativeX / containerRect.width) * 100;
      }

      // Clamp size to min/max bounds
      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      
      setSize(newSize);
      onResize?.(newSize);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [direction, minSize, maxSize, onResize]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = 5; // 5% steps
    let newSize = size;

    if (direction === 'horizontal') {
      if (e.key === 'ArrowUp') {
        newSize = Math.max(minSize, size - step);
      } else if (e.key === 'ArrowDown') {
        newSize = Math.min(maxSize, size + step);
      }
    } else {
      if (e.key === 'ArrowLeft') {
        newSize = Math.max(minSize, size - step);
      } else if (e.key === 'ArrowRight') {
        newSize = Math.min(maxSize, size + step);
      }
    }

    if (newSize !== size) {
      e.preventDefault();
      setSize(newSize);
      onResize?.(newSize);
    }
  }, [direction, size, minSize, maxSize, onResize]);

  // Add cursor style to body when dragging
  useEffect(() => {
    if (isDragging) {
      const cursor = direction === 'horizontal' ? 'row-resize' : 'col-resize';
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

  const containerClasses = `
    flex h-full w-full
    ${direction === 'horizontal' ? 'flex-col' : 'flex-row'}
  `;

  const resizerClasses = `
    bg-gray-600 hover:bg-gray-500 transition-colors duration-200 z-10
    ${direction === 'horizontal' 
      ? 'h-1 w-full cursor-row-resize' 
      : 'w-1 h-full cursor-col-resize'
    }
    ${isDragging ? 'bg-blue-500' : ''}
  `;

  const firstPaneStyle = direction === 'horizontal' 
    ? { height: `${size}%` }
    : { width: `${size}%` };

  const secondPaneStyle = direction === 'horizontal'
    ? { height: `${100 - size}%` }
    : { width: `${100 - size}%` };

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* First pane */}
      <div 
        className="overflow-hidden"
        style={firstPaneStyle}
      >
        {children[0]}
      </div>

      {/* Resizer */}
      <div
        ref={resizerRef}
        className={resizerClasses}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="separator"
        aria-orientation={direction === 'horizontal' ? 'horizontal' : 'vertical'}
        aria-valuenow={size}
        aria-valuemin={minSize}
        aria-valuemax={maxSize}
        aria-label={`Resize ${direction} split pane`}
      >
        {/* Visual indicator */}
        <div className={`
          absolute inset-0 flex items-center justify-center
          ${direction === 'horizontal' ? 'flex-row' : 'flex-col'}
        `}>
          <div className={`
            bg-gray-400 rounded
            ${direction === 'horizontal' 
              ? 'w-20 h-2' 
              : 'w-2 h-20'
            }
          `} />
        </div>
      </div>

      {/* Second pane */}
      <div 
        className="overflow-hidden"
        style={secondPaneStyle}
      >
        {children[1]}
      </div>
    </div>
  );
};
