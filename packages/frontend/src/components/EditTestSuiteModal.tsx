import type { TestSuite } from '@prompt-kitchen/shared/src/dtos';
import { useEffect, useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';

interface EditTestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  testSuite: TestSuite | null;
  onTestSuiteUpdated: (testSuite: TestSuite) => void;
}

export function EditTestSuiteModal({ isOpen, onClose, testSuite, onTestSuiteUpdated }: EditTestSuiteModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  useEffect(() => {
    if (testSuite) {
      setName(testSuite.name);
    }
  }, [testSuite]);

  if (!isOpen || !testSuite) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updated = await apiClient.request<TestSuite>(`/test-suites/${testSuite.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: name.trim() }),
      });

      onTestSuiteUpdated(updated);
      onClose();
    } catch {
      setError('Failed to update test suite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" data-testid="edit-test-suite-modal">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Test Suite</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="edit-test-suite-name" className="block text-gray-700 mb-2">Test Suite Name</label>
            <input
              id="edit-test-suite-name"
              data-testid="edit-test-suite-name-input"
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter test suite name"
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              data-testid="edit-test-suite-cancel-button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="edit-test-suite-submit-button"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={!name.trim() || loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
