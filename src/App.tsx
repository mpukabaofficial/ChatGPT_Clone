import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getAIResponse, type CommandResponse } from "./api";
import "./App.css";
import { useChatStore, type Message } from "./chatStore";
import MainContent from "./components/MainContent";
import Sidebar from "./components/Sidebar";

function App() {
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
  const [maximizedEmbed, setMaximizedEmbed] = useState<{
    messageId: string;
    content: string;
    description?: string;
  } | null>(null);

  // Initialize active workspace if not set
  useEffect(() => {
    if (!activeWorkspaceId && workspaces.length > 0) {
      switchWorkspace(workspaces[0].id);
    }
  }, [activeWorkspaceId, workspaces, switchWorkspace]);

  // Global hotkey listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle escape key for modal
      if (event.key === "Escape" && maximizedEmbed) {
        handleCloseMaximizedEmbed();
        return;
      }

      // Don't trigger when input is focused or modal is open
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA";

      if (isInputFocused || showQuickActionModal || maximizedEmbed) {
        return;
      }

      // Build hotkey string from event
      const parts = [];
      if (event.ctrlKey) parts.push("Ctrl");
      if (event.altKey) parts.push("Alt");
      if (event.shiftKey) parts.push("Shift");

      // Add the main key (avoid modifier keys themselves)
      if (!["Control", "Alt", "Shift"].includes(event.key)) {
        parts.push(
          event.key.length === 1 ? event.key.toUpperCase() : event.key
        );
      }

      if (parts.length > 1) {
        // Must have at least one modifier + key
        const hotkeyString = parts.join("+");

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

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    quickActions,
    showQuickActionModal,
    maximizedEmbed,
    getQuickActionByHotkey,
    runQuickAction,
  ]);

  const getRecentContext = (): Message[] => {
    return messages.slice(-5);
  };

  const context = getRecentContext();

  // Command detection and parsing
  const detectCommand = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed.startsWith("/")) return null;

    const parts = trimmed.split(" ");
    const command = parts[0].slice(1); // Remove the '/'
    const args = parts.slice(1).join(" ").trim();

    return { command, args, fullInput: trimmed };
  };

  // Process slash commands
  const processCommand = async (
    command: string,
    args: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fullInput: string
  ): Promise<CommandResponse> => {
    console.log(`🎯 Processing command: /${command} with args: "${args}"`);

    switch (command) {
      case "calc":
      case "calculator":
        return await processToolCommand(args || "calculator", "calculator");
      case "convert":
      case "converter":
        return await processToolCommand(args || "unit converter", "converter");
      case "generate":
      case "gen":
        return await processToolCommand(args || "generator tool", "generator");
      case "analyze":
      case "analyzer":
        return await processToolCommand(args || "analyzer tool", "analyzer");
      case "chart":
      case "graph":
        return await processVisualizationCommand(
          args || "chart generator",
          "chart"
        );
      case "diagram":
      case "flowchart":
        return await processVisualizationCommand(
          args || "diagram creator",
          "diagram"
        );
      case "mindmap":
        return await processVisualizationCommand(args || "mind map", "mindmap");
      case "timer":
      case "countdown":
        return await processToolCommand(args || "timer tool", "utility");
      case "game":
        return await processToolCommand(args || "simple game", "game");
      case "embed":
        return await processEmbedCommand(args);
      case "note":
        return await processNoteCommand(args);
      default:
        throw new Error(
          `Unknown command: /${command}. Available commands: /calc, /convert, /generate, /analyze, /chart, /timer, /game, /embed, /note`
        );
    }
  };

  // Shared planning function for all tool creation
  const createToolPlan = async (query: string, context: Message[]) => {
    const planningPrompt = `
You are a tool planning assistant. Analyze the following request and create a detailed plan for building a functional tool.

User Request: ${query}

Respond with a JSON object containing:
{
  "toolType": "calculator|converter|generator|analyzer|utility|game|visualizer|other",
  "features": ["list", "of", "key", "features"],
  "inputs": ["required", "input", "fields"],
  "outputs": ["expected", "output", "types"],
  "interactivity": ["user", "interactions", "needed"],
  "complexity": "simple|medium|complex",
  "specialRequirements": ["any", "special", "needs"],
  "userExperience": ["key", "ux", "considerations"]
}

Make the plan comprehensive and focused on user experience. Think about what would make this tool truly useful and functional.`;

    console.log("🧠 Planning stage...");
    const planResponse = await getAIResponse(planningPrompt, context);

    let toolPlan;
    try {
      toolPlan = JSON.parse(planResponse.content);
      console.log("📋 Tool plan:", toolPlan);
    } catch (error) {
      console.warn("⚠️ Planning failed, using fallback:", error);
      // Fallback if parsing fails
      toolPlan = {
        toolType: "utility",
        features: ["basic functionality"],
        inputs: ["user inputs"],
        outputs: ["results"],
        interactivity: ["button clicks", "form inputs"],
        complexity: "simple",
        specialRequirements: [],
        userExperience: ["clear interface", "immediate feedback"],
      };
    }

    return toolPlan;
  };

  // Specialized visualization planning
  const createVisualizationPlan = async (
    query: string,
    vizType: string,
    context: Message[]
  ) => {
    const vizPlanningPrompt = `
You are a visualization planning expert. Analyze this request and create a detailed plan for building a ${vizType} visualization.

User Request: ${query}
Visualization Type: ${vizType}

Respond with a JSON object:
{
  "vizType": "${vizType}",
  "dataStructure": ["what", "data", "fields", "needed"],
  "visualElements": ["svg", "canvas", "html", "elements"],
  "interactivity": ["user", "interactions"],
  "chartTypes": ["specific", "chart", "types"],
  "features": ["key", "features"],
  "colorScheme": ["color", "palette"],
  "layout": ["layout", "considerations"],
  "complexity": "simple|medium|complex"
}

Focus on creating engaging, interactive visualizations with clear data representation.`;

    console.log(`📋 Planning ${vizType} visualization...`);
    const planResponse = await getAIResponse(vizPlanningPrompt, context);

    let vizPlan;
    try {
      vizPlan = JSON.parse(planResponse.content);
      console.log(`📊 ${vizType} plan:`, vizPlan);
    } catch (error) {
      console.warn("⚠️ Visualization planning failed, using fallback:", error);
      vizPlan = {
        vizType: vizType,
        dataStructure: ["labels", "values"],
        visualElements: ["svg", "interactive controls"],
        interactivity: ["click", "hover", "input"],
        chartTypes: [vizType === "chart" ? "bar" : vizType],
        features: ["data input", "real-time updates", "export"],
        colorScheme: ["blue", "cyan", "slate"],
        layout: ["responsive", "centered"],
        complexity: "medium",
      };
    }

    return vizPlan;
  };

  // Enhanced visualization creation with SVG and Canvas support
  const createEnhancedVisualization = async (
    instruction: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plan: any,
    context: Message[]
  ) => {
    const vizPrompt = `
You are an expert data visualization developer. Create a COMPLETE, interactive HTML document with advanced ${
      plan.vizType
    } capabilities.

VISUALIZATION PLAN:
- Type: ${plan.vizType}
- Data Structure: ${plan.dataStructure.join(", ")}
- Visual Elements: ${plan.visualElements.join(", ")}
- Interactivity: ${plan.interactivity.join(", ")}
- Chart Types: ${plan.chartTypes.join(", ")}
- Features: ${plan.features.join(", ")}
- Color Scheme: ${plan.colorScheme.join(", ")}
- Layout: ${plan.layout.join(", ")}

TECHNICAL REQUIREMENTS:
- Use SVG for vector graphics and scalability
- Include Canvas fallback for complex animations
- Pure vanilla JavaScript (no external libraries)
- Responsive design that works on all screen sizes
- Interactive data input (forms, file upload, paste data)
- Real-time visualization updates
- Export functionality (PNG, SVG, data)
- Smooth animations and transitions

DESIGN LANGUAGE - Enhanced Slate-Cyan:
- Background: #0f172a (canvas), #1e293b (surface), #334155 (borders)
- Text: #e2e8f0 (primary), #94a3b8 (secondary)
- Primary: #06b6d4 (cyan), #0891b2 (hover)
- Accent: #22d3ee (highlights), #10b981 (success), #f59e0b (warning)
- Typography: system-ui, sans-serif; monospace for data
- Spacing: 16px base, 24px container padding
- Borders: 8px radius, 1px solid borders
- Shadows: 0 4px 12px rgba(0,0,0,0.3)

VISUALIZATION FEATURES TO IMPLEMENT:
${
  plan.chartTypes.includes("bar")
    ? "- Interactive bar charts with hover effects and click handlers"
    : ""
}
${
  plan.chartTypes.includes("line")
    ? "- Smooth line graphs with data points and tooltips"
    : ""
}
${
  plan.chartTypes.includes("pie")
    ? "- Animated pie charts with percentage labels and legends"
    : ""
}
${
  plan.chartTypes.includes("scatter")
    ? "- Scatter plots with zoom and pan capabilities"
    : ""
}
${
  plan.vizType === "diagram"
    ? "- Flowchart/diagram creator with draggable nodes and connections"
    : ""
}
${
  plan.vizType === "mindmap"
    ? "- Interactive mind map with expandable nodes and branches"
    : ""
}

REQUIRED FUNCTIONALITY:
1. Data Input Section:
   - Manual data entry forms
   - CSV/JSON data paste
   - Sample data buttons
   - Data validation and error handling

2. Visualization Canvas:
   - SVG-based rendering for crisp graphics
   - Responsive sizing and scaling
   - Smooth animations and transitions
   - Interactive elements (hover, click, drag)

3. Controls Panel:
   - Chart type switcher (if applicable)
   - Color scheme selector
   - Animation speed controls
   - Export options

4. Export Features:
   - Download as PNG image
   - Export SVG vector file
   - Copy data as JSON/CSV
   - Share functionality

EXAMPLE STRUCTURE:
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${plan.vizType} Visualization Tool</title>
    <style>
        /* Enhanced design language styles */
    </style>
</head>
<body>
    <div class="container">
        <div id="app">
            <header class="tool-header">
                <h1>${plan.vizType} Creator</h1>
                <div class="controls">
                    <!-- Control buttons -->
                </div>
            </header>
            
            <div class="input-section">
                <!-- Data input forms -->
            </div>
            
            <div class="visualization-container">
                <svg id="chart" class="chart-svg">
                    <!-- SVG visualization -->
                </svg>
            </div>
            
            <div class="export-section">
                <!-- Export controls -->
            </div>
        </div>
    </div>
    
    <script>
        // Complete interactive visualization implementation
    </script>
</body>
</html>

Task: ${instruction}

Create a fully functional, beautiful, and interactive ${
      plan.vizType
    } tool that users can immediately use to create professional visualizations.`;

    console.log(`🎨 Generating enhanced ${plan.vizType} visualization...`);
    const aiResponse = await getAIResponse(vizPrompt, context, "tool");
    console.log(`✅ Enhanced ${plan.vizType} visualization generated`);
    return aiResponse;
  };

  interface ToolPlan {
    toolType: string;
    features: string[];
    inputs: string[];
    outputs: string[];
    interactivity: string[];
    complexity: string;
    specialRequirements: string[];
    userExperience: string[];
  }

  // Enhanced tool creation with planning
  const createEnhancedTool = async (
    instruction: string,
    plan: ToolPlan,
    context: Message[]
  ) => {
    const withDesignLanguage = `
You are an expert tool builder. Create ONE COMPLETE, runnable HTML document using ONLY inline styles and vanilla JavaScript.

TOOL PLAN CONTEXT:
- Tool Type: ${plan.toolType}
- Key Features: ${plan.features.join(", ")}
- Required Inputs: ${plan.inputs.join(", ")}
- Expected Outputs: ${plan.outputs.join(", ")}
- Interactivity: ${plan.interactivity.join(", ")}
- Complexity Level: ${plan.complexity}
- Special Requirements: ${plan.specialRequirements.join(", ")}
- UX Considerations: ${plan.userExperience.join(", ")}

Design Language — Slate-Cyan (Enhanced):
- Structure: body centers a single .container. Inside it, put <div id="app" class="stack"></div>.
- Layout: max-width 700px; padding 24px; vertical gap 16px.
- Palette: canvas #0f172a; surface #1e293b; border #334155; text #e2e8f0; primary #06b6d4 (hover #0891b2); output-accent #22d3ee; success #10b981; warning #f59e0b; error #ef4444.
- Radii/Depth: card 12px; controls 8px; shadow 0 4px 12px rgba(0,0,0,.3).
- Type: system-ui, sans-serif; headings fw-600; output uses 'SF Mono', Consolas, monospace.
- Controls: inputs/selects/textareas full-width, 10x14 padding, canvas bg, slate border, light text, focus ring.
- Button: cyan bg, white text, fw-600, 8px radius; hover darkens; disabled lowers opacity; active state feedback.
- Focus: visible 2px cyan outline with 2px offset for accessibility.
- Output block .output: canvas bg, slate border, monospace, cyan text, padding 16, mt 16, wraps long text, copy button.
- Results: Use success/warning/error colors appropriately for different result types.
- Motion: 200ms ease on hovers; 150ms ease on active states.
- A11y: every input has proper <label for>; .output uses aria-live="polite"; buttons have descriptive text and keyboard support.
- Behavior: robust error handling; clear user feedback; keyboard navigation; input validation.
- Polish: loading states, smooth transitions, clear visual hierarchy.

FUNCTIONALITY REQUIREMENTS:
- Implement ALL planned features comprehensively
- Add input validation and error handling
- Include helpful user guidance and examples
- Make it responsive and intuitive
- Add keyboard shortcuts where appropriate
- Include a clear results section
- Add copy-to-clipboard functionality for results

Task: Build the following tool with all planned features implemented:

<<<BEGIN TOOL SPEC>>>
${instruction}

IMPLEMENT THESE PLANNED FEATURES:
${plan.features.map((f: string) => `- ${f}`).join("\n")}

REQUIRED INPUTS:
${plan.inputs.map((i: string) => `- ${i}`).join("\n")}

EXPECTED OUTPUTS:
${plan.outputs.map((o: string) => `- ${o}`).join("\n")}

UX REQUIREMENTS:
${plan.userExperience.map((ux: string) => `- ${ux}`).join("\n")}
<<<END TOOL SPEC>>>
`;

    console.log("🔧 Generating enhanced tool...");
    const aiResponse = await getAIResponse(withDesignLanguage, context, "tool");
    console.log("✅ Enhanced tool generated");
    return aiResponse;
  };

  // Enhanced visualization processor with diagram capabilities
  const processVisualizationCommand = async (
    query: string,
    vizType: string
  ): Promise<CommandResponse> => {
    console.log(`📊 Processing /${vizType} visualization: "${query}"`);

    const context = getRecentContext();

    // Create specialized visualization plan
    const vizPlan = await createVisualizationPlan(query, vizType, context);

    // Create the visualization using enhanced planning
    const instruction = `Create a ${vizType} visualization for: ${query}`;
    const aiResponse = await createEnhancedVisualization(
      instruction,
      vizPlan,
      context
    );

    return aiResponse;
  };

  // Command implementations - Generic tool processor
  const processToolCommand = async (
    query: string,
    toolType: string
  ): Promise<CommandResponse> => {
    console.log(`🔧 Processing /${toolType} command: "${query}"`);

    const context = getRecentContext();

    // Use shared planning function
    const toolPlan = await createToolPlan(query, context);

    // Create the tool using enhanced planning
    const instruction = `Create a ${toolType} tool for: ${query}`;
    const aiResponse = await createEnhancedTool(instruction, toolPlan, context);

    return aiResponse;
  };

  const processEmbedCommand = async (url: string): Promise<CommandResponse> => {
    if (!url) throw new Error("URL is required for /embed command");

    const validUrl = url.startsWith("http") ? url : `https://${url}`;
    try {
      new URL(validUrl);
    } catch {
      throw new Error("Invalid URL format");
    }

    // Reject YouTube explicitly
    if (validUrl.includes("youtube.com") || validUrl.includes("youtu.be")) {
      throw new Error(
        "Embedding YouTube is not supported for security reasons. Please open the video directly on YouTube."
      );
    }

    return {
      type: "embed" as const,
      content: validUrl,
      description: "Embedded Content",
    };
  };

  const processNoteCommand = async (
    content: string
  ): Promise<CommandResponse> => {
    if (!content) {
      throw new Error("Content is required for /note command");
    }

    return {
      type: "text" as const,
      content: `📝 Note: ${content}`,
      suggestions: [
        "Add another note",
        "Create a reminder",
        "Organize my notes",
      ],
      shouldPin: true, // Flag to indicate this should be pinned
    };
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      // Highlight the message briefly
      messageElement.classList.add("bg-yellow-900/30");
      setTimeout(() => {
        messageElement.classList.remove("bg-yellow-900/30");
      }, 2000);
    }
  };

  const handleCloseMaximizedEmbed = () => {
    setMaximizedEmbed(null);
  };

  // Quick Action functions

  const handleRunQuickAction = async (id: string) => {
    const quickAction = runQuickAction(id);
    if (quickAction) {
      await executeCommand(quickAction.command);
    }
  };

  // Execute command (integrates with slash command logic)
  const executeCommand = async (command: string) => {
    if (!command.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // Check for slash commands (reuse detection logic from Phase 8)
      const commandInfo = detectCommand(command);

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        type: "text",
        content: command,
      };
      addMessage(userMessage);

      if (commandInfo) {
        // Process as slash command
        try {
          const commandResponse = await processCommand(
            commandInfo.command,
            commandInfo.args,
            commandInfo.fullInput
          );

          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            type: commandResponse.type,
            content: commandResponse.content,
            suggestions: commandResponse.suggestions,
          };

          addMessage(assistantMessage);

          // Auto-pin if shouldPin flag is set (for notes)
          if (commandResponse.shouldPin) {
            setTimeout(() => {
              pinMessage(assistantMessage);
            }, 100);
          }
        } catch (commandError) {
          console.error("Command error:", commandError);
          const errorMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            type: "text",
            content: `Error: ${
              (commandError as Error).message || "Unknown command error"
            }`,
            suggestions: [
              "Try /calc for calculator",
              "Try /embed <url> for websites",
              "Try /note <text> for quick notes",
            ],
          };
          addMessage(errorMessage);
        }
      } else {
        // Process as normal message
        const context = getRecentContext();
        const aiResponse = await getAIResponse(command, context);

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          type: aiResponse.type,
          content: aiResponse.content,
          suggestions: aiResponse.suggestions,
        };

        addMessage(assistantMessage);
      }
    } catch (error) {
      console.error("Error executing command:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        type: "text",
        content: "Sorry, I encountered an error while processing your request.",
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-gray-100 font-sans">
      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          handleRunQuickAction={handleRunQuickAction}
          onShowQuickActionModal={setShowQuickActionModal}
          scrollToMessage={scrollToMessage}
        />

        {/* Main Content */}

        <MainContent
          isLoading={isLoading}
          onSetLoading={setIsLoading}
          detectCommand={detectCommand}
          processCommand={processCommand}
          createToolPlan={createToolPlan}
          createEnhancedTool={createEnhancedTool}
          setMaximizedEmbed={setMaximizedEmbed}
          context={context}
        />
      </div>

      {/* Maximized Embed Modal */}
      {maximizedEmbed && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full h-full max-w-7xl max-h-full overflow-auto p-4">
            {/* Close Button */}
            <button
              onClick={handleCloseMaximizedEmbed}
              className="absolute top-4 right-4 z-10 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg shadow-md transition-colors"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Content */}
            <div className="bg-slate-900 rounded-xl shadow-md h-full flex flex-col">
              {maximizedEmbed.description && (
                <div className="p-4 border-b border-slate-700">
                  <h2 className="text-lg font-medium text-gray-200">
                    {maximizedEmbed.description}
                  </h2>
                </div>
              )}

              <div className="flex-1 p-4 bg-slate-800">
                <div className="relative w-full h-full min-h-[400px]">
                  {maximizedEmbed.description === "Tool Output" ? (
                    <iframe
                      srcDoc={maximizedEmbed.content}
                      sandbox="allow-scripts"
                      className="absolute inset-0 w-full h-full rounded-lg"
                      title="Tool Output"
                    />
                  ) : (
                    <iframe
                      src={maximizedEmbed.content}
                      sandbox="allow-same-origin allow-scripts allow-popups"
                      className="absolute inset-0 w-full h-full rounded-lg"
                      title={maximizedEmbed.description || "Maximized content"}
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
