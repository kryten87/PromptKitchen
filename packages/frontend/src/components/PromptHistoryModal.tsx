import type { Prompt, PromptHistory } from '@prompt-kitchen/shared/src/dtos';
import { useEffect, useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';

interface PromptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onPromptRestored: (updatedPrompt: Prompt) => void;
}

export default function PromptHistoryModal({ isOpen, onClose, prompt, onPromptRestored }: PromptHistoryModalProps) {
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<number | null>(null);
  const apiClient = useApiClient();

  useEffect(() => {
    if (isOpen && prompt) {
      loadHistory();
    }
  }, [isOpen, prompt]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHistory = async () => {
    if (!prompt) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const historyData = await apiClient.request<PromptHistory[]>(`/prompts/${prompt.id}/history`);
      setHistory(historyData);
    } catch {
      setError('Failed to load prompt history');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: number) => {
    if (!prompt) {
      return;
    }

    setRestoring(version);
    setError(null);

    try {
      const restored = await apiClient.request<Prompt>(`/prompts/${prompt.id}/restore`, {
        method: 'POST',
        body: JSON.stringify({ version }),
        headers: { 'Content-Type': 'application/json' },
      });

      onPromptRestored(restored);
      onClose();
    } catch {
      setError('Failed to restore prompt from history');
    } finally {
      setRestoring(null);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Prompt History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading || restoring !== null}
          >
            ✕
          </button>
        </div>

        {prompt && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h3 className="font-semibold text-gray-900">{prompt.name}</h3>
            <p className="text-sm text-gray-600">Current Version: {prompt.version}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">No history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-gray-900">Version {entry.version}</span>
                      {entry.version === prompt?.version && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                      {entry.version !== prompt?.version && (
                        <button
                          onClick={() => handleRestore(entry.version)}
                          disabled={restoring !== null}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {restoring === entry.version ? 'Restoring...' : 'Restore'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-700 bg-gray-100 p-3 rounded font-mono whitespace-pre-wrap break-words">
                      {entry.prompt}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading || restoring !== null}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
