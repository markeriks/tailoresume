/**
 * SELECTION TOOLBAR COMPONENT
 * 
 * A floating toolbar that appears when text is selected in the editor, providing
 * AI-powered text transformation options. The toolbar dynamically positions itself
 * above the selected text and offers various actions like improving writing,
 * changing length, adjusting tone, and custom AI requests.
 * 
 * The component uses Framer Motion for smooth animations and includes a custom
 * input mode for free-form AI interactions. It handles loading states and
 * provides visual feedback during AI processing.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMagic, FaMinus, FaPlus, FaPalette, FaRobot, FaCheck, FaTimes, FaChevronDown } from 'react-icons/fa';

/**
 * COMPONENT INTERFACES
 * 
 * Defines the TypeScript interface for the SelectionToolbar component props.
 * The rect prop contains the bounding rectangle of the selected text for positioning,
 * onAction is the callback function that handles AI transformations, and selectedText
 * contains the actual text that was selected by the user.
 */
interface SelectionToolbarProps {
  rect: DOMRect | null;
  onAction: (action: string) => void;
  selectedText: string;
}

/**
 * ACTION CONFIGURATION DATA
 * 
 * Defines the available AI transformation actions that appear as buttons in the toolbar.
 * Each action has an ID for identification, a user-friendly label, and an icon.
 * The tone action is special as it opens a dropdown with specific tone options.
 */
const toolbarActions = [
  { id: 'improve', label: 'Improve writing', icon: <FaMagic /> },
  { id: 'shorter', label: 'Make shorter', icon: <FaMinus /> },
  { id: 'longer', label: 'Make longer', icon: <FaPlus /> },
  { id: 'tone', label: 'Change tone', icon: <FaPalette /> },
];

/**
 * TONE OPTIONS CONFIGURATION
 * 
 * Defines the specific tone variations available when the user clicks "Change tone".
 * Each option maps to a specific AI instruction that will be sent to the backend
 * for processing the selected text.
 */
const toneOptions = [
  { id: 'formal', label: 'Formal', action: 'make the tone more formal' },
  { id: 'casual', label: 'Casual', action: 'make the tone more casual' },
  { id: 'professional', label: 'Professional', action: 'make the tone more professional' },
  { id: 'friendly', label: 'Friendly', action: 'make the tone more friendly' },
];

/**
 * RAF THROTTLED RECT HOOK
 * 
 * A custom hook that throttles rectangle position updates using requestAnimationFrame
 * to prevent excessive re-renders when the selection rectangle changes rapidly.
 * This improves performance by batching position updates to the next animation frame,
 * reducing the computational overhead of frequent toolbar repositioning.
 * 
 * The hook cancels any pending animation frame when a new rect is provided and
 * cleans up on unmount to prevent memory leaks.
 */
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

/**
 * MAIN SELECTION TOOLBAR COMPONENT
 * 
 * The primary component that renders the floating toolbar above selected text.
 * Manages multiple UI states including custom input mode, tone dropdown visibility,
 * and loading states for different actions. Uses throttled positioning to ensure
 * smooth animations while maintaining performance.
 */
