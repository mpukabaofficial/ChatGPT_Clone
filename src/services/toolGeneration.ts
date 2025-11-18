import { getAIResponse, type CommandResponse } from '../api';
import type { Message } from '../chatStore';
import type { ToolPlan, VisualizationPlan } from './toolPlanning';

/**
 * Generate tool based on plan
 */
export async function createEnhancedTool(
  instruction: string,
  plan: ToolPlan,
  context: Message[]
): Promise<CommandResponse> {
  const withDesignLanguage = `
You are an expert tool builder. Create ONE COMPLETE, runnable HTML document using ONLY inline styles and vanilla JavaScript.

TOOL PLAN CONTEXT:
- Tool Type: ${plan.toolType}
- Key Features: ${plan.features.join(', ')}
- Required Inputs: ${plan.inputs.join(', ')}
- Expected Outputs: ${plan.outputs.join(', ')}
- Interactivity: ${plan.interactivity.join(', ')}
- Complexity Level: ${plan.complexity}
- Special Requirements: ${plan.specialRequirements.join(', ')}
- UX Considerations: ${plan.userExperience.join(', ')}

Design Language — Slate-Cyan (Enhanced):
- Structure: body centers a single .container. Inside it, put <div id="app" class="stack"></div>.
- Layout: max-width 700px; padding 24px; vertical gap 16px.
- Palette: canvas #0f172a; surface #1e293b; border #334155; text #e2e8f0; primary #06b6d4 (hover #0891b2); output-accent #22d3ee; success #10b981; warning #f59e0b; error #ef4444.
- Radii/Depth: card 12px; controls 8px; shadow 0 4px 12px rgba(0,0,0,.3).
- Type: system-ui, sans-serif; headings fw-600; output uses 'SF Mono', Consolas, monospace.
- Controls: inputs/selects/textareas full-width, 10x14 padding, canvas bg, slate border, light text, focus ring.
- Button: cyan bg, white text, fw-600, 8px radius; hover darkens; disabled lowers opacity; active state feedback.
- Focus: visible 2px cyan outline with 2px offset for accessibility.
- Output block .output: canvas bg, slate border, monospace, cyan text, padding 16, mt 16, wraps long text, copy button.
- Results: Use success/warning/error colors appropriately for different result types.
- Motion: 200ms ease on hovers; 150ms ease on active states.
- A11y: every input has proper <label for>; .output uses aria-live="polite"; buttons have descriptive text and keyboard support.
- Behavior: robust error handling; clear user feedback; keyboard navigation; input validation.
- Polish: loading states, smooth transitions, clear visual hierarchy.

FUNCTIONALITY REQUIREMENTS:
- Implement ALL planned features comprehensively
- Add input validation and error handling
- Include helpful user guidance and examples
- Make it responsive and intuitive
- Add keyboard shortcuts where appropriate
- Include a clear results section
- Add copy-to-clipboard functionality for results

Task: Build the following tool with all planned features implemented:

<<<BEGIN TOOL SPEC>>>
${instruction}

IMPLEMENT THESE PLANNED FEATURES:
${plan.features.map((f: string) => `- ${f}`).join('\n')}

REQUIRED INPUTS:
${plan.inputs.map((i: string) => `- ${i}`).join('\n')}

EXPECTED OUTPUTS:
${plan.outputs.map((o: string) => `- ${o}`).join('\n')}

UX REQUIREMENTS:
${plan.userExperience.map((ux: string) => `- ${ux}`).join('\n')}
<<<END TOOL SPEC>>>
`;

  console.log('🔧 Generating enhanced tool...');
  const aiResponse = await getAIResponse(withDesignLanguage, context, 'tool');
  console.log('✅ Enhanced tool generated');
  return aiResponse;
}

/**
 * Generate visualization based on plan
 */
export async function createEnhancedVisualization(
  instruction: string,
  plan: VisualizationPlan,
  context: Message[]
): Promise<CommandResponse> {
  const { buildVisualizationPrompt } = await import('./visualizationPrompt');
  const vizPrompt = buildVisualizationPrompt(instruction, plan);

  console.log(`🎨 Generating enhanced ${plan.vizType} visualization...`);
  const aiResponse = await getAIResponse(vizPrompt, context, 'tool');
  console.log(`✅ Enhanced ${plan.vizType} visualization generated`);
  return aiResponse;
}
