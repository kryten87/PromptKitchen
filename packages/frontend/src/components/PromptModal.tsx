import type { Prompt } from '@prompt-kitchen/shared/src/dtos';
import { PromptForm } from './PromptForm';

interface PromptModalProps {
  open: boolean;
  prompt?: Prompt | null;
  projectId?: string;
  onPromptCreated?: (newPrompt: Omit<Prompt, 'id' | 'version' | 'createdAt' | 'updatedAt'>) => void;
  onPromptUpdated?: (updatedPrompt: Prompt) => void;
  onViewHistory?: () => void;
  onCancel: () => void;
}

export function PromptModal({ 
  open, 
  prompt, 
  projectId, 
  onPromptCreated, 
  onPromptUpdated, 
  onViewHistory, 
  onCancel 
}: PromptModalProps) {
  const isEditMode = prompt !== undefined;
  const title = isEditMode ? 'Edit Prompt' : 'Create New Prompt';
  const testIdPrefix = isEditMode ? 'edit-prompt' : 'create-prompt';

  if (!open || (isEditMode && !prompt)) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" data-testid={`${testIdPrefix}-modal`}>
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[600px] max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <h3 data-testid={`${testIdPrefix}-header`} className="text-lg font-semibold">
            {title}
          </h3>
          <button
            data-testid={`${testIdPrefix}-cancel-button`}
            onClick={onCancel}
            className="px-3 py-1 text-sm bg-btn-subtle text-text-secondary rounded hover:bg-btn-subtle-hover"
          >
            Cancel
          </button>
        </div>
        <PromptForm
          prompt={prompt}
          projectId={projectId}
          onPromptCreated={onPromptCreated}
          onPromptUpdated={onPromptUpdated}
          onViewHistory={onViewHistory}
        />
      </div>
    </div>
  );
}