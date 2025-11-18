import { useState } from 'react';
import type { ToolInput } from '../../../types/toolConfig';
import { BaseInput } from './BaseInput';

interface Props {
  input: ToolInput;
  value: string | number;
  onChange: (value: string | number) => void;
}

export const TextNumberInput = ({ input, value, onChange }: Props) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue: string | number) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const baseInputClass =
    'w-full bg-slate-800 text-slate-100 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all';

  if (input.type === 'number') {
    return (
      <BaseInput
        id={input.id}
        label={input.label}
        required={input.required}
        helpText={input.helpText}
      >
        <input
          id={input.id}
          type="number"
          value={localValue as number}
          onChange={(e) => handleChange(Number(e.target.value))}
          placeholder={input.placeholder}
          min={input.min}
          max={input.max}
          step={input.step}
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
      <input
        id={input.id}
        type="text"
        value={localValue as string}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={input.placeholder}
        required={input.required}
        className={baseInputClass}
      />
    </BaseInput>
  );
};
