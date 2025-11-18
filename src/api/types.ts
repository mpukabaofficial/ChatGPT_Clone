import type { ToolConfig } from "../types/toolConfig";

export interface AIResponse {
  type: "text" | "tool" | "embed" | "tool_config";
  content: string;
  toolConfig?: ToolConfig;
  suggestions?: string[];
  reasoning?: string;
}

export interface CommandResponse extends AIResponse {
  shouldPin?: boolean;
  description?: string;
}
