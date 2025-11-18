import type { VisualizationPlan } from './toolPlanning';

/**
 * Build visualization prompt based on plan
 */
export function buildVisualizationPrompt(
  instruction: string,
  plan: VisualizationPlan
): string {
  return `
You are an expert data visualization developer. Create a COMPLETE, interactive HTML document with advanced ${plan.vizType} capabilities.

VISUALIZATION PLAN:
- Type: ${plan.vizType}
- Data Structure: ${plan.dataStructure.join(', ')}
- Visual Elements: ${plan.visualElements.join(', ')}
- Interactivity: ${plan.interactivity.join(', ')}
- Chart Types: ${plan.chartTypes.join(', ')}
- Features: ${plan.features.join(', ')}
- Color Scheme: ${plan.colorScheme.join(', ')}
- Layout: ${plan.layout.join(', ')}

TECHNICAL REQUIREMENTS:
- Use SVG for vector graphics and scalability
- Include Canvas fallback for complex animations
- Pure vanilla JavaScript (no external libraries)
- Responsive design that works on all screen sizes
- Interactive data input (forms, file upload, paste data)
- Real-time visualization updates
- Export functionality (PNG, SVG, data)
- Smooth animations and transitions

DESIGN LANGUAGE - Enhanced Slate-Cyan:
- Background: #0f172a (canvas), #1e293b (surface), #334155 (borders)
- Text: #e2e8f0 (primary), #94a3b8 (secondary)
- Primary: #06b6d4 (cyan), #0891b2 (hover)
- Accent: #22d3ee (highlights), #10b981 (success), #f59e0b (warning)
- Typography: system-ui, sans-serif; monospace for data
- Spacing: 16px base, 24px container padding
- Borders: 8px radius, 1px solid borders
- Shadows: 0 4px 12px rgba(0,0,0,0.3)

VISUALIZATION FEATURES TO IMPLEMENT:
${plan.chartTypes.includes('bar') ? '- Interactive bar charts with hover effects and click handlers' : ''}
${plan.chartTypes.includes('line') ? '- Smooth line graphs with data points and tooltips' : ''}
${plan.chartTypes.includes('pie') ? '- Animated pie charts with percentage labels and legends' : ''}
${plan.chartTypes.includes('scatter') ? '- Scatter plots with zoom and pan capabilities' : ''}
${plan.vizType === 'diagram' ? '- Flowchart/diagram creator with draggable nodes and connections' : ''}
${plan.vizType === 'mindmap' ? '- Interactive mind map with expandable nodes and branches' : ''}

REQUIRED FUNCTIONALITY:
1. Data Input Section:
   - Manual data entry forms
   - CSV/JSON data paste
   - Sample data buttons
   - Data validation and error handling

2. Visualization Canvas:
   - SVG-based rendering for crisp graphics
   - Responsive sizing and scaling
   - Smooth animations and transitions
   - Interactive elements (hover, click, drag)

3. Controls Panel:
   - Chart type switcher (if applicable)
   - Color scheme selector
   - Animation speed controls
   - Export options

4. Export Features:
   - Download as PNG image
   - Export SVG vector file
   - Copy data as JSON/CSV
   - Share functionality

Task: ${instruction}

Create a fully functional, beautiful, and interactive ${plan.vizType} tool that users can immediately use to create professional visualizations.`;
}
