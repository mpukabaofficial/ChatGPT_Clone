import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ToolConfig } from './types/toolConfig';

export type Message = {
  id: string;
  role: "user" | "assistant";
  type: "text" | "tool" | "embed" | "tool_config";
  content: string;
  toolConfig?: ToolConfig; // For new React-based tools
  description?: string; // Optional description for embeds and tools
  suggestions?: string[];
};

export type PinnedItem = {
  id: string;
  messageId: string; // link to original message
  type: "text" | "tool" | "embed" | "tool_config";
  content: string;
  createdAt: number;
};

export type QuickAction = {
  id: string;
  label: string;        // user-facing name
  command: string;      // actual text/command to send
  hotkey?: string;      // optional keyboard shortcut e.g. "Ctrl+Shift+J"
  createdAt: number;
};

export type Workspace = {
  id: string;
  name: string;
  messages: Message[];
  pinned: PinnedItem[];
  createdAt: number;
};

interface ChatStore {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  quickActions: QuickAction[];
  // Computed getters for active workspace data
  getMessages: () => Message[];
  getPinned: () => PinnedItem[];
  getActiveWorkspace: () => Workspace | undefined;
  // Workspace management
  createWorkspace: (name: string) => void;
  switchWorkspace: (id: string) => void;
  deleteWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  // Message operations (work on active workspace)
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
  // Pin operations (work on active workspace)
  pinMessage: (message: Message) => void;
  unpinItem: (id: string) => void;
  isPinned: (messageId: string) => boolean;
  // Quick Action operations
  addQuickAction: (label: string, command: string, hotkey?: string) => void;
  deleteQuickAction: (id: string) => void;
  runQuickAction: (id: string) => QuickAction | null;
  getQuickActionByHotkey: (hotkey: string) => QuickAction | null;
}

