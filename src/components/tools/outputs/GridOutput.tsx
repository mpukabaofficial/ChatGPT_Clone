import type { ToolOutput } from '../../../types/toolConfig';
import { BaseOutput } from './BaseOutput';

interface Props {
  output: ToolOutput;
  value: string | number | boolean | object | Array<string | number | object>;
}

export const GridOutput = ({ output, value }: Props) => {
  if (!value || !Array.isArray(value)) {
    return (
      <BaseOutput label={output.label} value={value} copyable={false}>
        <div className="text-slate-500 italic">Start a new game!</div>
      </BaseOutput>
    );
  }

  const gridSize = output.gridSize || { rows: 3, cols: 3 };
  const { cols } = gridSize;

  // Render grid for games
  return (
    <BaseOutput label={output.label} value={value} copyable={false}>
      <div
        className="inline-grid gap-2 p-4 bg-slate-800 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {value.map((cell, index) => {
          const cellValue = String(cell || '');
          const isEmpty = !cellValue || cellValue === '';

          return (
            <div
              key={index}
              className={`
                aspect-square flex items-center justify-center
                rounded-lg border-2 font-bold text-2xl
                transition-all duration-200
                ${isEmpty
                  ? 'bg-slate-700 border-slate-600 hover:bg-slate-600 cursor-pointer'
                  : cellValue === 'X' || cellValue === '1'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : cellValue === 'O' || cellValue === '2'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-slate-600 border-slate-500 text-slate-200'
                }
              `}
              title={`Position ${index}`}
            >
              {cellValue}
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-slate-400">
        Click on cell positions (0-{value.length - 1}) to make moves
      </div>
    </BaseOutput>
  );
};
