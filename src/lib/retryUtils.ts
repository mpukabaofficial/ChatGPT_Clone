import { RETRY_CONFIG } from './chatConfig';

export class RetryableError extends Error {
  readonly statusCode?: number;
  readonly retryAfter?: number;

  constructor(
    message: string,
    statusCode?: number,
    retryAfter?: number
  ) {
    super(message);
    this.name = 'RetryableError';
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
  }
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof RetryableError) return true;

  // Check for specific OpenAI error codes that should be retried
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];

  if (error && typeof error === 'object') {
    const statusCode = (error as any).status || (error as any).statusCode;
    if (statusCode && retryableStatusCodes.includes(statusCode)) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate delay for retry with exponential backoff
 */
export function calculateRetryDelay(
  attemptNumber: number,
  retryAfter?: number
): number {
  if (retryAfter) {
    return retryAfter * 1000; // Convert to milliseconds
  }

  const delay = Math.min(
    RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attemptNumber),
    RETRY_CONFIG.maxDelay
  );

  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }

      const retryAfter = error instanceof RetryableError ? error.retryAfter : undefined;
      const delay = calculateRetryDelay(attempt, retryAfter);

      console.warn(
        `Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
        error
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
