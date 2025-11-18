import type { ToolOutput as ToolOutputType } from '../../types/toolConfig';
import { CardCodeOutput } from './outputs/CardCodeOutput';
import { ListTableOutput } from './outputs/ListTableOutput';
import { TextNumberOutput } from './outputs/TextNumberOutput';
import { GridOutput } from './outputs/GridOutput';

interface Props {
  output: ToolOutputType;
  value: string | number | boolean | object | Array<string | number | object>;
}

const ToolOutput = ({ output, value }: Props) => {
  // Route to appropriate output component based on type
  if (output.type === 'text' || output.type === 'number') {
    return <TextNumberOutput output={output} value={value as string | number | boolean} />;
  }

  if (output.type === 'card' || output.type === 'code') {
    return <CardCodeOutput output={output} value={value} />;
  }

  if (output.type === 'list' || output.type === 'table') {
    return <ListTableOutput output={output} value={value} />;
  }

  if (output.type === 'grid') {
    return <GridOutput output={output} value={value} />;
  }

  return <TextNumberOutput output={output} value={value as string | number | boolean} />;
};

export default ToolOutput;
