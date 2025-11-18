import type { Message } from "../chatStore";
import type { ToolConfig } from "../types/toolConfig";
import { getTemplateExamples } from "../templates";
import { client } from "./client";
import { TOOL_CONFIG_SYSTEM_PROMPT } from "./prompts";

export async function getToolConfig(
  prompt: string,
  context: Message[]
): Promise<ToolConfig> {
  try {
    const templateExamples = getTemplateExamples();
    const toolSystemPrompt = TOOL_CONFIG_SYSTEM_PROMPT(templateExamples);

    const contextMessages = context.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: toolSystemPrompt },
        ...contextMessages,
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content in tool config response");

    const toolConfig = JSON.parse(content) as ToolConfig;

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
