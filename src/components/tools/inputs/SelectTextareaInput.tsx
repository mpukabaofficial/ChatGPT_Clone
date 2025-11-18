import { useState } from 'react';
import type { ToolInput } from '../../../types/toolConfig';
import { BaseInput } from './BaseInput';

interface Props {
  input: ToolInput;
  value: string;
  onChange: (value: string) => void;
}

export const SelectTextareaInput = ({ input, value, onChange }: Props) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const baseClass =
    'w-full bg-slate-800 text-slate-100 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all';

  if (input.type === 'textarea') {
    return (
      <BaseInput
        id={input.id}
        label={input.label}
        required={input.required}
        helpText={input.helpText}
      >
        <textarea
          id={input.id}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={input.placeholder}
          required={input.required}
          rows={4}
          className={baseClass}
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
      <select
        id={input.id}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        required={input.required}
        className={`${baseClass} cursor-pointer`}
      >
        <option value="">Select an option</option>
        {input.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </BaseInput>
  );
};
