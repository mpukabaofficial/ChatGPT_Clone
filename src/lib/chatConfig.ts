// OpenAI Chat Configuration
export const CHAT_CONFIG = {
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
} as const;

// Context window limits for different models
export const MODEL_LIMITS = {
  'gpt-4o-mini': 128000,
  'gpt-4o': 128000,
  'gpt-4-turbo': 128000,
  'gpt-4': 8192,
  'gpt-3.5-turbo': 16385,
} as const;

// Token estimation (rough approximation: 1 token ≈ 4 characters)
export const CHARS_PER_TOKEN = 4;

// Reserve tokens for system prompt and response
export const RESERVED_TOKENS = 2500;

// Maximum context messages to keep
export const MAX_CONTEXT_MESSAGES = 20;

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
} as const;

// Streaming configuration
export const STREAM_CONFIG = {
  enabled: true,
  chunkSize: 1024,
} as const;
