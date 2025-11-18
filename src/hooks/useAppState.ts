import { useEffect, useState } from 'react';
import { useChatStore, type Message } from '../chatStore';

export interface MaximizedEmbed {
  messageId: string;
  content: string;
  description?: string;
}

export function useAppState() {
  const store = useChatStore();
  const {
    workspaces,
    activeWorkspaceId,
    quickActions,
    addMessage,
    pinMessage,
    switchWorkspace,
    runQuickAction,
    getQuickActionByHotkey,
    getMessages,
  } = store;

  const messages = getMessages();
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [maximizedEmbed, setMaximizedEmbed] = useState<MaximizedEmbed | null>(null);

  // Initialize active workspace if not set
  useEffect(() => {
    if (!activeWorkspaceId && workspaces.length > 0) {
      switchWorkspace(workspaces[0].id);
    }
  }, [activeWorkspaceId, workspaces, switchWorkspace]);

  const getRecentContext = (): Message[] => {
    return messages.slice(-5);
  };

  return {
    store,
    messages,
    isLoading,
    setIsLoading,
    showQuickActionModal,
    setShowQuickActionModal,
    maximizedEmbed,
    setMaximizedEmbed,
    getRecentContext,
    quickActions,
    getQuickActionByHotkey,
    runQuickAction,
    addMessage,
    pinMessage,
  };
}
