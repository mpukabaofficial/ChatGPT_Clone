import { useState } from 'react';
import type { ToolInput } from '../../../types/toolConfig';
import { BaseInput } from './BaseInput';

interface Props {
  input: ToolInput;
  value: number | boolean;
  onChange: (value: number | boolean) => void;
}

export const SliderCheckboxInput = ({ input, value, onChange }: Props) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue: number | boolean) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  if (input.type === 'slider') {
    return (
      <BaseInput
        id={input.id}
        label={input.label}
        required={input.required}
      >
        <div className="space-y-2">
          <input
            id={input.id}
            type="range"
            value={localValue as number}
            onChange={(e) => handleChange(Number(e.target.value))}
            min={input.min || 0}
            max={input.max || 100}
            step={input.step || 1}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="text-center text-slate-400 text-sm font-mono">
            {localValue as number}
          </div>
        </div>
      </BaseInput>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex items-center">
        <input
          id={input.id}
          type="checkbox"
          checked={localValue as boolean}
          onChange={(e) => handleChange(e.target.checked)}
          className="w-5 h-5 bg-slate-800 border border-slate-600 rounded cursor-pointer accent-cyan-500"
        />
        <label htmlFor={input.id} className="ml-2 text-sm text-slate-300">
          {input.helpText}
        </label>
      </div>
    </div>
  );
};
