import type { Prompt } from '@prompt-kitchen/shared/src/dtos';
import { useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';

interface EditPromptFormProps {
  prompt: Prompt;
  onPromptUpdated: (updatedPrompt: Prompt) => void;
  onViewHistory: () => void;
}

export function EditPromptForm({ prompt, onPromptUpdated, onViewHistory }: EditPromptFormProps) {
  const [promptText, setPromptText] = useState(prompt?.prompt || '');
  const [name, setName] = useState(prompt?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const apiClient = useApiClient();

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await apiClient.request<Prompt>(`/prompts/${prompt.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          prompt: promptText.trim(),
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      setSuccessMessage('Prompt saved successfully!');
      onPromptUpdated(updated);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError('Failed to save prompt');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = name.trim() !== prompt.name || promptText.trim() !== prompt.prompt;
  const canSave = hasChanges && name.trim() && promptText.trim();

  return (
    <div>
      <div className="mb-4">
        <div className="text-sm text-gray-500">
          Version {prompt.version} • Last updated: {new Date(prompt.updatedAt).toLocaleString()}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600 text-sm">{successMessage}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="prompt-name" className="block text-sm font-medium text-gray-700 mb-1">
            Prompt Name
          </label>
          <input
            id="prompt-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter prompt name"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="prompt-text" className="block text-sm font-medium text-gray-700 mb-1">
            Prompt Text
          </label>
          <textarea
            id="prompt-text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Enter your prompt here... Use {{variable}} syntax for templating"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Use <code className="bg-gray-100 px-1 rounded">{'{{variable}}'}</code> syntax for dynamic templating
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onViewHistory}
          className="px-4 py-2 text-sm font-medium text-text-secondary bg-btn-subtle border border-gray-300 rounded-md hover:bg-btn-subtle-hover focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          disabled={loading}
          data-testid="prompt-editor-view-history-button"
        >
          View History
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || loading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="prompt-editor-save-button"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}