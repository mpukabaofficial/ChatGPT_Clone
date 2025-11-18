// Tool Configuration Types

export type InputType =
  | 'text'
  | 'number'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'slider'
  | 'date'
  | 'color';

export type OutputType =
  | 'text'
  | 'number'
  | 'card'
  | 'list'
  | 'table'
  | 'chart'
  | 'code'
  | 'markdown'
  | 'canvas'
  | 'grid';

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter';

export interface ToolInput {
  id: string;
  type: InputType;
  label: string;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  helpText?: string;
}

export interface ToolOutput {
  id: string;
  type: OutputType;
  label?: string;
  format?: string; // For formatting numbers, dates, etc.
  chartType?: ChartType;
  copyable?: boolean;
  gridSize?: { rows: number; cols: number }; // For grid-based games
  cellRenderer?: string; // JavaScript function to render cells
}

export interface ToolAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  logic: string; // JavaScript function body as string
}

export interface ToolSection {
  id: string;
  title?: string;
  description?: string;
  inputs?: ToolInput[];
  outputs?: ToolOutput[];
  actions?: ToolAction[];
}

export interface ToolConfig {
  id: string;
  type: 'calculator' | 'converter' | 'generator' | 'analyzer' | 'visualizer' | 'game' | 'custom';
  title: string;
  description?: string;
  icon?: string;
  sections: ToolSection[];
  globalActions?: ToolAction[];
  styling?: {
    primaryColor?: string;
    accentColor?: string;
    layout?: 'single' | 'split' | 'grid';
  };
  gameConfig?: {
    canvasWidth?: number;
    canvasHeight?: number;
    cellSize?: number;
    enableKeyboard?: boolean;
    enableMouse?: boolean;
  };
}

export interface ToolState {
  [key: string]: string | number | boolean | Array<string | number>;
}

export interface ToolResult {
  [key: string]: string | number | boolean | object | Array<string | number | object>;
}
