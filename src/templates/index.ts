import type { ToolConfig } from '../types/toolConfig';
import { bmiCalculator } from './analyzer';
import { percentageCalculator, simpleCalculator } from './calculator';
import { unitConverter } from './converter';
import { passwordGenerator } from './generator';
import { ticTacToe, memoryGame, numberGuessing } from './game';

export const TOOL_TEMPLATES: Record<string, ToolConfig> = {
  simpleCalculator,
  unitConverter,
  percentageCalculator,
  bmiCalculator,
  passwordGenerator,
  ticTacToe,
  memoryGame,
  numberGuessing,
};

export function getTemplateExamples(): string {
  return Object.keys(TOOL_TEMPLATES)
    .map((key) => {
      const template = TOOL_TEMPLATES[key];
      return `Template "${key}": ${template.title} - ${template.description}`;
    })
    .join('\n');
}

export function getTemplate(templateId: string): ToolConfig | null {
  return TOOL_TEMPLATES[templateId] || null;
}
