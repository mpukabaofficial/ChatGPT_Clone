import { useState } from 'react';
import type { ToolInput } from '../../../types/toolConfig';
import { BaseInput } from './BaseInput';

interface Props {
  input: ToolInput;
  value: string;
  onChange: (value: string) => void;
}

export const DateColorInput = ({ input, value, onChange }: Props) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const baseInputClass =
    'w-full bg-slate-800 text-slate-100 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all';

  if (input.type === 'date') {
    return (
      <BaseInput
        id={input.id}
        label={input.label}
        required={input.required}
        helpText={input.helpText}
      >
        <input
          id={input.id}
          type="date"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          required={input.required}
          className={baseInputClass}
        />
      </BaseInput>
    );
  }

  return (
    <BaseInput
      id={input.id}
      label={input.label}
      required={input.required}
      helpText={input.helpText}
    >
      <div className="flex items-center gap-3">
        <input
          id={input.id}
          type="color"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className="h-10 w-20 bg-slate-800 border border-slate-600 rounded cursor-pointer"
        />
        <input
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 bg-slate-800 text-slate-100 border border-slate-600 rounded-lg px-4 py-2 font-mono text-sm"
        />
      </div>
    </BaseInput>
  );
};
