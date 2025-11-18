import type { CommandResponse } from '../api';

/**
 * Handle embed command
 */
export async function processEmbedCommand(url: string): Promise<CommandResponse> {
  if (!url) throw new Error('URL is required for /embed command');

  const validUrl = url.startsWith('http') ? url : `https://${url}`;
  try {
    new URL(validUrl);
  } catch {
    throw new Error('Invalid URL format');
  }

  // Reject YouTube explicitly
  if (validUrl.includes('youtube.com') || validUrl.includes('youtu.be')) {
    throw new Error(
      'Embedding YouTube is not supported for security reasons. Please open the video directly on YouTube.'
    );
  }

  return {
    type: 'embed' as const,
    content: validUrl,
    description: 'Embedded Content',
  };
}

/**
 * Handle note command
 */
export async function processNoteCommand(content: string): Promise<CommandResponse> {
  if (!content) {
    throw new Error('Content is required for /note command');
  }

  return {
    type: 'text' as const,
    content: `📝 Note: ${content}`,
    suggestions: ['Add another note', 'Create a reminder', 'Organize my notes'],
    shouldPin: true, // Flag to indicate this should be pinned
  };
}
