import type { Prompt } from '@prompt-kitchen/shared/src/dtos';
import { EditPromptForm } from './EditPromptForm';

export interface EditPromptModalProps {
  open: boolean;
  prompt: Prompt | null;
  onPromptUpdated: (updatedPrompt: Prompt) => void;
  onViewHistory: () => void;
  onCancel: () => void;
}

export function EditPromptModal({ open, prompt, onPromptUpdated, onViewHistory, onCancel }: EditPromptModalProps) {
  if (!open || !prompt) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" data-testid="edit-prompt-modal">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[600px] max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <h3 data-testid="edit-prompt-header" className="text-lg font-semibold">
            Edit Prompt
          </h3>
          <button
            data-testid="edit-prompt-cancel-button"
            onClick={onCancel}
            className="px-3 py-1 text-sm bg-btn-subtle text-text-secondary rounded hover:bg-btn-subtle-hover"
          >
            Cancel
          </button>
        </div>
        <EditPromptForm
          prompt={prompt}
          onPromptUpdated={onPromptUpdated}
          onViewHistory={onViewHistory}
        />
      </div>
    </div>
  );
}