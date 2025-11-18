import { X } from 'lucide-react';
import type { MaximizedEmbed } from '../hooks/useAppState';

interface Props {
  maximizedEmbed: MaximizedEmbed;
  onClose: () => void;
}

export function MaximizedEmbedModal({ maximizedEmbed, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full h-full max-w-7xl max-h-full overflow-auto p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg shadow-md transition-colors"
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="bg-slate-900 rounded-xl shadow-md h-full flex flex-col">
          {maximizedEmbed.description && (
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-medium text-gray-200">{maximizedEmbed.description}</h2>
            </div>
          )}

          <div className="flex-1 p-4 bg-slate-800">
            <div className="relative w-full h-full min-h-[400px]">
              {maximizedEmbed.description === 'Tool Output' ? (
                <iframe
                  srcDoc={maximizedEmbed.content}
                  sandbox="allow-scripts"
                  className="absolute inset-0 w-full h-full rounded-lg"
                  title="Tool Output"
                />
              ) : (
                <iframe
                  src={maximizedEmbed.content}
                  sandbox="allow-same-origin allow-scripts allow-popups"
                  className="absolute inset-0 w-full h-full rounded-lg"
                  title={maximizedEmbed.description || 'Maximized content'}
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