const createDefaultWorkspace = (): Workspace => ({
  id: crypto.randomUUID(),
  name: "General",
  messages: [],
  pinned: [],
  createdAt: Date.now(),
});

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => {
      const defaultWorkspace = createDefaultWorkspace();
      return {
        workspaces: [defaultWorkspace],
        activeWorkspaceId: defaultWorkspace.id,
        quickActions: [],
        
        // Computed getters
        getMessages: () => {
          const state = get();
          const activeWorkspace = state.workspaces.find(w => w.id === state.activeWorkspaceId);
          return activeWorkspace?.messages || [];
        },
        
        getPinned: () => {
          const state = get();
          const activeWorkspace = state.workspaces.find(w => w.id === state.activeWorkspaceId);
          return activeWorkspace?.pinned || [];
        },
        
        getActiveWorkspace: () => {
          const state = get();
          return state.workspaces.find(w => w.id === state.activeWorkspaceId);
        },

        // Workspace management
        createWorkspace: (name: string) =>
          set((state) => {
            const newWorkspace: Workspace = {
              id: crypto.randomUUID(),
              name: name.trim().slice(0, 30) || "Untitled",
              messages: [],
              pinned: [],
              createdAt: Date.now(),
            };
            
            return {
              workspaces: [...state.workspaces, newWorkspace],
              activeWorkspaceId: newWorkspace.id,
            };
          }),

        switchWorkspace: (id: string) =>
          set((state) => {
            const workspace = state.workspaces.find(w => w.id === id);
            if (workspace) {
              return { activeWorkspaceId: id };
            }
            return state;
          }),

        deleteWorkspace: (id: string) =>
          set((state) => {
            const filteredWorkspaces = state.workspaces.filter(w => w.id !== id);
            
            // Don't allow deleting all workspaces
            if (filteredWorkspaces.length === 0) {
              const defaultWorkspace = createDefaultWorkspace();
              return {
                workspaces: [defaultWorkspace],
                activeWorkspaceId: defaultWorkspace.id,
              };
            }
            
            // If deleting active workspace, switch to first available
            const newActiveId = state.activeWorkspaceId === id 
              ? filteredWorkspaces[0].id 
              : state.activeWorkspaceId;
            
            return {
              workspaces: filteredWorkspaces,
              activeWorkspaceId: newActiveId,
            };
          }),

        renameWorkspace: (id: string, name: string) =>
          set((state) => ({
            workspaces: state.workspaces.map(w => 
              w.id === id 
                ? { ...w, name: name.trim().slice(0, 30) || "Untitled" }
                : w
            ),
          })),

        // Message operations
        addMessage: (msg: Message) =>
          set((state) => ({
            workspaces: state.workspaces.map(w => {
              if (w.id === state.activeWorkspaceId) {
                const newMessages = [...w.messages, msg];
                // Auto-trim messages if they exceed 200 per workspace to prevent localStorage bloat
                const trimmedMessages = newMessages.length > 200 
                  ? newMessages.slice(-200) 
                  : newMessages;
                return { ...w, messages: trimmedMessages };
              }
              return w;
            }),
          })),

        clearMessages: () =>
          set((state) => ({
            workspaces: state.workspaces.map(w => 
              w.id === state.activeWorkspaceId
                ? { ...w, messages: [], pinned: [] }
                : w
            ),
          })),

        // Pin operations
        pinMessage: (message: Message) =>
          set((state) => {
            const activeWorkspace = state.workspaces.find(w => w.id === state.activeWorkspaceId);
            if (!activeWorkspace) return state;
            
            // Don't pin if already pinned
            if (activeWorkspace.pinned.some(p => p.messageId === message.id)) {
              return state;
            }
            
            const pinnedItem: PinnedItem = {
              id: crypto.randomUUID(),
              messageId: message.id,
              type: message.type,
              content: message.content,
              createdAt: Date.now(),
            };
            
            return {
              workspaces: state.workspaces.map(w => 
                w.id === state.activeWorkspaceId
                  ? { ...w, pinned: [...w.pinned, pinnedItem] }
                  : w
              ),
            };
          }),

        unpinItem: (id: string) =>
          set((state) => ({
            workspaces: state.workspaces.map(w => 
              w.id === state.activeWorkspaceId
                ? { ...w, pinned: w.pinned.filter(p => p.id !== id) }
                : w
            ),
          })),

        isPinned: (messageId: string) => {
          const state = get();
          const activeWorkspace = state.workspaces.find(w => w.id === state.activeWorkspaceId);
          return activeWorkspace?.pinned.some(p => p.messageId === messageId) || false;
        },

        // Quick Action operations
        addQuickAction: (label: string, command: string, hotkey?: string) =>
          set((state) => {
            // Prevent duplicate hotkeys
            if (hotkey && state.quickActions.some(qa => qa.hotkey === hotkey)) {
              throw new Error(`Hotkey "${hotkey}" is already in use`);
            }
            
            const newQuickAction: QuickAction = {
              id: crypto.randomUUID(),
              label: label.trim(),
              command: command.trim(),
              hotkey: hotkey?.trim() || undefined,
              createdAt: Date.now(),
            };
            
            return {
              quickActions: [...state.quickActions, newQuickAction],
            };
          }),

        deleteQuickAction: (id: string) =>
          set((state) => ({
            quickActions: state.quickActions.filter(qa => qa.id !== id),
          })),

        runQuickAction: (id: string) => {
          const state = get();
          const quickAction = state.quickActions.find(qa => qa.id === id);
          return quickAction || null;
        },

        getQuickActionByHotkey: (hotkey: string) => {
          const state = get();
          return state.quickActions.find(qa => qa.hotkey === hotkey) || null;
        },
      };
    },
    {
      name: 'chat-storage',
      // Custom storage configuration to handle workspace and quick action initialization
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure we have at least one workspace
          if (state.workspaces.length === 0) {
            const defaultWorkspace = createDefaultWorkspace();
            state.workspaces = [defaultWorkspace];
            state.activeWorkspaceId = defaultWorkspace.id;
          } else if (!state.activeWorkspaceId || !state.workspaces.find(w => w.id === state.activeWorkspaceId)) {
            // Set active workspace to first one if none set or invalid
            state.activeWorkspaceId = state.workspaces[0].id;
          }
          
          // Initialize quick actions array if it doesn't exist
          if (!state.quickActions) {
            state.quickActions = [];
          }
          
          // Add demo workspaces if only default workspace exists
          if (state.workspaces.length === 1 && state.workspaces[0].name === "General" && state.workspaces[0].messages.length === 0) {
            // Create demo workspaces with preloaded content
            const jobSearchWorkspace: Workspace = {
              id: crypto.randomUUID(),
              name: "Job Search",
              messages: [
                {
                  id: crypto.randomUUID(),
                  role: "user",
                  type: "text",
                  content: "Draft me a resume for a software engineer role"
                },
                {
                  id: crypto.randomUUID(),
                  role: "assistant", 
                  type: "text",
                  content: "I'll help you create a professional software engineer resume. Here's a well-structured template:\n\n**[Your Name]**\nSoftware Engineer\n[Your Email] | [Your Phone] | [Your Location] | [LinkedIn] | [GitHub]\n\n**PROFESSIONAL SUMMARY**\nExperienced Software Engineer with [X] years developing scalable web applications and backend systems. Proficient in [key technologies] with a track record of delivering high-quality solutions in agile environments.\n\n**TECHNICAL SKILLS**\n• Languages: JavaScript, Python, Java, TypeScript\n• Frameworks: React, Node.js, Express, Django\n• Databases: PostgreSQL, MongoDB, Redis\n• Tools: Git, Docker, AWS, CI/CD\n\n**EXPERIENCE**\n[Previous roles with achievements and metrics]\n\n**EDUCATION**\n[Your degree and institution]\n\nWould you like me to customize any section based on your specific experience?",
                  suggestions: ["Customize for a specific company", "Add more technical skills", "Write a cover letter too"]
                }
              ],
              pinned: [],
              createdAt: Date.now() - 1000000
            };

            const startupWorkspace: Workspace = {
              id: crypto.randomUUID(),
              name: "Startup Ideas",
              messages: [
                {
                  id: crypto.randomUUID(),
                  role: "user",
                  type: "text",
                  content: "Generate 3 business ideas for Africa"
                },
                {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  type: "text", 
                  content: "Here are 3 promising business ideas tailored for the African market:\n\n**1. AgriTech Supply Chain Platform**\n🌾 Connect smallholder farmers directly with buyers, eliminating middlemen\n📱 Mobile-first platform with SMS/USSD support for feature phones\n💰 Revenue: Transaction fees + premium analytics for buyers\n🎯 Market: 70% of Africans work in agriculture\n\n**2. Solar-Powered Internet Kiosks**\n☀️ Community internet access points powered by solar energy\n📚 Include digital literacy training and e-government services\n💡 Partner with local entrepreneurs as franchise operators\n🌍 Impact: Bridge digital divide in rural areas\n\n**3. Mobile Health Insurance**\n🏥 Micro-insurance for healthcare via mobile money platforms\n👥 Community-based pools with affordable monthly premiums\n📊 Use AI for risk assessment and fraud prevention\n💳 Integrate with existing mobile money systems (M-Pesa, etc.)\n\nWhich idea interests you most? I can develop a detailed business plan!",
                  suggestions: ["Develop a business plan for AgriTech", "Explore funding options", "Research market competition"]
                }
              ],
              pinned: [],
              createdAt: Date.now() - 500000
            };

            // Replace the default workspace
            state.workspaces = [jobSearchWorkspace, startupWorkspace];
            state.activeWorkspaceId = jobSearchWorkspace.id;
          }
          
          // Add some default quick actions if none exist
          if (state.quickActions.length === 0) {
            state.quickActions = [
              {
                id: crypto.randomUUID(),
                label: "Summarize Text",
                command: "Summarize this text in 3 bullet points",
                hotkey: "Ctrl+Shift+S",
                createdAt: Date.now(),
              },
              {
                id: crypto.randomUUID(),
                label: "Explain Code",
                command: "Explain this code and how it works",
                hotkey: "Ctrl+Shift+E",
                createdAt: Date.now(),
              },
              {
                id: crypto.randomUUID(),
                label: "Quick Calculator",
                command: "/calc",
                hotkey: "Ctrl+Shift+C",
                createdAt: Date.now(),
              },
              {
                id: crypto.randomUUID(),
                label: "Business Plan",
                command: "Create a detailed business plan for my idea",
                hotkey: "Ctrl+Shift+B",
                createdAt: Date.now(),
              },
              {
                id: crypto.randomUUID(),
                label: "Meeting Notes",
                command: "/note Meeting summary and action items",
                createdAt: Date.now(),
              }
            ];
          }
        }
      },
    }
  )
);