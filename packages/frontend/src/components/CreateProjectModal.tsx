import type { Project } from '@prompt-kitchen/shared/src/dtos';
import { useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const project = await apiClient.request<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
        headers: { 'Content-Type': 'application/json' },
      });
      onProjectCreated(project);
      setName('');
      setDescription('');
      onClose();
    } catch {
      setError('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" data-testid="create-project-modal">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="project-name" className="block text-gray-700 mb-2">Project Name</label>
            <input
              id="project-name"
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={loading}
              data-testid="create-project-modal-name-input"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="project-description" className="block text-gray-700 mb-2">Description</label>
            <textarea
              id="project-description"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={loading}
              data-testid="create-project-modal-description-input"
            />
          </div>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-btn-subtle hover:bg-btn-subtle-hover text-text-secondary"
              onClick={onClose}
              disabled={loading}
              data-testid="create-project-modal-cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary hover:opacity-90 text-white"
              disabled={loading}
              data-testid="create-project-modal-submit-button"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
