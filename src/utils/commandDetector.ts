export interface CommandInfo {
  command: string;
  args: string;
  fullInput: string;
}

/**
 * Detect if input is a slash command
 */
export function detectCommand(input: string): CommandInfo | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) return null;

  const parts = trimmed.split(' ');
  const command = parts[0].slice(1); // Remove the '/'
  const args = parts.slice(1).join(' ').trim();

  return { command, args, fullInput: trimmed };
}
