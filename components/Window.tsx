/* ==========================================================================
   IMPORTS
   ========================================================================== */
import React, { useEffect, useRef, useState } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { useOS } from '../context/OSContext';
import { WindowState } from '../types';
import { APPS } from '../constants';
import DynamicIcon from './DynamicIcon';

interface WindowProps {
  windowState: WindowState;
  component: React.ComponentType<any>;
}

/* ==========================================================================
   MAIN COMPONENT: Window
   ========================================================================== */
// A draggable, resizable window component that wraps application content.
const Window: React.FC<WindowProps> = ({ windowState, component: Component }) => {
  /* --- Hooks & Context State --- */
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    activeWindowId
  } = useOS();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<string | null>(null);

  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialRect, setInitialRect] = useState({ x: 0, y: 0, w: 0, h: 0 });


  /* --- Dragging & Resizing Handlers --- */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;

    focusWindow(windowState.id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialRect({
      x: windowState.position.x,
      y: windowState.position.y,
      w: windowState.size.w,
      h: windowState.size.h
    });
  };

  const startResize = (e: React.MouseEvent, dir: string) => {
    e.stopPropagation();
    e.preventDefault();
    focusWindow(windowState.id);
    setIsResizing(true);
    setResizeDir(dir);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialRect({
      x: windowState.position.x,
      y: windowState.position.y,
      w: windowState.size.w,
      h: windowState.size.h
    });
  };

  /* --- Effects: Mouse Movement Tracking --- */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        updateWindowPosition(windowState.id, initialRect.x + dx, initialRect.y + dy);
      }

      if (isResizing && resizeDir) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;

        let newW = initialRect.w;
        let newH = initialRect.h;
        let newX = initialRect.x;
        let newY = initialRect.y;

        if (resizeDir.includes('e')) newW = Math.max(300, initialRect.w + dx);
        if (resizeDir.includes('s')) newH = Math.max(200, initialRect.h + dy);
        if (resizeDir.includes('w')) {
          const possibleW = Math.max(300, initialRect.w - dx);
          newW = possibleW;
          newX = initialRect.x + (initialRect.w - possibleW);
        }
        if (resizeDir.includes('n')) {
          const possibleH = Math.max(200, initialRect.h - dy);
          newH = possibleH;
          newY = initialRect.y + (initialRect.h - possibleH);
        }

        updateWindowSize(windowState.id, newW, newH);
        if (newX !== initialRect.x || newY !== initialRect.y) {
          updateWindowPosition(windowState.id, newX, newY);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDir(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeDir, dragStart, initialRect, updateWindowPosition, updateWindowSize, windowState.id]);

  /* ==========================================================================
     RENDER RETURN
     ========================================================================== */
  return (
    <div
      className={`absolute flex flex-col bg-[#1a1a1a] shadow-2xl overflow-hidden transition-all duration-300 border border-white/10 ${windowState.isMaximized ? 'inset-0 !translate-x-0 !translate-y-0 rounded-none' : 'rounded-lg'} ${windowState.isMinimized ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto'}`}
      style={{
        left: windowState.isMaximized ? 0 : windowState.position.x,
        top: windowState.isMaximized ? 0 : windowState.position.y,
        width: windowState.isMaximized ? '100%' : windowState.size.w,
        height: windowState.isMaximized ? 'calc(100% - 48px)' : windowState.size.h,
        zIndex: windowState.zIndex,
        display: windowState.isMinimized ? 'none' : 'flex' // Or visibility: hidden if we want to keep it mounted but hidden
      }}
      onClick={(e) => {
        e.stopPropagation();
        focusWindow(windowState.id);
      }}
    >
      {/* Title Bar */}
      <div
        className="h-8 bg-[#202020] flex justify-between items-center select-none text-gray-300 border-b border-[#333]"
        onMouseDown={handleMouseDown}
        onDoubleClick={() => maximizeWindow(windowState.id)}
      >
        <div className="flex items-center px-2 flex-1 h-full cursor-default">
          <DynamicIcon icon={APPS[windowState.appId].icon} size={16} className="ml-1" />
          <span className="text-xs ml-2 font-medium">{windowState.title}</span>
        </div>
        <div className="flex h-full">
          <button
            className="w-10 h-full flex items-center justify-center hover:bg-[#333] transition-colors"
            onClick={(e) => { e.stopPropagation(); minimizeWindow(windowState.id); }}
          >
            <Minus size={14} />
          </button>
          <button
            className="w-10 h-full flex items-center justify-center hover:bg-[#333] transition-colors"
            onClick={(e) => { e.stopPropagation(); maximizeWindow(windowState.id); }}
          >
            <Square size={12} />
          </button>
          <button
            className="w-10 h-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); closeWindow(windowState.id); }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-[#121212]">
        <Component windowState={windowState} />
      </div>

      {/* Resize Handles - Only if not maximized */}
      {!windowState.isMaximized && (
        <>
          {/* Sides */}
          <div className="absolute top-0 right-0 w-1 h-full cursor-e-resize hover:bg-blue-500 z-50" onMouseDown={(e) => startResize(e, 'e')} />
          <div className="absolute top-0 left-0 w-1 h-full cursor-w-resize hover:bg-blue-500 z-50" onMouseDown={(e) => startResize(e, 'w')} />
          <div className="absolute bottom-0 left-0 w-full h-1 cursor-s-resize hover:bg-blue-500 z-50" onMouseDown={(e) => startResize(e, 's')} />
          <div className="absolute top-0 left-0 w-full h-1 cursor-n-resize hover:bg-blue-500 z-50" onMouseDown={(e) => startResize(e, 'n')} />

          {/* Corners */}
          <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize hover:bg-blue-500 z-50" onMouseDown={(e) => startResize(e, 'se')} />
          <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize hover:bg-blue-500 z-50" onMouseDown={(e) => startResize(e, 'sw')} />
          <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize hover:bg-blue-500 z-50" onMouseDown={(e) => startResize(e, 'ne')} />
          <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize hover:bg-blue-500 z-50" onMouseDown={(e) => startResize(e, 'nw')} />
        </>
      )}
    </div>
  );
};

export default Window;