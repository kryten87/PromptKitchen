import type { TestSuite } from '@prompt-kitchen/shared/src/dtos';
import { useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';

interface CreateTestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptId: string;
  onTestSuiteCreated: (testSuite: TestSuite) => void;
}

export function CreateTestSuiteModal({ isOpen, onClose, promptId, onTestSuiteCreated }: CreateTestSuiteModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  if (!isOpen) {
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
      const testSuite = await apiClient.request<TestSuite>(`/prompts/${promptId}/test-suites`, {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() }),
      });

      onTestSuiteCreated(testSuite);
      setName('');
      onClose();
    } catch {
      setError('Failed to create test suite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Test Suite</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="test-suite-name" className="block text-gray-700 mb-2">Test Suite Name</label>
            <input
              id="test-suite-name"
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
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              disabled={!name.trim() || loading}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
