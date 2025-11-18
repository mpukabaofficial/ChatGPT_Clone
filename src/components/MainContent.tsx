import { ArrowUp, Maximize2, Pin, PinOff, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getAIResponse, getToolConfig, type CommandResponse } from "../api";
import { useChatStore, type Message } from "../chatStore";
import MessageText from "./MessageText";
import ToolRenderer from "./tools/ToolRenderer";
import TopNav from "./MainContent/TopNav";

interface Props {
  isLoading: boolean;
  onSetLoading: (isLoading: boolean) => void;
  detectCommand: (input: string) => {
    command: string;
    args: string;
    fullInput: string;
  } | null;
  processCommand: (
    command: string,
    args: string,
    _fullInput: string
  ) => Promise<CommandResponse>;
  setMaximizedEmbed: React.Dispatch<
    React.SetStateAction<{
      messageId: string;
      content: string;
      description?: string;
    } | null>
  >;
  context: Message[];
}

const MainContent = ({
  isLoading,
  onSetLoading,
  detectCommand,
  processCommand,
  setMaximizedEmbed,
  context,
}: Props) => {
  const store = useChatStore();
  const {
    addMessage,
    pinMessage,
    unpinItem,
    isPinned,
    getPinned,
    getMessages,
  } = store;

  const messages = getMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pinned = getPinned();
  const [morphingMessage, setMorphingMessage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showCommandDropdown, setShowCommandDropdown] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getRecentContext = (): Message[] => {
    return messages.slice(-5);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (showCommandDropdown) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev < availableCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev > 0 ? prev - 1 : availableCommands.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selectedCommand = availableCommands[selectedCommandIndex];
        setInputValue(selectedCommand.command + " ");
        setShowCommandDropdown(false);
        setSelectedCommandIndex(0);
        return;
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowCommandDropdown(false);
        setSelectedCommandIndex(0);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const availableCommands = [
    {
      command: "/calc",
      description: "Create calculators and math tools",
      example: "/calc mortgage calculator",
    },
    {
      command: "/convert",
      description: "Create unit converters",
      example: "/convert currency converter",
    },
    {
      command: "/generate",
      description: "Create generators and creators",
      example: "/generate password generator",
    },
    {
      command: "/analyze",
      description: "Create analyzers and processors",
      example: "/analyze text analyzer",
    },
    {
      command: "/chart",
      description: "Create interactive charts and graphs",
      example: "/chart bar chart for sales data",
    },
    {
      command: "/diagram",
      description: "Create flowcharts and diagrams",
      example: "/diagram project workflow",
    },
    {
      command: "/mindmap",
      description: "Create interactive mind maps",
      example: "/mindmap business strategy",
    },
    {
      command: "/timer",
      description: "Create timers and time tools",
      example: "/timer pomodoro timer",
    },
    {
      command: "/game",
      description: "Create simple games and puzzles",
      example: "/game memory game",
    },
    {
      command: "/embed",
      description: "Embed a website or URL",
      example: "/embed https://example.com",
    },
    {
      command: "/note",
      description: "Create a quick note (auto-pinned)",
      example: "/note Remember to review the project",
    },
  ];

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        type: "text",
        content: inputValue.trim(),
      };

      const currentInput = inputValue.trim();
      addMessage(userMessage);
      setInputValue("");
      onSetLoading(true);

      try {
        // Check for slash commands first
        const commandInfo = detectCommand(currentInput);

        if (commandInfo) {
          // Process as slash command
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
            toolConfig: commandResponse.toolConfig,
            description: commandResponse.description,
            suggestions: commandResponse.suggestions,
          };

          addMessage(assistantMessage);

          // Auto-pin if shouldPin flag is set (for notes)
          if (commandResponse.shouldPin) {
            setTimeout(() => {
              pinMessage(assistantMessage);
            }, 100);
          }
        } else {
          // Process as normal AI message with enhanced tool detection
          console.log(`🤖 AI analyzing request: "${currentInput}"`);

          const aiResponse = await getAIResponse(currentInput, context);

          // Log AI's decision reasoning
          if (aiResponse.reasoning) {
            console.log(
              `🧠 AI Decision: ${aiResponse.type} - ${aiResponse.reasoning}`
            );
          }

          // If AI decided to create a tool, use new config-based system
          if (aiResponse.type === "tool") {
            console.log(
              "🔧 AI requested tool creation - generating tool config (NEW SYSTEM)"
            );

            try {
              // Generate tool configuration (much more efficient than HTML)
              const toolConfig = await getToolConfig(currentInput, context);

              const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                type: "tool_config",
                content: toolConfig.title,
                toolConfig: toolConfig,
                description: toolConfig.description,
                suggestions: aiResponse.suggestions,
              };

              addMessage(assistantMessage);
              console.log("✅ Tool config generated successfully:", toolConfig.title);
            } catch (error) {
              console.error(
                "❌ Tool config generation failed:",
                error
              );
              // Fallback to text response if tool generation fails
              const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                type: "text",
                content: "I apologize, but I encountered an error while creating the tool. Let me help you with a text explanation instead.",
                suggestions: ["Try a simpler tool", "Ask a different question", "Report this issue"],
              };

              addMessage(assistantMessage);
            }
          } else {
            // Regular text or embed response
            const assistantMessage: Message = {
              id: crypto.randomUUID(),
              role: "assistant",
              type: aiResponse.type,
              content: aiResponse.content,
              suggestions: aiResponse.suggestions,
            };

            addMessage(assistantMessage);
          }
        }
      } catch (error) {
        console.error("Error getting AI response:", error);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content:
            "Sorry, I encountered an error while processing your request.",
        };
        addMessage(errorMessage);
      } finally {
        onSetLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Show command dropdown when user types "/"
    if (value === "/") {
      setShowCommandDropdown(true);
      setSelectedCommandIndex(0);
    } else if (!value.startsWith("/") || value.includes(" ")) {
      setShowCommandDropdown(false);
      setSelectedCommandIndex(0);
    }
  };

  const handleCommandSelect = (command: string) => {
    setInputValue(command + " ");
    setShowCommandDropdown(false);
    setSelectedCommandIndex(0);
  };

  const handleMaximizeEmbed = (message: Message) => {
    setMaximizedEmbed({
      messageId: message.id,
      content: message.content,
      description:
        message.description ||
        (message.type === "tool" ? "Tool Output" : "Embedded Content"),
    });
  };

  const handleTogglePin = (message: Message) => {
    if (isPinned(message.id)) {
      const pinnedItem = pinned.find((p) => p.messageId === message.id);
      if (pinnedItem) {
        unpinItem(pinnedItem.id);
      }
    } else {
      pinMessage(message);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (!suggestion.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      type: "text",
      content: suggestion.trim(),
    };

    addMessage(userMessage);
    onSetLoading(true);

    try {
      const context = getRecentContext();
      const aiResponse = await getAIResponse(suggestion.trim(), context);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        type: aiResponse.type,
        content: aiResponse.content,
        suggestions: aiResponse.suggestions,
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error("Error getting AI response from suggestion:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        type: "text",
        content: "Sorry, I encountered an error while processing your request.",
      };
      addMessage(errorMessage);
    } finally {
      onSetLoading(false);
    }
  };

  const handleMorph = async (
    messageId: string,
    targetType: "text" | "tool" | "embed"
  ) => {
    setMorphingMessage(messageId);

    try {
      const userPrompt = findUserPromptForMessage(messageId);
      const context = getRecentContext();

      // If morphing to tool, use the new config framework
      if (targetType === "tool") {
        console.log("🔄 Morphing to tool - using new config framework");
        const toolConfig = await getToolConfig(userPrompt, context);

        const morphedMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "tool_config",
          content: toolConfig.title,
          toolConfig: toolConfig,
          description: toolConfig.description,
          suggestions: ["Modify this tool", "Create another tool", "Ask a question"],
        };

        addMessage(morphedMessage);
      } else {
        // For text or embed, use regular AI response
        const aiResponse = await getAIResponse(userPrompt, context, targetType);

        const morphedMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          type: aiResponse.type,
          content: aiResponse.content,
          suggestions: aiResponse.suggestions,
        };

        addMessage(morphedMessage);
      }
    } catch (error) {
      console.error("Error morphing response:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        type: "text",
        content: "Error: Could not morph response. Try again.",
      };
      addMessage(errorMessage);
    } finally {
      setMorphingMessage(null);
    }
  };

  const findUserPromptForMessage = (messageId: string): string => {
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        return messages[i].content;
      }
    }
    return "Please provide a helpful response.";
  };

  const renderMorphButtons = (message: Message) => {
    if (message.role !== "assistant" || morphingMessage === message.id) {
      return null;
    }

    const isMessagePinned = isPinned(message.id);

    return (
      <div className="flex gap-2 mt-2 ml-auto max-w-[70%]">
        <button
          onClick={() => handleTogglePin(message)}
          disabled={isLoading || morphingMessage !== null}
          className={`flex items-center gap-1 text-sxsrounded-full  px-2 py-1 transition-colors ${
            isMessagePinned
              ? "text-yellow-400 hover:text-yellow-300"
              : "text-gray-400 hover:text-yellow-400"
          }`}
          title={isMessagePinned ? "Unpin" : "Pin"}
        >
          {isMessagePinned ? (
            <PinOff className="w-3 h-3" />
          ) : (
            <Pin className="w-3 h-3" />
          )}
          {isMessagePinned ? "Unpin" : "Pin"}
        </button>
        <button
          onClick={() => handleMorph(message.id, "text")}
          disabled={isLoading || morphingMessage !== null}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs rounded-full px-2 py-1 transition-colors"
        >
          Re-run as Text
        </button>
        <button
          onClick={() => handleMorph(message.id, "tool")}
          disabled={isLoading || morphingMessage !== null}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs rounded-full px-2 py-1 transition-colors"
        >
          Re-run as Tool
        </button>
        <button
          onClick={() => handleMorph(message.id, "embed")}
          disabled={isLoading || morphingMessage !== null}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs rounded-full px-2 py-1 transition-colors"
        >
          Re-run as Embed
        </button>
      </div>
    );
  };

  const renderSuggestions = (message: Message) => {
    if (
      message.role !== "assistant" ||
      !message.suggestions ||
      message.suggestions.length === 0
    ) {
      return null;
    }

    const limitedSuggestions = message.suggestions.slice(0, 3);

    return (
      <div className="mt-3 ml-auto max-w-[70%] animate-in fade-in duration-500">
        <div className="text-sm text-gray-400 mb-2">What else can I ask?</div>
        <div className="flex flex-wrap gap-2">
          {limitedSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isLoading}
              className="border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm rounded-full px-4 py-2 cursor-pointer transition-all duration-200 text-center break-words min-w-0"
              title={suggestion}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-slate-900">
      <TopNav />

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scroll-smooth">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="text-center mb-8">
                <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">
                  Ready when you are.
                </h1>
                <p className="text-slate-400 mb-6">
                  Try a quick action, slash command, or just ask anything
                </p>

                <div className="text-left max-w-md">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">
                    Try these demo embeds:
                  </h3>
                  <div className="space-y-2 text-sm">
                    <button
                      onClick={() => {
                        setInputValue(
                          "/embed https://en.wikipedia.org/wiki/Artificial_intelligence"
                        );
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      className="block w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-700 text-cyan-400 hover:underline transition-colors"
                    >
                      /embed Wikipedia article
                    </button>
                    <button
                      onClick={() => {
                        setInputValue(
                          "/embed https://codepen.io/team/codepen/pen/PNaGbb"
                        );
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      className="block w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-700 text-cyan-400 hover:underline transition-colors"
                    >
                      /embed CodePen demo
                    </button>
                    <button
                      onClick={() => {
                        setInputValue("/calc simple calculator");
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      className="block w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-700 text-cyan-400 hover:underline transition-colors"
                    >
                      /calc Create calculator
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} id={`message-${message.id}`}>
                  {message.type === "tool" && (
                    <section className="mt-6">
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-amber-500/30 mb-4">
                        <p className="text-sm text-amber-300">
                          ⚠️ Legacy tool format detected. This tool was created with the old system.
                          New tools use an improved framework with better performance and design.
                        </p>
                      </div>
                      <div className="bg-slate-900 rounded-xl p-4">
                        <div className="mb-3 text-sm text-gray-400">
                          Tool Output (Legacy)
                        </div>
                        <div
                          className="relative w-full bg-slate-800 rounded-lg"
                          style={{ paddingBottom: "56.25%" }}
                        >
                          <iframe
                            srcDoc={message.content}
                            className="absolute inset-0 w-full h-full rounded-lg"
                            title="Tool Output"
                            sandbox="allow-scripts"
                          />
                        </div>
                      </div>
                    </section>
                  )}
                  {message.type === "tool_config" && message.toolConfig && (
                    <section className="mt-6">
                      <ToolRenderer config={message.toolConfig} />
                    </section>
                  )}
                  {message.type === "embed" && (
                    <section className="mt-6 bg-slate-900 rounded-xl relative group">
                      {/* Action Bar */}
                      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleMaximizeEmbed(message)}
                          className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg shadow-md transition-colors"
                          title="Maximize"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4">
                        {message.description && (
                          <div className="mb-3 text-sm text-gray-300">
                            {message.description}
                          </div>
                        )}
                        <div
                          className="relative w-full"
                          style={{ paddingBottom: "56.25%" }}
                        >
                          <iframe
                            src={message.content}
                            className="absolute inset-0 w-full h-full rounded-lg"
                            title={message.description || "Embedded content"}
                            sandbox="allow-same-origin allow-scripts allow-popups"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    </section>
                  )}
                  {message.type === "text" && (
                    <div
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <MessageText content={message.content} role={message.role} />
                    </div>
                  )}
                  {renderMorphButtons(message)}
                  {renderSuggestions(message)}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-2xl p-4 rounded-lg bg-slate-900 text-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <span className="text-gray-400">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Chat Input - Sticky at bottom */}
      <div className="bg-slate-900 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="flex items-center bg-slate-700 rounded-full py-3 px-6">
              <input
                type="text"
                placeholder={
                  isLoading
                    ? "Generating response..."
                    : "Ask anything or type / for commands"
                }
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`ml-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  inputValue.trim() && !isLoading
                    ? "bg-slate-600 hover:bg-slate-700 text-white"
                    : "bg-slate-600 text-slate-400"
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Command Dropdown */}
            {showCommandDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                {availableCommands.map((cmd, index) => (
                  <button
                    key={cmd.command}
                    onClick={() => handleCommandSelect(cmd.command)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 ${
                      index === selectedCommandIndex ? "bg-slate-700" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-400 font-mono text-sm">
                        {cmd.command}
                      </span>
                      <span className="text-gray-300 text-sm flex-1">
                        {cmd.description}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 font-mono">
                      {cmd.example}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
