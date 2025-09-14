import type { Prompt } from '@prompt-kitchen/shared/src/dtos';
import type { Model } from '@prompt-kitchen/shared/src/dto/Model';
import { useState, useEffect } from 'react';
import { useApiClient } from '../hooks/useApiClient';

interface PromptFormProps {
  prompt?: Prompt | null;
  projectId?: string;
  onPromptCreated?: (prompt: Omit<Prompt, 'id' | 'version' | 'createdAt' | 'updatedAt'>) => void;
  onPromptUpdated?: (updatedPrompt: Prompt) => void;
  onViewHistory?: () => void;
}

export function PromptForm({ prompt, projectId, onPromptCreated, onPromptUpdated, onViewHistory }: PromptFormProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(prompt?.modelId ?? null);

  const apiClient = useApiClient();

   useEffect(() => {
     let isMounted = true;
     setModelsLoading(true);
     setModelsError(null);
     apiClient.getModels()
       .then((models) => {
         if (isMounted) {
           setModels(models);
           // If no modelId is set, default to first model
           setModelId(prev => prev ?? (models.length > 0 ? models[0].id : null));
         }
       })
       .catch(() => {
         if (isMounted) setModelsError('Failed to load models');
       })
       .finally(() => {
         if (isMounted) setModelsLoading(false);
       });
     return () => { isMounted = false; };
   }, [apiClient]);


  const isEditMode = prompt !== undefined;
  const [name, setName] = useState(prompt?.name || '');
  const [promptText, setPromptText] = useState(prompt?.prompt || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const testIdPrefix = isEditMode ? 'edit-prompt' : 'create-prompt';

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!name.trim() || !promptText.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

     try {
       if (isEditMode && prompt) {
         const updated = await apiClient.request<Prompt>(`/prompts/${prompt.id}`, {
           method: 'PUT',
           body: JSON.stringify({
             name: name.trim(),
             prompt: promptText.trim(),
             modelId: modelId ?? null,
           }),
           headers: { 'Content-Type': 'application/json' },
         });
 
         setSuccessMessage('Prompt saved successfully!');
         onPromptUpdated?.(updated);
 
         // Clear success message after 3 seconds
         setTimeout(() => setSuccessMessage(null), 3000);
       } else {
         await onPromptCreated?.({
           projectId: projectId!,
           name: name.trim(),
           prompt: promptText.trim(),
           modelId: modelId ?? null,
         });
         // Reset form
         setName('');
         setPromptText('');
         setModelId(models.length > 0 ? models[0].id : null);
       }
     } catch {
       setError(isEditMode ? 'Failed to save prompt' : 'Failed to create prompt');
     } finally {
       setLoading(false);
     }
   };


   const hasChanges = isEditMode ? (name.trim() !== prompt?.name || promptText.trim() !== prompt?.prompt || modelId !== prompt?.modelId) : true;
   const canSave = hasChanges && name.trim() && promptText.trim() && modelId;


  return (
    <div className={isEditMode ? '' : 'p-6 bg-white rounded-lg border border-gray-200 shadow-sm'}>
      {isEditMode && prompt && (
        <div className="mb-4">
          <div className="text-sm text-gray-500">
            Version {prompt.version} • Last updated: {new Date(prompt.updatedAt).toLocaleString()}
          </div>
        </div>
      )}

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

      <form onSubmit={handleSubmit} className="space-y-4">
         <div>
          <label htmlFor={`${testIdPrefix}-name`} className="block text-sm font-medium text-gray-700 mb-1">
            Prompt Name
          </label>
          <input
            id={`${testIdPrefix}-name`}
            data-testid={`${testIdPrefix}-name-input`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter prompt name"
            disabled={loading}
            required={!isEditMode}
          />
        </div>

        <div>
          <label htmlFor={`${testIdPrefix}-model`} className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <select
            id={`${testIdPrefix}-model`}
            data-testid={`${testIdPrefix}-model-select`}
            value={modelId ?? ''}
            onChange={e => setModelId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading || modelsLoading || models.length === 0}
            required
          >
            <option value="" disabled>Select a model</option>
            {models.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
          {modelsLoading && <div className="text-xs text-gray-400 mt-1">Loading models...</div>}
          {modelsError && <div className="text-xs text-red-500 mt-1">{modelsError}</div>}
        </div>


        <div>
          <label htmlFor={`${testIdPrefix}-text`} className="block text-sm font-medium text-gray-700 mb-1">
            Prompt Text
          </label>
          <textarea
            id={`${testIdPrefix}-text`}
            data-testid={`${testIdPrefix}-text-input`}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Enter your prompt here... Use {{variable}} syntax for templating"
            disabled={loading}
            required={!isEditMode}
          />
          <p className="mt-1 text-sm text-gray-500">
            Use <code className="bg-gray-100 px-1 rounded">{'{{variable}}'}</code> syntax for dynamic templating
          </p>
        </div>

        <div className={`flex ${isEditMode ? 'items-center justify-between' : 'justify-end'}`}>
          {isEditMode && onViewHistory && (
            <button
              type="button"
              onClick={onViewHistory}
              className="px-4 py-2 text-sm font-medium text-text-secondary bg-btn-subtle border border-gray-300 rounded-md hover:bg-btn-subtle-hover focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={loading}
              data-testid="prompt-editor-view-history-button"
            >
              View History
            </button>
          )}

          <button
            type={isEditMode ? 'button' : 'submit'}
            onClick={isEditMode ? () => handleSubmit() : undefined}
            data-testid={isEditMode ? 'prompt-editor-save-button' : `${testIdPrefix}-submit-button`}
            disabled={!canSave || loading}
            className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isEditMode 
                ? 'bg-primary hover:opacity-90 focus:ring-primary' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save' : 'Create Prompt')}
          </button>
        </div>
      </form>
    </div>
  );
}