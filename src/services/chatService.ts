import type { Message } from '../chatStore';
import { client } from '../api/client';
import { CHAT_CONFIG } from '../lib/chatConfig';
import { ChatContextManager } from '../lib/chatContext';
import { withRetry, RetryableError } from '../lib/retryUtils';

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  model?: string;
  jsonMode?: boolean;
}

/**
 * Enhanced Chat Service with OpenAI best practices
 */
export class ChatService {
  private contextManager: ChatContextManager;

  constructor(modelName: string = CHAT_CONFIG.model) {
    this.contextManager = new ChatContextManager(modelName);
  }

  /**
   * Send chat completion request with retry logic
   */
  async sendMessage(
    systemPrompt: string,
    conversationHistory: Message[],
    userMessage: string,
    options: ChatOptions = {}
  ): Promise<string> {
    const messages = this.contextManager.prepareMessages(
      systemPrompt,
      conversationHistory,
      userMessage
    );

    const response = await withRetry(async () => {
      try {
        const completion = await client.chat.completions.create({
          model: options.model || CHAT_CONFIG.model,
          messages,
          temperature: options.temperature ?? CHAT_CONFIG.temperature,
          max_tokens: options.maxTokens ?? CHAT_CONFIG.maxTokens,
          top_p: CHAT_CONFIG.topP,
          frequency_penalty: CHAT_CONFIG.frequencyPenalty,
          presence_penalty: CHAT_CONFIG.presencePenalty,
          stream: false, // Force non-streaming for now
          ...(options.jsonMode && { response_format: { type: "json_object" } }),
        });

        return completion.choices[0]?.message?.content || '';
      } catch (error: any) {
        // Handle rate limits
        if (error.status === 429) {
          const retryAfter = error.headers?.['retry-after'];
          throw new RetryableError(
            'Rate limit exceeded',
            429,
            retryAfter ? parseInt(retryAfter) : undefined
          );
        }

        // Handle server errors
        if (error.status >= 500) {
          throw new RetryableError(
            `Server error: ${error.message}`,
            error.status
          );
        }

        throw error;
      }
    });

    return response;
  }

  /**
   * Get recent context for the conversation
   */
  getRecentContext(messages: Message[], maxMessages?: number): Message[] {
    return this.contextManager.getRecentContext(messages, maxMessages);
  }
}
