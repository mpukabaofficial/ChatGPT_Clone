import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { ToolOutput as ToolOutputType } from '../../types/toolConfig';

interface Props {
  output: ToolOutputType;
  value: string | number | boolean | object | Array<string | number | object>;
}

const ToolOutput = ({ output, value }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    navigator.clipboard.writeText(textValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatValue = (val: typeof value): string => {
    if (val === null || val === undefined) return '';

    if (typeof val === 'number' && output.format) {
      // Format numbers based on format string
      if (output.format === 'currency') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val);
      } else if (output.format === 'percent') {
        return `${(val * 100).toFixed(2)}%`;
      } else if (output.format.startsWith('fixed')) {
        const decimals = parseInt(output.format.split(':')[1] || '2');
        return val.toFixed(decimals);
      }
    }

    if (typeof val === 'object') {
      return JSON.stringify(val, null, 2);
    }

    return String(val);
  };

  const renderValue = () => {
    if (!value && value !== 0) {
      return <div className="text-slate-500 italic">No result yet</div>;
    }

    switch (output.type) {
      case 'text':
      case 'number':
        return (
          <div className="text-slate-100 text-lg font-medium">
            {formatValue(value)}
          </div>
        );

      case 'card':
        return (
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <pre className="text-slate-100 whitespace-pre-wrap font-mono text-sm">
              {formatValue(value)}
            </pre>
          </div>
        );

      case 'code':
        return (
          <div className="bg-slate-950 rounded-lg p-4 border border-slate-700 overflow-x-auto">
            <pre className="text-cyan-400 font-mono text-sm">
              {formatValue(value)}
            </pre>
          </div>
        );

      case 'list':
        if (Array.isArray(value)) {
          return (
            <ul className="space-y-2">
              {value.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-slate-200"
                >
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <div className="text-slate-100">{formatValue(value)}</div>;

      case 'table':
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
          const headers = Object.keys(value[0] as object);
          return (
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
                        <td
                          key={header}
                          className="px-4 py-3 text-sm text-slate-200"
                        >
                          {String((row as Record<string, unknown>)[header] || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return <div className="text-slate-100">{formatValue(value)}</div>;

      default:
        return <div className="text-slate-100">{formatValue(value)}</div>;
    }
  };

  return (
    <div className="mb-4">
      {output.label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-300">
            {output.label}
          </label>
          {output.copyable && value && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
        {renderValue()}
      </div>
    </div>
  );
};

export default ToolOutput;
