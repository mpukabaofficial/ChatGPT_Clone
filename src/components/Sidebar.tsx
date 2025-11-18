import {
  ChevronDown as ChevronDownIcon,
  ChevronRight,
  Code,
  FileText,
  Folder,
  FolderPlus,
  Globe,
  Keyboard,
  Pin,
  Plus,
  Sidebar as SidebarIcon,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useChatStore } from "../chatStore";

interface Props {
  scrollToMessage: (messageId: string) => void;
  handleRunQuickAction: (id: string) => Promise<void>;
  onShowQuickActionModal: (isShown: boolean) => void;
}

const Sidebar = ({
  scrollToMessage,
  handleRunQuickAction,
  onShowQuickActionModal,
}: Props) => {
  const store = useChatStore();
  const {
    workspaces,
    activeWorkspaceId,
    quickActions,
    switchWorkspace,
    unpinItem,
    createWorkspace,
    deleteWorkspace,
    getPinned,
    deleteQuickAction,
  } = store;
  const pinned = getPinned();

  const [isQuickActionSectionOpen, setIsQuickActionSectionOpen] =
    useState(true);
  const [isPinnedSectionOpen, setIsPinnedSectionOpen] = useState(true);
  const [isWorkspaceSectionOpen, setIsWorkspaceSectionOpen] = useState(true);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const handleWorkspaceSwitch = (workspaceId: string) => {
    switchWorkspace(workspaceId);
  };

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      createWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName("");
      setIsCreatingWorkspace(false);
    }
  };

  const handleWorkspaceDelete = (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (workspaces.length > 1) {
      deleteWorkspace(workspaceId);
    }
  };

  const getPinnedItemIcon = (type: string) => {
    switch (type) {
      case "text":
        return FileText;
      case "tool":
        return Code;
      case "embed":
        return Globe;
      default:
        return FileText;
    }
  };

  const truncateContent = (content: string, maxLength: number = 30) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Format hotkey for display
  const formatHotkey = (hotkey: string) => {
    return hotkey
      .replace("Ctrl", "⌘")
      .replace("Alt", "⌥")
      .replace("Shift", "⇧")
      .replace("+", " ");
  };

  const handleDeleteQuickAction = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteQuickAction(id);
  };

  return (
    <aside className="w-64 bg-slate-950 flex flex-col overflow-hidden">
      <div className="p-4 flex items-center justify-between w-full">
        <span className="font-medium text-white">Chat</span>
        <SidebarIcon className="size-4" />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Workspaces section */}
        <section>
          <div
            className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
            onClick={() => setIsWorkspaceSectionOpen(!isWorkspaceSectionOpen)}
          >
            {isWorkspaceSectionOpen ? (
              <ChevronDownIcon className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <Folder className="w-4 h-4" />
            <span className="text-sm">Workspaces</span>
            {workspaces.length > 0 && (
              <span className="text-xs text-gray-400 ml-auto">
                ({workspaces.length})
              </span>
            )}
          </div>

          {isWorkspaceSectionOpen && (
            <div className="space-y-1 ml-2">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer group transition-colors ${
                    workspace.id === activeWorkspaceId
                      ? "bg-gray-800 text-white"
                      : "hover:bg-gray-800"
                  }`}
                  onClick={() => handleWorkspaceSwitch(workspace.id)}
                >
                  <Folder className="w-3 h-3 text-gray-400" />
                  <span className="text-xs flex-1 truncate">
                    {workspace.name}
                  </span>
                  {workspaces.length > 1 && (
                    <button
                      onClick={(e) => handleWorkspaceDelete(workspace.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-opacity"
                      title="Delete workspace"
                    >
                      <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
                    </button>
                  )}
                </div>
              ))}

              {isCreatingWorkspace ? (
                <div className="flex items-center gap-2 p-2 ml-2">
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleCreateWorkspace();
                      } else if (e.key === "Escape") {
                        setIsCreatingWorkspace(false);
                        setNewWorkspaceName("");
                      }
                    }}
                    onBlur={() => {
                      if (newWorkspaceName.trim()) {
                        handleCreateWorkspace();
                      } else {
                        setIsCreatingWorkspace(false);
                      }
                    }}
                    placeholder="Workspace name"
                    className="flex-1 bg-gray-700 text-white text-xs px-2 py-1 rounded outline-none"
                    maxLength={30}
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingWorkspace(true)}
                  className="flex items-center gap-2 p-2 ml-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors w-full"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span className="text-xs">New workspace</span>
                </button>
              )}
            </div>
          )}
        </section>

        {/* Pinned Tabs section */}
        <div className="pt-4 space-y-1">
          <div
            className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
            onClick={() => setIsPinnedSectionOpen(!isPinnedSectionOpen)}
          >
            {isPinnedSectionOpen ? (
              <ChevronDownIcon className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <Pin className="w-4 h-4" />
            <span className="text-sm">Pinned Tabs</span>
            {pinned.length > 0 && (
              <span className="text-xs text-gray-400 ml-auto">
                ({pinned.length})
              </span>
            )}
          </div>

          {isPinnedSectionOpen && (
            <div className="space-y-1 ml-2">
              {pinned.length === 0 ? (
                <div className="p-2 text-xs text-gray-500 italic">
                  No pinned tabs yet
                </div>
              ) : (
                pinned.map((item) => {
                  const IconComponent = getPinnedItemIcon(item.type);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg cursor-pointer group"
                      onClick={() => scrollToMessage(item.messageId)}
                    >
                      <IconComponent className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-300 flex-1 truncate">
                        {truncateContent(item.content)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          unpinItem(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-opacity"
                        title="Unpin"
                      >
                        <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Quick Actions section */}
        <div className="pt-4 space-y-1">
          <div
            className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
            onClick={() =>
              setIsQuickActionSectionOpen(!isQuickActionSectionOpen)
            }
          >
            {isQuickActionSectionOpen ? (
              <ChevronDownIcon className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <Keyboard className="w-4 h-4" />
            <span className="text-sm">Quick Actions</span>
            {quickActions.length > 0 && (
              <span className="text-xs text-gray-400 ml-auto">
                ({quickActions.length})
              </span>
            )}
          </div>

          {isQuickActionSectionOpen && (
            <div className="space-y-1 ml-2">
              {quickActions.length === 0 ? (
                <div className="p-2 text-xs text-gray-500 italic">
                  No quick actions yet
                </div>
              ) : (
                quickActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg cursor-pointer group"
                    onClick={() => handleRunQuickAction(action.id)}
                  >
                    <Zap className="w-3 h-3 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-300 block truncate">
                        {action.label}
                      </span>
                      {action.hotkey && (
                        <span className="text-xs text-blue-400 font-mono">
                          {formatHotkey(action.hotkey)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDeleteQuickAction(action.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-opacity"
                      title="Delete quick action"
                    >
                      <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                ))
              )}

              <button
                onClick={() => onShowQuickActionModal(true)}
                className="flex items-center gap-2 p-2 ml-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors w-full"
              >
                <Plus className="w-3 h-3" />
                <span className="text-xs">New quick action</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom user section */}
      <div className="p-2 border-t border-gray-800">
        <div className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-medium">
            M
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Mpume Kaba</div>
            <div className="text-xs text-gray-400">Plus</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
