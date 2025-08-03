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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
        <div className="mb-6 text-gray-900 dark:text-gray-100 text-base">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            onClick={onCancel}
            data-testid="confirm-no"
            disabled={loading}
          >
            No
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
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