export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  rect,
  onAction,
}) => {
  // Throttled rectangle position for smooth animations
  const throttledRect = useRafThrottledRect(rect);
  
  // UI state management
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAction, setCustomAction] = useState('');
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * RECTANGLE PERSISTENCE LOGIC
   * 
   * Maintains the last known rectangle position to keep the toolbar visible
   * when the user interacts with it (e.g., clicking buttons or typing in custom input).
   * This prevents the toolbar from disappearing during user interactions by using
   * the throttled rect when available, falling back to the last known position.
   */
  const lastRectRef = useRef<DOMRect | null>(null);
  useEffect(() => {
    if (rect) {
      lastRectRef.current = rect;
    }
  }, [rect]);

  const visibleRect = throttledRect || lastRectRef.current;

  /**
   * KEYBOARD EVENT HANDLER
   * 
   * Handles keyboard input in the custom action input field.
   * Enter key submits the custom action, Escape key cancels and closes the input.
   * This provides keyboard accessibility for the custom AI request functionality.
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomSubmit();
    } else if (e.key === 'Escape') {
      setShowCustomInput(false);
      setCustomAction('');
    }
  };

  /**
   * CUSTOM INPUT FOCUS EFFECT
   * 
   * Automatically focuses the input field when custom input mode is activated.
   * Uses a small delay to ensure the DOM has updated before attempting to focus,
   * providing a smooth user experience when switching to custom input mode.
   */
  useEffect(() => {
    if (showCustomInput && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [showCustomInput]);

  /**
   * SELECTION CLEANUP EFFECT
   * 
   * Resets UI state when text selection is cleared (rect becomes null).
   * This ensures the toolbar properly cleans up loading states and closes
   * any open dropdowns when the user deselects text or clicks elsewhere.
   */
  useEffect(() => {
    if (!rect) {
      setLoadingAction(null);
      setShowToneDropdown(false);
    }
  }, [rect]);

  /**
   * CUSTOM ACTION SUBMIT HANDLER
   * 
   * Processes the custom AI request entered by the user. Sets loading state,
   * calls the onAction callback with the custom text, then resets the UI state.
   * Only processes non-empty input to prevent unnecessary API calls.
   */
  const handleCustomSubmit = async () => {
    if (customAction.trim()) {
      setLoadingAction('custom');
      await onAction(customAction.trim());
      setCustomAction('');
      setShowCustomInput(false);
      setLoadingAction(null);
    }
  };

  /**
   * STANDARD ACTION CLICK HANDLER
   * 
   * Handles clicks on predefined action buttons (improve, shorter, longer).
   * Sets loading state for the specific action, calls the onAction callback,
   * then clears the loading state when the AI processing is complete.
   */
  const handleActionClick = async (action: string) => {
    setLoadingAction(action);
    await onAction(action);
    setLoadingAction(null);
  };

  /**
   * TONE SELECTION HANDLER
   * 
   * Handles selection of specific tone options from the dropdown menu.
   * Closes the dropdown, sets loading state, processes the tone change,
   * then resets the loading state. This provides a smooth UX for tone adjustments.
   */
  const handleToneSelect = async (toneAction: string) => {
    setLoadingAction('tone');
    setShowToneDropdown(false);
    await onAction(toneAction);
    setLoadingAction(null);
  };

  /**
   * VISIBILITY LOGIC
   * 
   * Determines when to show the toolbar. The toolbar is visible if there's a
   * valid rectangle position OR if the custom input is currently being shown.
   * This allows the toolbar to remain visible during user interactions.
   */
  if (!visibleRect || (!rect && !showCustomInput)) return null;

  /**
   * MAIN TOOLBAR RENDER
   * 
   * Renders the floating toolbar with smooth spring animations. The toolbar
   * positions itself above the selected text and prevents event propagation
   * to avoid interfering with text selection. Uses Framer Motion for smooth
   * positioning transitions.
   */
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
      {/* Animated Content Switching - Toggles between action buttons and custom input */}
      <AnimatePresence mode="wait">
        {/* Custom Input Mode - Free-form AI request interface */}
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
            {/* Custom AI Request Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={customAction}
              onChange={(e) => setCustomAction(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask AI anything..."
              className="flex-1 h-8 px-2 text-xs border border-gray-300 rounded-md outline-none focus:border-blue-500"
            />
            {/* Submit Button - Processes the custom AI request */}
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
            {/* Cancel Button - Closes custom input mode */}
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
          /* Action Buttons Mode - Predefined AI transformation options */
          <motion.div
            key="action-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-1 relative"
          >
            {/* Custom AI Request Button - Switches to input mode */}
            <button
              onClick={() => setShowCustomInput(true)}
              disabled={loadingAction !== null}
              className="h-8 px-3 text-xs text-blue-700 bg-blue-100 rounded-md flex items-center gap-1 transition-colors hover:bg-blue-200 disabled:opacity-50"
            >
              <FaRobot />
              Ask AI anything
            </button>

            {/* Predefined Action Buttons - Renders all toolbar actions */}
            {toolbarActions.map((action) => (
              <div key={action.id} className="relative">
                {action.id === 'tone' ? (
                  /* Tone Change Button with Dropdown - Special handling for tone options */
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

                    {/* Tone Options Dropdown - Shows specific tone variations */}
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
                  /* Standard Action Button - Direct action execution */
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
