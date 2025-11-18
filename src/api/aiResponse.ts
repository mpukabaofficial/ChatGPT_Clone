import type { Message } from "../chatStore";
import { ChatService } from "../services/chatService";
import { CHAT_SYSTEM_PROMPT } from "./prompts";
import type { AIResponse } from "./types";

const chatService = new ChatService();

export async function getAIResponse(
  prompt: string,
  context: Message[],
  forcedType?: "text" | "tool" | "embed"
): Promise<AIResponse> {
  try {
    // Build system prompt with type forcing if needed
    let systemPrompt = CHAT_SYSTEM_PROMPT;
    if (forcedType) {
      const typeInstructions = {
        text: "IMPORTANT: You MUST respond with type = 'text' only. Provide a clear, helpful text response.",
        tool: "IMPORTANT: You MUST respond with type = 'tool' only. Provide runnable HTML/JS code that creates an interactive tool, calculator, or small app.",
        embed:
          "IMPORTANT: You MUST respond with type = 'embed' only. Provide a URL that can be embedded in an iframe.",
      };
      systemPrompt += `\n\n${typeInstructions[forcedType]}`;
    }

    // Get recent context (last 5 messages for efficiency)
    const recentContext = chatService.getRecentContext(context, 5);

    // Send message using ChatService with retry logic
    const responseText = await chatService.sendMessage(
      systemPrompt,
      recentContext,
      prompt,
      {
        temperature: 0.7,
        maxTokens: 2000,
        jsonMode: true,
      }
    );

    // Parse JSON response
    const parsedResponse = JSON.parse(responseText);

    // Validate response structure
    if (!parsedResponse.type || !parsedResponse.content) {
      throw new Error("Invalid response structure");
    }

    // Validate type
    if (!["text", "tool", "embed"].includes(parsedResponse.type)) {
      throw new Error("Invalid response type");
    }

    // Ensure suggestions is an array
    if (
      parsedResponse.suggestions &&
      !Array.isArray(parsedResponse.suggestions)
    ) {
      parsedResponse.suggestions = [];
    }

    return {
      type: parsedResponse.type,
      content: parsedResponse.content,
      suggestions: parsedResponse.suggestions || [],
      reasoning: parsedResponse.reasoning || "",
    } as AIResponse;
  } catch (error) {
    console.error("AI Response Error:", error);

    // Provide helpful error message based on error type
    let errorMessage = "Error: Could not parse AI response.";

    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        errorMessage = "Error: Rate limit exceeded. Please try again in a moment.";
      } else if (error.message.includes('timeout')) {
        errorMessage = "Error: Request timed out. Please try again.";
      } else if (error.message.includes('network')) {
        errorMessage = "Error: Network error. Please check your connection.";
      }
    }

    return {
      type: "text",
      content: errorMessage,
    };
  }
}
