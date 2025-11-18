import type { Message } from "../chatStore";
import type { ToolConfig } from "../types/toolConfig";
import { getTemplateExamples } from "../templates";
import { ChatService } from "../services/chatService";
import { TOOL_CONFIG_SYSTEM_PROMPT } from "./prompts";

const chatService = new ChatService();

export async function getToolConfig(
  prompt: string,
  context: Message[]
): Promise<ToolConfig> {
  try {
    const templateExamples = getTemplateExamples();
    const toolSystemPrompt = TOOL_CONFIG_SYSTEM_PROMPT(templateExamples);

    // Get recent context
    const recentContext = chatService.getRecentContext(context, 3);

    // Send message using ChatService with retry logic
    const responseText = await chatService.sendMessage(
      toolSystemPrompt,
      recentContext,
      prompt,
      {
        temperature: 0.7,
        maxTokens: 1500,
        jsonMode: true,
      }
    );

    // Parse tool configuration
    const toolConfig = JSON.parse(responseText) as ToolConfig;

    // Validate the tool config has required fields
    if (
      !toolConfig.id ||
      !toolConfig.type ||
      !toolConfig.title ||
      !toolConfig.sections
    ) {
      throw new Error("Invalid tool configuration structure");
    }

    return toolConfig;
  } catch (error) {
    console.error("Tool Config Generation Error:", error);

    // Return fallback calculator
    return {
      id: "fallback-calculator",
      type: "calculator",
      title: "Simple Calculator",
      description: "Error occurred, showing fallback calculator",
      sections: [
        {
          id: "main",
          inputs: [
            { id: "num1", type: "number", label: "Number 1", defaultValue: 0 },
            { id: "num2", type: "number", label: "Number 2", defaultValue: 0 },
          ],
          actions: [
            {
              id: "add",
              label: "Add",
              type: "primary",
              logic: "results.result = Number(inputs.num1) + Number(inputs.num2);",
            },
          ],
          outputs: [
            { id: "result", type: "number", label: "Result", copyable: true },
          ],
        },
      ],
    };
  }
}
