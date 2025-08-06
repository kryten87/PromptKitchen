import type { Project, Prompt } from '@prompt-kitchen/shared/src/dtos';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';
import { CreatePromptForm } from '../components/CreatePromptForm';
import { PromptEditor } from '../components/PromptEditor';
import PromptHistoryModal from '../components/PromptHistoryModal';
import { TestSuitePanel } from '../components/TestSuitePanel';
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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

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

  const handleViewPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsCreating(false);
    setShowEditor(false);
  };

  const handleDeletePrompt = async (promptId: string) => {
    setConfirmModal({
      open: true,
      message: 'Are you sure you want to delete this prompt?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await apiClient.request(`/prompts/${promptId}`, { method: 'DELETE' });
          await loadProjectAndPrompts();
          if (selectedPrompt?.id === promptId) {
            setShowEditor(false);
            setSelectedPrompt(null);
          }
        } catch {
          setErrorAlert('Failed to delete prompt');
        }
      },
    });
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
      setErrorAlert('Failed to create prompt');
    }
  };

  const handlePromptUpdated = async (updatedPrompt: Prompt) => {
    await loadProjectAndPrompts();
    setSelectedPrompt(updatedPrompt);
  };

  const handlePromptRestored = async (restoredPrompt: Prompt) => {
    await loadProjectAndPrompts();
    setSelectedPrompt(restoredPrompt);
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
          className="bg-primary hover:opacity-90 text-white font-bold py-2 px-4 rounded"
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
                <li key={prompt.id} className="p-4 hover:bg-gray-50 flex flex-col h-full">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg break-words whitespace-pre-wrap">{prompt.name}</div>
                    <div className="text-gray-600 text-sm break-words whitespace-pre-wrap max-w-full">{prompt.prompt}</div>
                    <div className="text-xs text-gray-400 break-all">Prompt ID: {prompt.id}</div>
                    <div className="text-xs text-gray-400">
                      Last updated: {new Date(prompt.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 space-x-2">
                    <button
                      onClick={() => handleViewPrompt(prompt)}
                      className="px-3 py-1 text-sm bg-btn-subtle text-text-secondary rounded hover:bg-btn-subtle-hover"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditPrompt(prompt)}
                      className="px-3 py-1 text-sm bg-btn-subtle text-text-secondary rounded hover:bg-btn-subtle-hover"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="px-3 py-1 text-sm bg-warning text-white rounded hover:opacity-90"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(showEditor || (!showEditor && selectedPrompt)) && (
          <div>
            {showEditor && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {isCreating ? 'Create New Prompt' : 'Edit Prompt'}
                  </h3>
                  <button
                    onClick={handleCancelEditor}
                    className="px-3 py-1 text-sm bg-btn-subtle text-text-secondary rounded hover:bg-btn-subtle-hover"
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
                    onViewHistory={() => setShowHistoryModal(true)}
                  />
                )}
              </div>
            )}

            {!showEditor && selectedPrompt && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Selected Prompt: {selectedPrompt.name}</h3>
                  <button
                    onClick={() => handleEditPrompt(selectedPrompt)}
                    className="px-3 py-1 text-sm bg-primary text-white rounded hover:opacity-90"
                  >
                    Edit Prompt
                  </button>
                </div>
                <TestSuitePanel promptId={selectedPrompt.id} />
              </div>
            )}
          </div>
        )}
      </div>

      <PromptHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        prompt={selectedPrompt}
        onPromptRestored={handlePromptRestored}
      />

      {confirmModal && (
        <ConfirmModal
          open={confirmModal.open}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {errorAlert && (
        <ConfirmModal
          open={true}
          message={errorAlert}
          onConfirm={() => setErrorAlert(null)}
          onCancel={() => setErrorAlert(null)}
        />
      )}
    </div>
  );
}
