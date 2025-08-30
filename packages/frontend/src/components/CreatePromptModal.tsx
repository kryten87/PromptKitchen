import type { Prompt } from '@prompt-kitchen/shared/src/dtos';
import { CreatePromptForm } from './CreatePromptForm';

export interface CreatePromptModalProps {
  open: boolean;
  projectId: string;
  onPromptCreated: (newPrompt: Omit<Prompt, 'id' | 'version' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function CreatePromptModal({ open, projectId, onPromptCreated, onCancel }: CreatePromptModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" data-testid="create-prompt-modal">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[600px] max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <h3 data-testid="create-prompt-header" className="text-lg font-semibold">
            Create New Prompt
          </h3>
          <button
            data-testid="create-prompt-cancel-button"
            onClick={onCancel}
            className="px-3 py-1 text-sm bg-btn-subtle text-text-secondary rounded hover:bg-btn-subtle-hover"
          >
                Cancel
          </button>
        </div>
        <CreatePromptForm
          projectId={projectId}
          onPromptCreated={onPromptCreated}
        />
      </div>
    </div>
  );
}
