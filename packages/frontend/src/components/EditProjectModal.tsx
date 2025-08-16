import type { Project } from '@prompt-kitchen/shared/src/dtos';
import { useEffect, useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onProjectUpdated: (project: Project) => void;
}

export function EditProjectModal({ isOpen, onClose, project, onProjectUpdated }: EditProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
    }
  }, [project]);

  if (!isOpen || !project) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updated = await apiClient.request<Project>(`/projects/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description }),
        headers: { 'Content-Type': 'application/json' },
      });
      onProjectUpdated(updated);
      onClose();
    } catch {
      setError('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="edit-project-name" className="block text-gray-700 mb-2">Project Name</label>
            <input
              id="edit-project-name"
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={loading}
              data-testid="edit-project-modal-name-input"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="edit-project-description" className="block text-gray-700 mb-2">Description</label>
            <textarea
              id="edit-project-description"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={loading}
              data-testid="edit-project-modal-description-input"
            />
          </div>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-btn-subtle hover:bg-btn-subtle-hover text-text-secondary"
              onClick={onClose}
              disabled={loading}
              data-testid="edit-project-modal-cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary hover:opacity-90 text-white"
              disabled={loading}
              data-testid="edit-project-modal-submit-button"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
