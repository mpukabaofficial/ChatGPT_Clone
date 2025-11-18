import { getAIResponse } from '../api';
import type { Message } from '../chatStore';

export interface ToolPlan {
  toolType: string;
  features: string[];
  inputs: string[];
  outputs: string[];
  interactivity: string[];
  complexity: string;
  specialRequirements: string[];
  userExperience: string[];
}

export interface VisualizationPlan {
  vizType: string;
  dataStructure: string[];
  visualElements: string[];
  interactivity: string[];
  chartTypes: string[];
  features: string[];
  colorScheme: string[];
  layout: string[];
  complexity: string;
}

/**
 * Create a plan for tool creation
 */
export async function createToolPlan(query: string, context: Message[]): Promise<ToolPlan> {
  const planningPrompt = `
You are a tool planning assistant. Analyze the following request and create a detailed plan for building a functional tool.

User Request: ${query}

Respond with a JSON object containing:
{
  "toolType": "calculator|converter|generator|analyzer|utility|game|visualizer|other",
  "features": ["list", "of", "key", "features"],
  "inputs": ["required", "input", "fields"],
  "outputs": ["expected", "output", "types"],
  "interactivity": ["user", "interactions", "needed"],
  "complexity": "simple|medium|complex",
  "specialRequirements": ["any", "special", "needs"],
  "userExperience": ["key", "ux", "considerations"]
}

Make the plan comprehensive and focused on user experience. Think about what would make this tool truly useful and functional.`;

  console.log('🧠 Planning stage...');
  const planResponse = await getAIResponse(planningPrompt, context);

  try {
    const toolPlan = JSON.parse(planResponse.content);
    console.log('📋 Tool plan:', toolPlan);
    return toolPlan;
  } catch (error) {
    console.warn('⚠️ Planning failed, using fallback:', error);
    // Fallback if parsing fails
    return {
      toolType: 'utility',
      features: ['basic functionality'],
      inputs: ['user inputs'],
      outputs: ['results'],
      interactivity: ['button clicks', 'form inputs'],
      complexity: 'simple',
      specialRequirements: [],
      userExperience: ['clear interface', 'immediate feedback'],
    };
  }
}

/**
 * Create a plan for visualization
 */
export async function createVisualizationPlan(
  query: string,
  vizType: string,
  context: Message[]
): Promise<VisualizationPlan> {
  const vizPlanningPrompt = `
You are a visualization planning expert. Analyze this request and create a detailed plan for building a ${vizType} visualization.

User Request: ${query}
Visualization Type: ${vizType}

Respond with a JSON object:
{
  "vizType": "${vizType}",
  "dataStructure": ["what", "data", "fields", "needed"],
  "visualElements": ["svg", "canvas", "html", "elements"],
  "interactivity": ["user", "interactions"],
  "chartTypes": ["specific", "chart", "types"],
  "features": ["key", "features"],
  "colorScheme": ["color", "palette"],
  "layout": ["layout", "considerations"],
  "complexity": "simple|medium|complex"
}

Focus on creating engaging, interactive visualizations with clear data representation.`;

  console.log(`📋 Planning ${vizType} visualization...`);
  const planResponse = await getAIResponse(vizPlanningPrompt, context);

  try {
    const vizPlan = JSON.parse(planResponse.content);
    console.log(`📊 ${vizType} plan:`, vizPlan);
    return vizPlan;
  } catch (error) {
    console.warn('⚠️ Visualization planning failed, using fallback:', error);
    return {
      vizType: vizType,
      dataStructure: ['labels', 'values'],
      visualElements: ['svg', 'interactive controls'],
      interactivity: ['click', 'hover', 'input'],
      chartTypes: [vizType === 'chart' ? 'bar' : vizType],
      features: ['data input', 'real-time updates', 'export'],
      colorScheme: ['blue', 'cyan', 'slate'],
      layout: ['responsive', 'centered'],
      complexity: 'medium',
    };
  }
}
