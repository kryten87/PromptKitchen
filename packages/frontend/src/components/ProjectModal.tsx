import type { Project } from '@prompt-kitchen/shared/src/dtos';
import { useEffect, useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onProjectCreated?: (project: Project) => void;
  onProjectUpdated?: (project: Project) => void;
}

export function ProjectModal({ isOpen, onClose, project, onProjectCreated, onProjectUpdated }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  const isEditMode = project !== undefined;
  const title = isEditMode ? 'Edit Project' : 'Create New Project';
  const submitButtonText = isEditMode ? 'Save' : 'Create';
  const loadingText = isEditMode ? 'Saving...' : 'Creating...';
  const testIdPrefix = isEditMode ? 'edit-project-modal' : 'create-project-modal';

  useEffect(() => {
    if (isEditMode && project) {
      setName(project.name);
      setDescription(project.description || '');
    } else if (!isEditMode) {
      setName('');
      setDescription('');
    }
  }, [project, isEditMode]);

  if (!isOpen || (isEditMode && !project)) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEditMode && project) {
        const updated = await apiClient.request<Project>(`/projects/${project.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name, description }),
          headers: { 'Content-Type': 'application/json' },
        });
        onProjectUpdated?.(updated);
      } else {
        const created = await apiClient.request<Project>('/projects', {
          method: 'POST',
          body: JSON.stringify({ name, description }),
          headers: { 'Content-Type': 'application/json' },
        });
        onProjectCreated?.(created);
        setName('');
        setDescription('');
      }
      onClose();
    } catch {
      setError(isEditMode ? 'Failed to update project' : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" data-testid={testIdPrefix}>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor={`${testIdPrefix}-name`} className="block text-gray-700 mb-2">Project Name</label>
            <input
              id={`${testIdPrefix}-name`}
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={loading}
              data-testid={`${testIdPrefix}-name-input`}
            />
          </div>
          <div className="mb-4">
            <label htmlFor={`${testIdPrefix}-description`} className="block text-gray-700 mb-2">Description</label>
            <textarea
              id={`${testIdPrefix}-description`}
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={loading}
              data-testid={`${testIdPrefix}-description-input`}
            />
          </div>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-btn-subtle hover:bg-btn-subtle-hover text-text-secondary"
              onClick={onClose}
              disabled={loading}
              data-testid={`${testIdPrefix}-cancel-button`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary hover:opacity-90 text-white"
              disabled={loading}
              data-testid={`${testIdPrefix}-submit-button`}
            >
              {loading ? loadingText : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}