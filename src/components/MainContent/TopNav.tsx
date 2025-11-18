import { Sparkles, Trash2 } from "lucide-react";
import { useChatStore } from "../../chatStore";

const TopNav = () => {
  const { getActiveWorkspace, clearMessages } = useChatStore();
  const activeWorkspace = getActiveWorkspace();
  return (
    <nav className="sticky top-0 z-50  px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-slate-300" />
        <span className="font-semibold text-slate-300">Workspace</span>
        {activeWorkspace && (
          <>
            <span className="text-slate-500">•</span>
            <span className="text-sm font-medium text-gray-300">
              {activeWorkspace.name}
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={clearMessages}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>
    </nav>
  );
};

export default TopNav;
