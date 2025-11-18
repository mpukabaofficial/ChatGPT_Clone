import type { Message } from '../chatStore';
import { MAX_CONTEXT_MESSAGES, RESERVED_TOKENS } from './chatConfig';
import { truncateMessages, fitsInContext } from './tokenUtils';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Chat Context Manager
 * Manages conversation history with proper token limits
 */
export class ChatContextManager {
  private modelName: string;

  constructor(modelName: string = 'gpt-4o-mini') {
    this.modelName = modelName;
  }

  /**
   * Convert app messages to OpenAI format
   */
  convertToOpenAIFormat(messages: Message[]): ChatMessage[] {
    return messages
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))
      .filter((msg) => msg.content && msg.content.trim().length > 0);
  }

  /**
   * Build chat messages with system prompt
   */
  buildMessages(
    systemPrompt: string,
    conversationMessages: Message[],
    userPrompt: string
  ): ChatMessage[] {
    const openAIMessages = this.convertToOpenAIFormat(conversationMessages);

    // Build message array
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...openAIMessages,
      { role: 'user', content: userPrompt },
    ];

    return messages;
  }

  /**
   * Prepare messages with context pruning if needed
   */
  prepareMessages(
    systemPrompt: string,
    conversationMessages: Message[],
    userPrompt: string
  ): ChatMessage[] {
    const messages = this.buildMessages(
      systemPrompt,
      conversationMessages,
      userPrompt
    );

    // Check if messages fit in context
    if (fitsInContext(messages, this.modelName as any, RESERVED_TOKENS)) {
      return messages;
    }

    // Truncate conversation history to fit context
    console.warn('Context too large, truncating conversation history...');
    const truncated = truncateMessages(messages, this.modelName as any, RESERVED_TOKENS);

    return truncated as ChatMessage[];
  }

  /**
   * Get recent context messages (sliding window)
   */
  getRecentContext(messages: Message[], maxMessages: number = MAX_CONTEXT_MESSAGES): Message[] {
    return messages.slice(-maxMessages);
  }
}
