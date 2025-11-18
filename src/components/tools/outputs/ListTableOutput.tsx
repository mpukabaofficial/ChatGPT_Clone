import type { ToolOutput } from '../../../types/toolConfig';
import { BaseOutput } from './BaseOutput';

interface Props {
  output: ToolOutput;
  value: string | number | boolean | object | Array<string | number | object>;
}

export const ListTableOutput = ({ output, value }: Props) => {
  if (!value) {
    return (
      <BaseOutput label={output.label} value={value} copyable={output.copyable}>
        <div className="text-slate-500 italic">No result yet</div>
      </BaseOutput>
    );
  }

  if (output.type === 'list' && Array.isArray(value)) {
    return (
      <BaseOutput label={output.label} value={value} copyable={output.copyable}>
        <ul className="space-y-2">
          {value.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-slate-200">
              <span className="text-cyan-400 mt-1">•</span>
              <span>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
            </li>
          ))}
        </ul>
      </BaseOutput>
    );
  }

  if (
    output.type === 'table' &&
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object'
  ) {
    const headers = Object.keys(value[0] as object);
    return (
      <BaseOutput label={output.label} value={value} copyable={output.copyable}>
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-700">
              {value.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-800/50 transition-colors">
                  {headers.map((header) => (
                    <td key={header} className="px-4 py-3 text-sm text-slate-200">
                      {String((row as Record<string, unknown>)[header] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BaseOutput>
    );
  }

  return (
    <BaseOutput label={output.label} value={value} copyable={output.copyable}>
      <div className="text-slate-100">{String(value)}</div>
    </BaseOutput>
  );
};
