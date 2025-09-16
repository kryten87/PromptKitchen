import type { Project, Prompt } from '@prompt-kitchen/shared/src/dtos';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';
import { PromptModal } from '../components/PromptModal';
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
  const [showEditPromptModal, setShowEditPromptModal] = useState(false);
  const [showCreatePromptModal, setShowCreatePromptModal] = useState(false);
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
    setShowCreatePromptModal(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowEditPromptModal(true);
  };

  const handleViewPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowEditPromptModal(false);
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
            setShowEditPromptModal(false);
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
      await apiClient.request<Prompt>(`/projects/${projectId}/prompts`, {
        method: 'POST',
        body: JSON.stringify(newPrompt),
        headers: { 'Content-Type': 'application/json' },
      });
      await loadProjectAndPrompts();
      setShowCreatePromptModal(false);
      setSelectedPrompt(null);
    } catch {
      setErrorAlert('Failed to create prompt');
    }
  };

  const handlePromptUpdated = async (updatedPrompt: Prompt) => {
    await loadProjectAndPrompts();
    setSelectedPrompt(updatedPrompt);
    setShowEditPromptModal(false);
  };

  const handlePromptRestored = async (restoredPrompt: Prompt) => {
    await loadProjectAndPrompts();
    setSelectedPrompt(restoredPrompt);
  };

  const handleCancelEditor = () => {
    setShowEditPromptModal(false);
    setSelectedPrompt(null);
  };

  if (loading) return <div className="p-4">Loading project...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!project) return <div className="p-4">Project not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 data-testid="project-name" className="text-2xl font-bold mb-2">{project.name}</h1>
      <p data-testid="project-description" className="mb-4 text-gray-700">{project.description || 'No description'}</p>
      <div className="text-gray-500">Project ID: {project.id}</div>
      <div className="text-gray-500">Created: {new Date(project.createdAt).toLocaleString()}</div>
      <div className="text-gray-500 mb-6">Last Updated: {new Date(project.updatedAt).toLocaleString()}</div>

      <div className="flex justify-between items-center mb-4">
        <h2 data-testid="prompts-header" className="text-xl font-semibold">Prompts</h2>
        <button
          data-testid="create-new-prompt-button"
          onClick={handleCreateNewPrompt}
          className="bg-primary hover:opacity-90 text-white py-2 px-4 rounded"
        >
          Create New Prompt
        </button>
      </div>

      {prompts.length === 0 ? (
        <div data-testid="no-prompts-message" className="text-gray-500 mb-6">No prompts found for this project.</div>
      ) : (
        <div className="mb-6">
          <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow">
            {prompts.map((prompt) => (
              <li
                key={prompt.id}
                className="p-4 hover:bg-gray-50 flex items-center justify-between"
                data-testid={`prompt-list-item-${prompt.id}`}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 data-testid={`prompt-name-${prompt.id}`} className="text-lg font-semibold text-gray-900 truncate">
                      {prompt.name}
                    </h3>
                    <div className="text-xs text-gray-400 ml-4 flex-shrink-0">
                      Last updated: {new Date(prompt.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 break-words whitespace-pre-wrap line-clamp-2">
                    {prompt.prompt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                     Prompt ID: {prompt.id}
                    {prompt.modelName && (
                      <>
                        <span className="mx-1">•</span>
                        <span data-testid={`prompt-model-name-${prompt.id}`}>{prompt.modelName}</span>
                        {prompt.isModelActive === false && (
                          <span
                            className="ml-1 text-yellow-500 cursor-help"
                            title="Model is no longer available"
                            data-testid={`prompt-model-inactive-${prompt.id}`}
                          >
                             ⚠️
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleViewPrompt(prompt)}
                    className="px-3 py-1 text-sm bg-btn-subtle text-text-secondary rounded hover:bg-btn-subtle-hover"
                    data-testid={`view-prompt-button-${prompt.id}`}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditPrompt(prompt)}
                    className="px-3 py-1 text-sm bg-btn-subtle text-text-secondary rounded hover:bg-btn-subtle-hover"
                    data-testid={`edit-prompt-button-${prompt.id}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePrompt(prompt.id)}
                    className="px-3 py-1 text-sm bg-warning text-white rounded hover:opacity-90"
                    data-testid={`delete-prompt-button-${prompt.id}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedPrompt && !showEditPromptModal && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 data-testid="selected-prompt-header" className="text-lg font-semibold">Selected Prompt: {selectedPrompt.name}</h3>
            <button
              onClick={() => setSelectedPrompt(null)}
              className="px-3 py-1 text-sm bg-btn-subtle text-text-secondary rounded hover:bg-btn-subtle-hover"
            >
              Close
            </button>
          </div>
          <TestSuitePanel promptId={selectedPrompt.id} />
        </div>
      )}

      <PromptModal
        open={showEditPromptModal}
        prompt={selectedPrompt}
        onPromptUpdated={handlePromptUpdated}
        onViewHistory={() => setShowHistoryModal(true)}
        onCancel={handleCancelEditor}
      />

      <PromptModal
        open={showCreatePromptModal}
        projectId={projectId!}
        onPromptCreated={handlePromptCreated}
        onCancel={() => setShowCreatePromptModal(false)}
      />

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
