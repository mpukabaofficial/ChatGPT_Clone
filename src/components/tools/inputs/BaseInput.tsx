import type { ReactNode } from 'react';

interface Props {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  children: ReactNode;
}

export const BaseInput = ({ id, label, required, helpText, children }: Props) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {helpText && (
        <p className="mt-1 text-xs text-slate-400">{helpText}</p>
      )}
    </div>
  );
};
