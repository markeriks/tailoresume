import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMagic, FaMinus, FaPlus, FaPalette, FaRobot, FaCheck, FaTimes, FaChevronDown } from 'react-icons/fa';

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
];

const toneOptions = [
  { id: 'formal', label: 'Formal', action: 'make the tone more formal' },
  { id: 'casual', label: 'Casual', action: 'make the tone more casual' },
  { id: 'professional', label: 'Professional', action: 'make the tone more professional' },
  { id: 'friendly', label: 'Friendly', action: 'make the tone more friendly' },
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
}) => {
  const throttledRect = useRafThrottledRect(rect);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAction, setCustomAction] = useState('');
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Remember last rect to keep toolbar visible when interacting
  const lastRectRef = useRef<DOMRect | null>(null);
  useEffect(() => {
    if (rect) {
      lastRectRef.current = rect;
    }
  }, [rect]);

  const visibleRect = throttledRect || lastRectRef.current;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomSubmit();
    } else if (e.key === 'Escape') {
      setShowCustomInput(false);
      setCustomAction('');
    }
  };

  useEffect(() => {
    if (showCustomInput && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [showCustomInput]);

  useEffect(() => {
    if (!rect) {
      setLoadingAction(null);
      setShowToneDropdown(false);
    }
  }, [rect]);

  const handleCustomSubmit = async () => {
    if (customAction.trim()) {
      setLoadingAction('custom');
      await onAction(customAction.trim());
      setCustomAction('');
      setShowCustomInput(false);
      setLoadingAction(null);
    }
  };

  const handleActionClick = async (action: string) => {
    setLoadingAction(action);
    await onAction(action);
    setLoadingAction(null);
  };

  const handleToneSelect = async (toneAction: string) => {
    setLoadingAction('tone');
    setShowToneDropdown(false);
    await onAction(toneAction);
    setLoadingAction(null);
  };

  // Only hide if there’s no rect AND not showing the custom input
  if (!visibleRect || (!rect && !showCustomInput)) return null;

  return (
    <motion.div
      initial={false}
      animate={{
        top: visibleRect.top - 60,
        left: visibleRect.left + visibleRect.width / 2,
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
      className="selection-toolbar bg-white border border-gray-300 rounded-lg shadow-md"
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <AnimatePresence mode="wait">
        {showCustomInput ? (
          <motion.div
            key="custom-input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2 p-1"
            style={{ width: '400px' }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="text"
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask AI anything..."
              className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded-md outline-none focus:border-blue-500"
            />
            <button
              onClick={handleCustomSubmit}
              disabled={!customAction.trim() || loadingAction === 'custom'}
              className="h-8 px-2 text-xs text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {loadingAction === 'custom' ? (
                <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FaCheck />
              )}
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomAction('');
              }}
              className="h-8 px-2 text-xs text-red-700 bg-red-100 rounded-md hover:bg-red-200"
            >
              <FaTimes />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="action-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-1 relative"
          >
            <button
              onClick={() => setShowCustomInput(true)}
              disabled={loadingAction !== null}
              className="h-8 px-3 text-xs text-blue-700 bg-blue-100 rounded-md flex items-center gap-1 transition-colors hover:bg-blue-200 disabled:opacity-50"
            >
              <FaRobot />
              Ask AI anything
            </button>

            {toolbarActions.map((action) => (
              <div key={action.id} className="relative">
                {action.id === 'tone' ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowToneDropdown(!showToneDropdown)}
                      disabled={loadingAction !== null}
                      className="h-8 px-3 text-xs text-gray-700 bg-white rounded-md flex items-center gap-1 transition-colors hover:bg-purple-100 hover:text-purple-700 disabled:opacity-50"
                    >
                      {loadingAction === 'tone' ? (
                        <div className="w-3 h-3 border border-purple-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        action.icon
                      )}
                      {action.label}
                      <FaChevronDown className="ml-1" size={8} />
                    </button>

                    {showToneDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-[120px]">
                        {toneOptions.map((tone) => (
                          <button
                            key={tone.id}
                            onClick={() => handleToneSelect(tone.action)}
                            disabled={loadingAction !== null}
                            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md disabled:opacity-50"
                          >
                            {tone.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleActionClick(action.id)}
                    disabled={loadingAction !== null}
                    className="h-8 px-3 text-xs text-gray-700 bg-white rounded-md flex items-center gap-1 transition-colors hover:bg-purple-100 hover:text-purple-700 disabled:opacity-50"
                  >
                    {loadingAction === action.id ? (
                      <div className="w-3 h-3 border border-purple-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      action.icon
                    )}
                    {action.label}
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
