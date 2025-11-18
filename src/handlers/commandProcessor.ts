import type { Message } from '../chatStore';
import type { CommandResponse } from '../api';
import { getToolConfig } from '../api';
import { processEmbedCommand, processNoteCommand } from './commandHandlers';

/**
 * Process tool command using the tool config framework
 */
export async function processToolCommand(
  query: string,
  toolType: string,
  context: Message[]
): Promise<CommandResponse> {
  console.log(`🔧 Processing /${toolType} command: "${query}"`);

  // Generate tool configuration using the framework
  const toolConfig = await getToolConfig(query, context);

  return {
    type: 'tool_config',
    content: toolConfig.title,
    toolConfig,
    suggestions: [
      'Modify the tool',
      'Create another tool',
      'Export results',
    ],
  };
}

/**
 * Process visualization command using the tool config framework
 */
export async function processVisualizationCommand(
  query: string,
  vizType: string,
  context: Message[]
): Promise<CommandResponse> {
  console.log(`📊 Processing /${vizType} visualization: "${query}"`);

  // Generate tool configuration for visualization
  const enhancedQuery = `Create an interactive ${vizType} visualization for: ${query}`;
  const toolConfig = await getToolConfig(enhancedQuery, context);

  return {
    type: 'tool_config',
    content: toolConfig.title,
    toolConfig,
    suggestions: [
      'Modify the visualization',
      'Create another chart',
      'Export data',
    ],
  };
}

/**
 * Main command processor - routes commands to appropriate handlers
 */
export async function processCommand(
  command: string,
  args: string,
  context: Message[]
): Promise<CommandResponse> {
  console.log(`🎯 Processing command: /${command} with args: "${args}"`);

  switch (command) {
    case 'calc':
    case 'calculator':
      return await processToolCommand(args || 'calculator', 'calculator', context);
    case 'convert':
    case 'converter':
      return await processToolCommand(args || 'unit converter', 'converter', context);
    case 'generate':
    case 'gen':
      return await processToolCommand(args || 'generator tool', 'generator', context);
    case 'analyze':
    case 'analyzer':
      return await processToolCommand(args || 'analyzer tool', 'analyzer', context);
    case 'chart':
    case 'graph':
      return await processVisualizationCommand(args || 'chart generator', 'chart', context);
    case 'diagram':
    case 'flowchart':
      return await processVisualizationCommand(args || 'diagram creator', 'diagram', context);
    case 'mindmap':
      return await processVisualizationCommand(args || 'mind map', 'mindmap', context);
    case 'timer':
    case 'countdown':
      return await processToolCommand(args || 'timer tool', 'utility', context);
    case 'game':
      return await processToolCommand(args || 'simple game', 'game', context);
    case 'embed':
      return await processEmbedCommand(args);
    case 'note':
      return await processNoteCommand(args);
    default:
      throw new Error(
        `Unknown command: /${command}. Available commands: /calc, /convert, /generate, /analyze, /chart, /timer, /game, /embed, /note`
      );
  }
}
