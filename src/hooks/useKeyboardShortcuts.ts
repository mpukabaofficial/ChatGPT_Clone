import { useEffect } from 'react';
import type { MaximizedEmbed } from './useAppState';
import type { QuickAction } from '../chatStore';

interface UseKeyboardShortcutsProps {
  maximizedEmbed: MaximizedEmbed | null;
  showQuickActionModal: boolean;
  quickActions: QuickAction[];
  getQuickActionByHotkey: (hotkey: string) => QuickAction | null;
  runQuickAction: (id: string) => QuickAction | null;
  executeCommand: (command: string) => Promise<void>;
  handleCloseMaximizedEmbed: () => void;
}

/**
 * Handle global keyboard shortcuts
 */
export function useKeyboardShortcuts({
  maximizedEmbed,
  showQuickActionModal,
  quickActions,
  getQuickActionByHotkey,
  runQuickAction,
  executeCommand,
  handleCloseMaximizedEmbed,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle escape key for modal
      if (event.key === 'Escape' && maximizedEmbed) {
        handleCloseMaximizedEmbed();
        return;
      }

      // Don't trigger when input is focused or modal is open
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';

      if (isInputFocused || showQuickActionModal || maximizedEmbed) {
        return;
      }

      // Build hotkey string from event
      const parts = [];
      if (event.ctrlKey) parts.push('Ctrl');
      if (event.altKey) parts.push('Alt');
      if (event.shiftKey) parts.push('Shift');

      // Add the main key (avoid modifier keys themselves)
      if (!['Control', 'Alt', 'Shift'].includes(event.key)) {
        parts.push(event.key.length === 1 ? event.key.toUpperCase() : event.key);
      }

      if (parts.length > 1) {
        // Must have at least one modifier + key
        const hotkeyString = parts.join('+');

        // Find matching quick action
        const matchingAction = getQuickActionByHotkey(hotkeyString);
        if (matchingAction) {
          event.preventDefault();
          event.stopPropagation();
          // Execute the quick action directly here to avoid dependency issues
          const quickAction = runQuickAction(matchingAction.id);
          if (quickAction) {
            executeCommand(quickAction.command);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickActions, showQuickActionModal, maximizedEmbed, getQuickActionByHotkey, runQuickAction]);
}
