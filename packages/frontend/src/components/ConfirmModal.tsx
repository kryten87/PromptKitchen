export interface ConfirmModalProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmModal({ open, message, onConfirm, onCancel, loading }: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
        <div className="mb-6 text-text-primary text-base">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-btn-subtle hover:bg-btn-subtle-hover text-text-secondary disabled:opacity-50"
            onClick={onCancel}
            data-testid="confirm-no"
            disabled={loading}
          >
            No
          </button>
          <button
            className="px-4 py-2 rounded bg-warning hover:opacity-90 text-white disabled:opacity-50"
            onClick={onConfirm}
            data-testid="confirm-yes"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Yes'}
          </button>
        </div>
      </div>
    </div>
  );
}
