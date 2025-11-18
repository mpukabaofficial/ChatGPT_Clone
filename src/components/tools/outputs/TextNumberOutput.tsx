import type { ToolOutput } from '../../../types/toolConfig';
import { BaseOutput } from './BaseOutput';

interface Props {
  output: ToolOutput;
  value: string | number | boolean;
}

export const TextNumberOutput = ({ output, value }: Props) => {
  const formatValue = (val: typeof value): string => {
    if (val === null || val === undefined) return '';

    if (typeof val === 'number' && output.format) {
      if (output.format === 'currency') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      } else if (output.format === 'percent') {
        return `${(val * 100).toFixed(2)}%`;
      } else if (output.format.startsWith('fixed')) {
        const decimals = parseInt(output.format.split(':')[1] || '2');
        return val.toFixed(decimals);
      }
    }

    return String(val);
  };

  if (!value && value !== 0) {
    return (
      <BaseOutput label={output.label} value={value} copyable={output.copyable}>
        <div className="text-slate-500 italic">No result yet</div>
      </BaseOutput>
    );
  }

  return (
    <BaseOutput label={output.label} value={value} copyable={output.copyable}>
      <div className="text-slate-100 text-lg font-medium">{formatValue(value)}</div>
    </BaseOutput>
  );
};
