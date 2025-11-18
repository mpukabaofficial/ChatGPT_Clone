import { CHARS_PER_TOKEN, MODEL_LIMITS } from './chatConfig';

/**
 * Estimate token count from text (rough approximation)
 * For production, use tiktoken library for accurate counting
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Estimate tokens for a message object
 */
export function estimateMessageTokens(message: {
  role: string;
  content: string;
}): number {
  // Account for role, content, and formatting tokens
  const roleTokens = 4; // Approximate overhead per message
  const contentTokens = estimateTokens(message.content);
  return roleTokens + contentTokens;
}

/**
 * Calculate total tokens for an array of messages
 */
export function calculateTotalTokens(
  messages: Array<{ role: string; content: string }>
): number {
  return messages.reduce((sum, msg) => sum + estimateMessageTokens(msg), 0);
}

/**
 * Check if messages fit within model's context window
 */
export function fitsInContext(
  messages: Array<{ role: string; content: string }>,
  modelName: keyof typeof MODEL_LIMITS,
  reservedTokens: number
): boolean {
  const totalTokens = calculateTotalTokens(messages);
  const limit = MODEL_LIMITS[modelName] || MODEL_LIMITS['gpt-4o-mini'];
  return totalTokens + reservedTokens <= limit;
}

/**
 * Truncate messages to fit within token limit
 * Keeps system message and most recent messages
 */
export function truncateMessages(
  messages: Array<{ role: string; content: string }>,
  modelName: keyof typeof MODEL_LIMITS,
  reservedTokens: number
): Array<{ role: string; content: string }> {
  const limit = MODEL_LIMITS[modelName] || MODEL_LIMITS['gpt-4o-mini'];
  const maxTokens = limit - reservedTokens;

  // Always keep system message (first message)
  const systemMessage = messages[0]?.role === 'system' ? [messages[0]] : [];
  const conversationMessages = messages[0]?.role === 'system' ? messages.slice(1) : messages;

  let currentTokens = systemMessage.reduce(
    (sum, msg) => sum + estimateMessageTokens(msg),
    0
  );
  const result = [...systemMessage];

  // Add messages from most recent, working backwards
  for (let i = conversationMessages.length - 1; i >= 0; i--) {
    const msg = conversationMessages[i];
    const msgTokens = estimateMessageTokens(msg);

    if (currentTokens + msgTokens <= maxTokens) {
      result.splice(systemMessage.length, 0, msg);
      currentTokens += msgTokens;
    } else {
      break;
    }
  }

  return result;
}
