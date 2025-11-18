import { useState } from 'react';
import type { ToolInput as ToolInputType } from '../../types/toolConfig';

interface Props {
  input: ToolInputType;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}

const ToolInput = ({ input, value, onChange }: Props) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (newValue: string | number | boolean) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const baseInputClass = "w-full bg-slate-800 text-slate-100 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all";
  const baseSelectClass = "w-full bg-slate-800 text-slate-100 border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all cursor-pointer";

  return (
    <div className="mb-4">
      <label htmlFor={input.id} className="block text-sm font-medium text-slate-300 mb-2">
        {input.label}
        {input.required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {input.type === 'text' && (
        <input
          id={input.id}
          type="text"
          value={localValue as string}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={input.placeholder}
          required={input.required}
          className={baseInputClass}
        />
      )}

      {input.type === 'number' && (
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
      )}

      {input.type === 'textarea' && (
        <textarea
          id={input.id}
          value={localValue as string}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={input.placeholder}
          required={input.required}
          rows={4}
          className={baseInputClass}
        />
      )}

      {input.type === 'select' && (
        <select
          id={input.id}
          value={localValue as string}
          onChange={(e) => handleChange(e.target.value)}
          required={input.required}
          className={baseSelectClass}
        >
          <option value="">Select an option</option>
          {input.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {input.type === 'slider' && (
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
            {localValue}
          </div>
        </div>
      )}

      {input.type === 'checkbox' && (
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
      )}

      {input.type === 'date' && (
        <input
          id={input.id}
          type="date"
          value={localValue as string}
          onChange={(e) => handleChange(e.target.value)}
          required={input.required}
          className={baseInputClass}
        />
      )}

      {input.type === 'color' && (
        <div className="flex items-center gap-3">
          <input
            id={input.id}
            type="color"
            value={localValue as string}
            onChange={(e) => handleChange(e.target.value)}
            className="h-10 w-20 bg-slate-800 border border-slate-600 rounded cursor-pointer"
          />
          <input
            type="text"
            value={localValue as string}
            onChange={(e) => handleChange(e.target.value)}
            className="flex-1 bg-slate-800 text-slate-100 border border-slate-600 rounded-lg px-4 py-2 font-mono text-sm"
          />
        </div>
      )}

      {input.helpText && input.type !== 'checkbox' && (
        <p className="mt-1 text-xs text-slate-400">{input.helpText}</p>
      )}
    </div>
  );
};

export default ToolInput;
