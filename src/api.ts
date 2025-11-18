import OpenAI from "openai";
import type { Message } from "./chatStore";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are an intelligent chat assistant with advanced tool creation capabilities.

RESPONSE FORMAT - Always reply ONLY in JSON:
{
  "type": "text" | "tool" | "embed",
  "content": "string",
  "suggestions": ["Follow-up 1", "Follow-up 2", "Follow-up 3"],
  "reasoning": "Brief explanation of why this type was chosen"
}

ENHANCED TOOL DETECTION RULES:
Return type = "tool" when the user requests:

CALCULATORS & MATH:
- Any calculator (basic, scientific, financial, etc.)
- Math tools (equation solvers, graphing, statistics)
- Financial calculators (mortgage, loan, investment, budget)
- Unit converters (currency, measurement, temperature)
- Percentage calculators, tip calculators, tax calculators

GENERATORS & CREATORS:
- Random generators (password, name, color, quote)
- Code generators (CSS, HTML, regex, SQL)
- Text tools (word counter, formatter, case converter)
- QR code generators, barcode creators
- Resume builders, letter generators

ANALYZERS & PROCESSORS:
- Data analyzers (CSV processor, JSON formatter)
- Text analyzers (readability, sentiment, keywords)
- Image tools (resizer, color picker, filters)
- Performance calculators (speed, efficiency, ROI)
- Health tools (BMI, calorie counter, fitness tracker)

UTILITIES & HELPERS:
- Time tools (countdown, stopwatch, timezone converter)
- Productivity tools (todo lists, timers, schedulers)
- Development tools (API tester, regex tester, formatter)
- Educational tools (quiz makers, flashcards, learning aids)
- Planning tools (project planner, budget tracker, goal setter)

INTERACTIVE APPS:
- Games (simple puzzles, quizzes, brain teasers)
- Simulators (dice roller, coin flipper, lottery picker)
- Visualization tools (charts, graphs, diagrams)
- Decision makers (pros/cons, comparison tools)

KEY INDICATORS for "tool":
- Words like: "calculate", "generate", "create", "build", "make", "convert", "analyze", "track", "measure", "compare", "test", "check", "find", "organize", "plan"
- Phrases like: "I need a", "help me", "build me", "create something", "tool for", "app that", "calculator for"
- Specific requests for functionality that would benefit from interactivity

Return type = "embed" for:
- Specific websites, URLs, or web content to display
- YouTube videos (though explain security limitations)
- External tools or services to iframe

Return type = "text" for:
- General questions, explanations, discussions
- Information requests without tool needs
- Conversations, advice, creative writing
- When no interactive functionality would help

Always include "reasoning" to explain your type choice for debugging.
After every response, include 3-5 contextually relevant "suggestions" for follow-up questions or actions.`;

export interface AIResponse {
  type: "text" | "tool" | "embed";
  content: string;
  suggestions?: string[];
  reasoning?: string;
}

export interface CommandResponse extends AIResponse {
  shouldPin?: boolean;
  description?: string;
}

export async function getAIResponse(
  prompt: string, 
  context: Message[], 
  forcedType?: "text" | "tool" | "embed"
): Promise<AIResponse> {
  try {
    // Convert context messages to OpenAI format
    const contextMessages = context.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Create system prompt with forced type if specified
    let systemPrompt = SYSTEM_PROMPT;
    if (forcedType) {
      const typeInstructions = {
        text: "IMPORTANT: You MUST respond with type = 'text' only. Provide a clear, helpful text response.",
        tool: "IMPORTANT: You MUST respond with type = 'tool' only. Provide runnable HTML/JS code that creates an interactive tool, calculator, or small app.",
        embed: "IMPORTANT: You MUST respond with type = 'embed' only. Provide a URL that can be embedded in an iframe."
      };
      systemPrompt += `\n\n${typeInstructions[forcedType]}`;
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...contextMessages,
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    const parsedResponse = JSON.parse(content);
    
    // Validate response structure
    if (!parsedResponse.type || !parsedResponse.content) {
      throw new Error("Invalid response structure");
    }

    // Validate type
    if (!["text", "tool", "embed"].includes(parsedResponse.type)) {
      throw new Error("Invalid response type");
    }

    // Ensure suggestions is an array if provided, default to empty array
    if (parsedResponse.suggestions && !Array.isArray(parsedResponse.suggestions)) {
      parsedResponse.suggestions = [];
    }

    return {
      type: parsedResponse.type,
      content: parsedResponse.content,
      suggestions: parsedResponse.suggestions || [],
      reasoning: parsedResponse.reasoning || ""
    } as AIResponse;
  } catch (error) {
    console.error("AI Response Error:", error);
    return {
      type: "text",
      content: "Error: Could not parse AI response.",
    };
  }
}