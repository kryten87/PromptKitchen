import type { Prompt } from '@prompt-kitchen/shared/src/dtos';
import { useState } from 'react';

interface CreatePromptFormProps {
  projectId: string;
  onPromptCreated: (prompt: Omit<Prompt, 'id' | 'version' | 'createdAt' | 'updatedAt'>) => void;
}

export function CreatePromptForm({ projectId, onPromptCreated }: CreatePromptFormProps) {
  const [name, setName] = useState('');
  const [promptText, setPromptText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !promptText.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onPromptCreated({
        projectId,
        name: name.trim(),
        prompt: promptText.trim(),
      });
      // Reset form
      setName('');
      setPromptText('');
    } catch {
      setError('Failed to create prompt');
    } finally {
      setLoading(false);
    }
  };

  const canSave = name.trim() && promptText.trim();

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="create-prompt-name" className="block text-sm font-medium text-gray-700 mb-1">
            Prompt Name
          </label>
          <input
            id="create-prompt-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter prompt name"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="create-prompt-text" className="block text-sm font-medium text-gray-700 mb-1">
            Prompt Text
          </label>
          <textarea
            id="create-prompt-text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Enter your prompt here... Use {{variable}} syntax for templating"
            disabled={loading}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Use <code className="bg-gray-100 px-1 rounded">{'{{variable}}'}</code> syntax for dynamic templating
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!canSave || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Prompt'}
          </button>
        </div>
      </form>
    </div>
  );
}
