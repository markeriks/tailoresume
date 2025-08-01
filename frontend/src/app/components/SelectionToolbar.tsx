import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaMagic, FaMinus, FaPlus, FaPalette, FaStar } from 'react-icons/fa';

interface SelectionToolbarProps {
  rect: DOMRect | null;
  onAction: (action: string) => void;
  selectedText: string;
}

const toolbarActions = [
  { id: 'improve', label: 'Improve writing', icon: <FaMagic /> },
  { id: 'shorter', label: 'Make shorter', icon: <FaMinus /> },
  { id: 'longer', label: 'Make longer', icon: <FaPlus /> },
  { id: 'tone', label: 'Change tone', icon: <FaPalette /> },
  { id: 'enhance', label: 'Enhance', icon: <FaStar /> },
];

function useRafThrottledRect(rect: DOMRect | null) {
  const [throttledRect, setThrottledRect] = useState(rect);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (!rect) {
      setThrottledRect(null);
      return;
    }
    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      setThrottledRect(rect);
    });

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [rect]);

  return throttledRect;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  rect,
  onAction,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedText,
}) => {
  const throttledRect = useRafThrottledRect(rect);

  if (!throttledRect) return null;

  return (
    <motion.div
      initial={false}
      animate={{
        top: throttledRect.top - 60,
        left: throttledRect.left + throttledRect.width / 2,
        transform: 'translateX(-50%)',
      }}
      transition={{
        type: 'spring',
        stiffness: 280,
        damping: 40,
        mass: 0.7,
      }}
      style={{
        position: 'fixed',
        zIndex: 1000,
        willChange: 'transform, top, left',
      }}
      className="selection-toolbar flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1 shadow-md"
      onMouseDown={(e) => e.preventDefault()}
    >
      {toolbarActions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className="h-8 px-3 text-xs text-gray-700 bg-white rounded-md flex items-center gap-1 transition-colors hover:bg-purple-100 hover:text-purple-700"
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </motion.div>
  );
};
