import type OpenAI from 'openai';

export type StreamCallback = (chunk: string) => void;
export type StreamCompleteCallback = (fullText: string) => void;
export type StreamErrorCallback = (error: Error) => void;

/**
 * Handle streaming responses from OpenAI
 */
export class StreamHandler {
  private fullText: string = '';
  private onChunk?: StreamCallback;
  private onComplete?: StreamCompleteCallback;
  private onError?: StreamErrorCallback;

  constructor(
    onChunk?: StreamCallback,
    onComplete?: StreamCompleteCallback,
    onError?: StreamErrorCallback
  ) {
    this.onChunk = onChunk;
    this.onComplete = onComplete;
    this.onError = onError;
  }

  /**
   * Process streaming response
   */
  async handleStream(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
  ): Promise<string> {
    this.fullText = '';

    try {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';

        if (content) {
          this.fullText += content;
          this.onChunk?.(content);
        }
      }

      this.onComplete?.(this.fullText);
      return this.fullText;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Stream error');
      this.onError?.(err);
      throw err;
    }
  }

  /**
   * Get accumulated text
   */
  getFullText(): string {
    return this.fullText;
  }

  /**
   * Reset handler state
   */
  reset(): void {
    this.fullText = '';
  }
}

/**
 * Create a simple stream handler for non-streaming contexts
 */
export function createSimpleStreamHandler(
  onUpdate?: (text: string) => void
): StreamHandler {
  return new StreamHandler(
    () => {
      // Optional: handle chunks
    },
    (fullText) => {
      onUpdate?.(fullText);
    },
    (error) => {
      console.error('Stream error:', error);
    }
  );
}
