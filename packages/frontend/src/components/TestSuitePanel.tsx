import type { TestSuite } from '@prompt-kitchen/shared/src/dtos';
import { useCallback, useEffect, useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';
import { CreateTestSuiteModal } from './CreateTestSuiteModal';
import { EditTestSuiteModal } from './EditTestSuiteModal';

interface TestSuitePanelProps {
  promptId: string;
}

export function TestSuitePanel({ promptId }: TestSuitePanelProps) {
  const apiClient = useApiClient();
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTestSuite, setSelectedTestSuite] = useState<TestSuite | null>(null);

  const loadTestSuites = useCallback(async () => {
    setLoading(true);
    try {
      const suites = await apiClient.request<TestSuite[]>(`/prompts/${promptId}/test-suites`);
      setTestSuites(Array.isArray(suites) ? suites : []);
      setError(null);
    } catch {
      setError('Failed to load test suites');
    } finally {
      setLoading(false);
    }
  }, [promptId, apiClient]);

  useEffect(() => {
    loadTestSuites();
  }, [loadTestSuites]);

  const handleCreateTestSuite = (testSuite: TestSuite) => {
    setTestSuites(prev => [...prev, testSuite]);
  };

  const handleEditTestSuite = (testSuite: TestSuite) => {
    setSelectedTestSuite(testSuite);
    setShowEditModal(true);
  };

  const handleTestSuiteUpdated = (updatedTestSuite: TestSuite) => {
    setTestSuites(prev => prev.map(suite =>
      suite.id === updatedTestSuite.id ? updatedTestSuite : suite
    ));
  };

  const handleDeleteTestSuite = async (testSuiteId: string) => {
    if (window.confirm('Are you sure you want to delete this test suite? This will also delete all test cases within it.')) {
      try {
        await apiClient.request(`/test-suites/${testSuiteId}`, { method: 'DELETE' });
        setTestSuites(prev => prev.filter(suite => suite.id !== testSuiteId));
        // Clear any previous errors on successful delete
        setError(null);
      } catch {
        // Show error but don't replace the entire UI
        alert('Failed to delete test suite');
      }
    }
  };

  if (loading) {
    return <div className="p-4">Loading test suites...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Test Suites</h3>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
          onClick={() => setShowCreateModal(true)}
        >
          Create Test Suite
        </button>
      </div>

      {testSuites.length === 0 ? (
        <div className="text-gray-500 text-sm">No test suites found for this prompt.</div>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white rounded shadow">
          {testSuites.map((suite) => (
            <li key={suite.id} className="p-3 hover:bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{suite.name}</div>
                  <div className="text-xs text-gray-400">Suite ID: {suite.id}</div>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(suite.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex space-x-2 mt-2 md:mt-0">
                  <button
                    onClick={() => handleEditTestSuite(suite)}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTestSuite(suite.id)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement run test suite functionality
                      console.log('Run test suite:', suite.id);
                    }}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Run
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CreateTestSuiteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        promptId={promptId}
        onTestSuiteCreated={handleCreateTestSuite}
      />

      <EditTestSuiteModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        testSuite={selectedTestSuite}
        onTestSuiteUpdated={handleTestSuiteUpdated}
      />
    </div>
  );
}
