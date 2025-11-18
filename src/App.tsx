import './App.css';
import MainContent from './components/MainContent';
import Sidebar from './components/Sidebar';
import { MaximizedEmbedModal } from './components/MaximizedEmbedModal';
import { useAppState } from './hooks/useAppState';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { executeCommand, scrollToMessage } from './handlers/messageHandlers';
import { detectCommand } from './utils/commandDetector';
import { processCommand } from './handlers/commandProcessor';

function App() {
  const {
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
  } = useAppState();

  const handleCloseMaximizedEmbed = () => setMaximizedEmbed(null);

  const handleExecuteCommand = async (command: string) => {
    const context = getRecentContext();
    await executeCommand(command, context, addMessage, isLoading, setIsLoading, pinMessage);
  };

  const handleRunQuickAction = async (id: string) => {
    const quickAction = runQuickAction(id);
    if (quickAction) {
      await handleExecuteCommand(quickAction.command);
    }
  };

  useKeyboardShortcuts({
    maximizedEmbed,
    showQuickActionModal,
    quickActions,
    getQuickActionByHotkey,
    runQuickAction,
    executeCommand: handleExecuteCommand,
    handleCloseMaximizedEmbed,
  });

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-gray-100 font-sans">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          handleRunQuickAction={handleRunQuickAction}
          onShowQuickActionModal={setShowQuickActionModal}
          scrollToMessage={scrollToMessage}
        />
        <MainContent
          isLoading={isLoading}
          onSetLoading={setIsLoading}
          detectCommand={detectCommand}
          processCommand={(command, args) => processCommand(command, args, getRecentContext())}
          setMaximizedEmbed={setMaximizedEmbed}
          context={getRecentContext()}
        />
      </div>

      {maximizedEmbed && (
        <MaximizedEmbedModal maximizedEmbed={maximizedEmbed} onClose={handleCloseMaximizedEmbed} />
      )}
    </div>
  );
}

export default App;
