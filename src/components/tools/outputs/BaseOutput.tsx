import { Check, Copy } from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface Props {
  label?: string;
  value: string | number | boolean | object | Array<string | number | object>;
  copyable?: boolean;
  children: ReactNode;
}

export const BaseOutput = ({ label, value, copyable, children }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    navigator.clipboard.writeText(textValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-4">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-300">{label}</label>
          {copyable && value && (
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
        {children}
      </div>
    </div>
  );
};
