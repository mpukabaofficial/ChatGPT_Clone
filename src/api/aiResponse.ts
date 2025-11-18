import type { Message } from "../chatStore";
import { client } from "./client";
import { CHAT_SYSTEM_PROMPT } from "./prompts";
import type { AIResponse } from "./types";

export async function getAIResponse(
  prompt: string,
  context: Message[],
  forcedType?: "text" | "tool" | "embed"
): Promise<AIResponse> {
  try {
    const contextMessages = context.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

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

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...contextMessages,
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content in response");

    const parsedResponse = JSON.parse(content);

    if (!parsedResponse.type || !parsedResponse.content) {
      throw new Error("Invalid response structure");
    }

    if (!["text", "tool", "embed"].includes(parsedResponse.type)) {
      throw new Error("Invalid response type");
    }

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
    return {
      type: "text",
      content: "Error: Could not parse AI response.",
    };
  }
}
