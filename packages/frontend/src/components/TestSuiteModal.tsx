import type { TestSuite } from '@prompt-kitchen/shared/src/dtos';
import { useEffect, useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';

interface TestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  testSuite?: TestSuite | null;
  promptId?: string;
  onTestSuiteCreated?: (testSuite: TestSuite) => void;
  onTestSuiteUpdated?: (testSuite: TestSuite) => void;
}

export function TestSuiteModal({ 
  isOpen, 
  onClose, 
  testSuite, 
  promptId, 
  onTestSuiteCreated, 
  onTestSuiteUpdated 
}: TestSuiteModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  const isEditMode = testSuite !== undefined;
  const title = isEditMode ? 'Edit Test Suite' : 'Create New Test Suite';
  const testIdPrefix = isEditMode ? 'edit-test-suite' : 'create-test-suite';
  const submitButtonText = isEditMode ? 'Save' : 'Create';
  const loadingText = isEditMode ? 'Saving...' : 'Creating...';
  const submitButtonClass = isEditMode 
    ? 'px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
    : 'px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50';

  useEffect(() => {
    if (isEditMode && testSuite) {
      setName(testSuite.name);
    } else if (!isEditMode) {
      setName('');
    }
  }, [testSuite, isEditMode]);

  if (!isOpen || (isEditMode && !testSuite)) {
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
      if (isEditMode && testSuite) {
        const updated = await apiClient.request<TestSuite>(`/test-suites/${testSuite.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name: name.trim() }),
        });
        onTestSuiteUpdated?.(updated);
      } else {
        const created = await apiClient.request<TestSuite>(`/prompts/${promptId}/test-suites`, {
          method: 'POST',
          body: JSON.stringify({ name: name.trim() }),
        });
        onTestSuiteCreated?.(created);
        setName('');
      }
      onClose();
    } catch {
      setError(isEditMode ? 'Failed to update test suite' : 'Failed to create test suite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" data-testid={`${testIdPrefix}-modal`}>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor={`${testIdPrefix}-name`} className="block text-gray-700 mb-2">Test Suite Name</label>
            <input
              id={`${testIdPrefix}-name`}
              data-testid={`${testIdPrefix}-name-input`}
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
              data-testid={`${testIdPrefix}-cancel-button`}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid={`${testIdPrefix}-submit-button`}
              className={submitButtonClass}
              disabled={!name.trim() || loading}
            >
              {loading ? loadingText : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}