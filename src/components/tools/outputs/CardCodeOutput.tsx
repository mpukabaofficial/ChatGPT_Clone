import type { ToolOutput } from '../../../types/toolConfig';
import { BaseOutput } from './BaseOutput';

interface Props {
  output: ToolOutput;
  value: string | number | boolean | object | Array<string | number | object>;
}

export const CardCodeOutput = ({ output, value }: Props) => {
  const formatValue = (val: typeof value): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
  };

  if (!value && value !== 0 && value !== false) {
    return (
      <BaseOutput label={output.label} value={value} copyable={output.copyable}>
        <div className="text-slate-500 italic">No result yet</div>
      </BaseOutput>
    );
  }

  if (output.type === 'card') {
    return (
      <BaseOutput label={output.label} value={value} copyable={output.copyable}>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <pre className="text-slate-100 whitespace-pre-wrap font-mono text-sm">
            {formatValue(value)}
          </pre>
        </div>
      </BaseOutput>
    );
  }

  // code type
  return (
    <BaseOutput label={output.label} value={value} copyable={output.copyable}>
      <div className="bg-slate-950 rounded-lg p-4 border border-slate-700 overflow-x-auto">
        <pre className="text-cyan-400 font-mono text-sm">{formatValue(value)}</pre>
      </div>
    </BaseOutput>
  );
};
