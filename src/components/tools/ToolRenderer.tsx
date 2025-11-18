import { useState, useCallback } from 'react';
import { Calculator, Sparkles, Zap } from 'lucide-react';
import type { ToolConfig, ToolState, ToolResult, ToolAction } from '../../types/toolConfig';
import ToolInput from './ToolInput';
import ToolOutput from './ToolOutput';

interface Props {
  config: ToolConfig;
}

const ToolRenderer = ({ config }: Props) => {
  const [state, setState] = useState<ToolState>(() => {
    const initialState: ToolState = {};
    config.sections.forEach((section) => {
      section.inputs?.forEach((input) => {
        initialState[input.id] = input.defaultValue ?? '';
      });
    });
    return initialState;
  });

  const [results, setResults] = useState<ToolResult>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((inputId: string, value: string | number | boolean) => {
    setState((prev) => ({ ...prev, [inputId]: value }));
    setError(null);
  }, []);

  const executeAction = useCallback(async (action: ToolAction) => {
    setIsCalculating(true);
    setError(null);

    try {
      // Create a safe execution context
      const context = {
        inputs: state,
        results: {},
        Math,
        Date,
        JSON,
        // Helper functions
        round: (num: number, decimals: number = 2) =>
          Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals),
        formatCurrency: (num: number) =>
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num),
        formatPercent: (num: number) => `${(num * 100).toFixed(2)}%`,
      };

      // Execute the logic safely
      const func = new Function('context', `
        with (context) {
          ${action.logic}
        }
      `);

      func(context);

      setResults(context.results);
    } catch (err) {
      console.error('Tool execution error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCalculating(false);
    }
  }, [state]);

  const getIcon = () => {
    switch (config.type) {
      case 'calculator':
        return <Calculator className="w-5 h-5" />;
      case 'generator':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const primaryColor = config.styling?.primaryColor || 'cyan';
  const layout = config.styling?.layout || 'single';

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r from-${primaryColor}-600 to-${primaryColor}-500 px-6 py-4`}>
        <div className="flex items-center gap-3">
          <div className="text-white">{getIcon()}</div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">{config.title}</h2>
            {config.description && (
              <p className="text-sm text-white/80 mt-1">{config.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`p-6 ${layout === 'split' ? 'grid grid-cols-2 gap-6' : layout === 'grid' ? 'grid grid-cols-3 gap-6' : ''}`}>
        {config.sections.map((section) => (
          <div key={section.id} className="space-y-4">
            {section.title && (
              <div className="border-b border-slate-700 pb-2">
                <h3 className="text-lg font-medium text-slate-200">{section.title}</h3>
                {section.description && (
                  <p className="text-sm text-slate-400 mt-1">{section.description}</p>
                )}
              </div>
            )}

            {/* Inputs */}
            {section.inputs && section.inputs.length > 0 && (
              <div className="space-y-3">
                {section.inputs.map((input) => {
                  const value = state[input.id];
                  const inputValue = Array.isArray(value) ? '' : (value ?? '');
                  return (
                    <ToolInput
                      key={input.id}
                      input={input}
                      value={inputValue as string | number | boolean}
                      onChange={(value) => handleInputChange(input.id, value)}
                    />
                  );
                })}
              </div>
            )}

            {/* Section Actions */}
            {section.actions && section.actions.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {section.actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => executeAction(action)}
                    disabled={isCalculating}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all
                      ${action.type === 'primary'
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                        : action.type === 'danger'
                        ? 'bg-red-600 hover:bg-red-500 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}
                      ${isCalculating ? 'opacity-50 cursor-not-allowed' : ''}
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {isCalculating && action.type === 'primary' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Calculating...
                      </div>
                    ) : (
                      action.label
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Outputs */}
            {section.outputs && section.outputs.length > 0 && (
              <div className="space-y-3 mt-6">
                {section.outputs.map((output) => (
                  <ToolOutput
                    key={output.id}
                    output={output}
                    value={results[output.id]}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Global Actions */}
      {config.globalActions && config.globalActions.length > 0 && (
        <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700">
          <div className="flex gap-2 flex-wrap justify-end">
            {config.globalActions.map((action) => (
              <button
                key={action.id}
                onClick={() => executeAction(action)}
                disabled={isCalculating}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${action.type === 'primary'
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}
                  ${isCalculating ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="px-6 py-3 bg-red-900/20 border-t border-red-800">
          <p className="text-sm text-red-400">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default ToolRenderer;
