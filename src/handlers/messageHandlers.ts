import { getAIResponse } from '../api';
import type { Message } from '../chatStore';
import { detectCommand } from '../utils/commandDetector';
import { processCommand } from './commandProcessor';

/**
 * Execute command (integrates with slash command logic)
 */
export async function executeCommand(
  command: string,
  context: Message[],
  addMessage: (message: Message) => void,
  isLoading: boolean,
  setIsLoading: (loading: boolean) => void,
  pinMessage: (message: Message) => void
): Promise<void> {
  if (!command.trim() || isLoading) return;

  setIsLoading(true);

  try {
    // Check for slash commands
    const commandInfo = detectCommand(command);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      type: 'text',
      content: command,
    };
    addMessage(userMessage);

    if (commandInfo) {
      // Process as slash command
      try {
        const commandResponse = await processCommand(
          commandInfo.command,
          commandInfo.args,
          context
        );

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          type: commandResponse.type,
          content: commandResponse.content,
          suggestions: commandResponse.suggestions,
        };

        addMessage(assistantMessage);

        // Auto-pin if shouldPin flag is set (for notes)
        if (commandResponse.shouldPin) {
          setTimeout(() => {
            pinMessage(assistantMessage);
          }, 100);
        }
      } catch (commandError) {
        console.error('Command error:', commandError);
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          type: 'text',
          content: `Error: ${(commandError as Error).message || 'Unknown command error'}`,
          suggestions: [
            'Try /calc for calculator',
            'Try /embed <url> for websites',
            'Try /note <text> for quick notes',
          ],
        };
        addMessage(errorMessage);
      }
    } else {
      // Process as normal message
      const aiResponse = await getAIResponse(command, context);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        type: aiResponse.type,
        content: aiResponse.content,
        suggestions: aiResponse.suggestions,
      };

      addMessage(assistantMessage);
    }
  } catch (error) {
    console.error('Error executing command:', error);
    const errorMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      type: 'text',
      content: 'Sorry, I encountered an error while processing your request.',
    };
    addMessage(errorMessage);
  } finally {
    setIsLoading(false);
  }
}

/**
 * Scroll to a specific message
 */
export function scrollToMessage(messageId: string): void {
  const messageElement = document.getElementById(`message-${messageId}`);
  if (messageElement) {
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Highlight the message briefly
    messageElement.classList.add('bg-yellow-900/30');
    setTimeout(() => {
      messageElement.classList.remove('bg-yellow-900/30');
    }, 2000);
  }
}
