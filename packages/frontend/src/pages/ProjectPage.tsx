import type { Project, Prompt } from '@prompt-kitchen/shared/src/dtos';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CreatePromptForm } from '../components/CreatePromptForm';
import { PromptEditor } from '../components/PromptEditor';
import { useApiClient } from '../hooks/useApiClient';

export function ProjectPage() {
  const { projectId } = useParams();
  const apiClient = useApiClient();
  const [project, setProject] = useState<Project | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const loadProjectAndPrompts = useCallback(async () => {
    if (!projectId) {
      return;
    }
    setLoading(true);
    try {
      const [proj, promptList] = await Promise.all([
        apiClient.request<Project>(`/projects/${projectId}`),
        apiClient.request<Prompt[]>(`/projects/${projectId}/prompts`),
      ]);
      setProject(proj);
      setPrompts(Array.isArray(promptList) ? promptList : []);
      setError(null);
    } catch {
      setError('Failed to load project or prompts');
    } finally {
      setLoading(false);
    }
  }, [projectId, apiClient]);

  useEffect(() => {
    loadProjectAndPrompts();
  }, [loadProjectAndPrompts]);

  const handleCreateNewPrompt = () => {
    setSelectedPrompt(null);
    setIsCreating(true);
    setShowEditor(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsCreating(false);
    setShowEditor(true);
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await apiClient.request(`/prompts/${promptId}`, { method: 'DELETE' });
        await loadProjectAndPrompts();
        // Hide editor if we're editing the deleted prompt
        if (selectedPrompt?.id === promptId) {
          setShowEditor(false);
          setSelectedPrompt(null);
        }
      } catch {
        alert('Failed to delete prompt');
      }
    }
  };

  const handlePromptCreated = async (newPrompt: Omit<Prompt, 'id' | 'version' | 'createdAt' | 'updatedAt'>) => {
    if (!projectId) {
      return;
    }
    try {
      const created = await apiClient.request<Prompt>(`/projects/${projectId}/prompts`, {
        method: 'POST',
        body: JSON.stringify(newPrompt),
        headers: { 'Content-Type': 'application/json' },
      });
      await loadProjectAndPrompts();
      setSelectedPrompt(created);
      setIsCreating(false);
    } catch {
      alert('Failed to create prompt');
    }
  };

  const handlePromptUpdated = async (updatedPrompt: Prompt) => {
    await loadProjectAndPrompts();
    setSelectedPrompt(updatedPrompt);
  };

  const handleCancelEditor = () => {
    setShowEditor(false);
    setSelectedPrompt(null);
    setIsCreating(false);
  };

  if (loading) return <div className="p-4">Loading project...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!project) return <div className="p-4">Project not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
      <p className="mb-4 text-gray-700">{project.description || 'No description'}</p>
      <div className="text-gray-500">Project ID: {project.id}</div>
      <div className="text-gray-500">Created: {new Date(project.createdAt).toLocaleString()}</div>
      <div className="text-gray-500 mb-6">Last Updated: {new Date(project.updatedAt).toLocaleString()}</div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Prompts</h2>
        <button
          onClick={handleCreateNewPrompt}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Prompt
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {prompts.length === 0 ? (
            <div className="text-gray-500">No prompts found for this project.</div>
          ) : (
            <ul className="divide-y divide-gray-200 bg-white rounded shadow">
              {prompts.map((prompt) => (
                <li key={prompt.id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-lg">{prompt.name}</div>
                      <div className="text-gray-600 text-sm truncate max-w-xl">{prompt.prompt}</div>
                      <div className="text-xs text-gray-400">Prompt ID: {prompt.id}</div>
                      <div className="text-xs text-gray-400">
                        Last updated: {new Date(prompt.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-2 md:mt-0">
                      <button
                        onClick={() => handleEditPrompt(prompt)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {showEditor && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {isCreating ? 'Create New Prompt' : 'Edit Prompt'}
                </h3>
                <button
                  onClick={handleCancelEditor}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>

              {isCreating ? (
                <CreatePromptForm
                  projectId={projectId!}
                  onPromptCreated={handlePromptCreated}
                />
              ) : (
                <PromptEditor
                  prompt={selectedPrompt}
                  onPromptUpdated={handlePromptUpdated}
                  onViewHistory={() => {
                    // TODO: Implement history modal in next task
                    alert('History modal will be implemented in task 3.4.4');
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
