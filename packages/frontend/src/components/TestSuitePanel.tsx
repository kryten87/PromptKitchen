import type { TestCase, TestSuite } from '@prompt-kitchen/shared/src/dtos';
import { useCallback, useEffect, useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';
import { useTestSuiteRunPolling } from '../hooks/useTestSuiteRunPolling';
import { CreateTestSuiteModal } from './CreateTestSuiteModal';
import { EditTestSuiteModal } from './EditTestSuiteModal';
import { TestCaseEditor } from './TestCaseEditor';
import { TestResultsView } from './TestResultsView';

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

  // Test case management state
  const [selectedTestSuiteForCases, setSelectedTestSuiteForCases] = useState<TestSuite | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loadingTestCases, setLoadingTestCases] = useState(false);
  const [testCasesError, setTestCasesError] = useState<string | null>(null);
  const [showTestCaseEditor, setShowTestCaseEditor] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);

  // Test suite execution state
  const [runningTestSuites, setRunningTestSuites] = useState<Set<string>>(new Set());
  const [runResults, setRunResults] = useState<Record<string, string>>({}); // testSuiteId -> message
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

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

  const loadTestCases = useCallback(async (testSuiteId: string) => {
    setLoadingTestCases(true);
    setTestCasesError(null);
    try {
      const cases = await apiClient.request<TestCase[]>(`/test-suites/${testSuiteId}/test-cases`);
      setTestCases(Array.isArray(cases) ? cases : []);
    } catch {
      setTestCasesError('Failed to load test cases');
    } finally {
      setLoadingTestCases(false);
    }
  }, [apiClient]);

  useEffect(() => {
    loadTestSuites();
  }, [loadTestSuites]);

  useEffect(() => {
    if (selectedTestSuiteForCases) {
      loadTestCases(selectedTestSuiteForCases.id);
    }
  }, [selectedTestSuiteForCases, loadTestCases]);

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
        // Clear test case view if we're viewing the deleted suite
        if (selectedTestSuiteForCases?.id === testSuiteId) {
          setSelectedTestSuiteForCases(null);
          setTestCases([]);
        }
        setError(null);
      } catch {
        alert('Failed to delete test suite');
      }
    }
  };

  const handleViewTestCases = (testSuite: TestSuite) => {
    setSelectedTestSuiteForCases(testSuite);
  };

  const handleCreateTestCase = () => {
    setEditingTestCase(null);
    setShowTestCaseEditor(true);
  };

  const handleEditTestCase = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setShowTestCaseEditor(true);
  };

  const handleDeleteTestCase = async (testCaseId: string) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      try {
        await apiClient.request(`/test-cases/${testCaseId}`, { method: 'DELETE' });
        setTestCases(prev => prev.filter(tc => tc.id !== testCaseId));
      } catch {
        alert('Failed to delete test case');
      }
    }
  };

  const handleTestCaseCreated = (testCase: TestCase) => {
    setTestCases(prev => [...prev, testCase]);
    setShowTestCaseEditor(false);
  };

  const handleTestCaseUpdated = (updatedTestCase: TestCase) => {
    setTestCases(prev => prev.map(tc =>
      tc.id === updatedTestCase.id ? updatedTestCase : tc
    ));
    setShowTestCaseEditor(false);
  };

  const handleRunTestSuite = async (testSuiteId: string) => {
    setRunningTestSuites(prev => new Set(prev).add(testSuiteId));
    setRunResults(prev => ({ ...prev, [testSuiteId]: '' }));
    try {
      const response = await apiClient.request<{ runId: string }>(`/test-suites/${testSuiteId}/run`, {
        method: 'POST',
      });
      setRunResults(prev => ({
        ...prev,
        [testSuiteId]: `Test suite execution started. Run ID: ${response.runId}`
      }));
      setActiveRunId(response.runId);
      setShowResultsModal(true);
    } catch (error) {
      setRunResults(prev => ({
        ...prev,
        [testSuiteId]: `Failed to start test suite execution: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    } finally {
      setRunningTestSuites(prev => {
        const newSet = new Set(prev);
        newSet.delete(testSuiteId);
        return newSet;
      });
    }
  };

  const handleCancelTestCaseEditor = () => {
    setShowTestCaseEditor(false);
    setEditingTestCase(null);
  };

  // Poll for run results if a run is active
  const { run: runData, loading: polling, error: pollingError } = useTestSuiteRunPolling(activeRunId, 2000);

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
        <>
          <ul className="divide-y divide-gray-200 bg-white rounded shadow mb-6">
            {testSuites.map((suite) => (
              <li key={suite.id} className="p-3 hover:bg-gray-50 flex flex-col h-full">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm break-words whitespace-pre-wrap">{suite.name}</div>
                  <div className="text-xs text-gray-400 break-all">Suite ID: {suite.id}</div>
                  <div className="text-xs text-gray-400">Created: {new Date(suite.createdAt).toLocaleString()}</div>
                  {runResults[suite.id] && (
                    <div className={`text-xs mt-1 ${runResults[suite.id].includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>{runResults[suite.id]}</div>
                  )}
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => handleViewTestCases(suite)}
                    className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    Test Cases
                  </button>
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
                    onClick={() => handleRunTestSuite(suite.id)}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    disabled={runningTestSuites.has(suite.id)}
                  >
                    {runningTestSuites.has(suite.id) ? 'Running...' : 'Run'}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Test Cases Section */}
          {selectedTestSuiteForCases && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold">
                  Test Cases for "{selectedTestSuiteForCases.name}"
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTestCase}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Add Test Case
                  </button>
                  <button
                    onClick={() => setSelectedTestSuiteForCases(null)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>

              {showTestCaseEditor && (
                <div className="mb-4">
                  <TestCaseEditor
                    testSuiteId={selectedTestSuiteForCases.id}
                    testCase={editingTestCase}
                    onTestCaseCreated={handleTestCaseCreated}
                    onTestCaseUpdated={handleTestCaseUpdated}
                    onCancel={handleCancelTestCaseEditor}
                  />
                </div>
              )}

              {loadingTestCases ? (
                <div className="text-gray-500 text-sm">Loading test cases...</div>
              ) : testCasesError ? (
                <div className="text-red-500 text-sm">{testCasesError}</div>
              ) : testCases.length === 0 ? (
                <div className="text-gray-500 text-sm">No test cases found for this test suite.</div>
              ) : (
                <ul className="divide-y divide-gray-200 bg-white rounded shadow">
                  {testCases.map((testCase) => (
                    <li key={testCase.id} className="p-3 hover:bg-gray-50 flex flex-col h-full">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium break-words whitespace-pre-wrap">Test Case {testCase.id}</div>
                        <div className="text-xs text-gray-500">Mode: <span className="font-mono">{testCase.runMode}</span></div>
                        <div className="text-xs">
                          <div className="mb-1"><strong>Inputs:</strong> {JSON.stringify(testCase.inputs)}</div>
                          <div><strong>Expected:</strong> {typeof testCase.expectedOutput === 'string' ? testCase.expectedOutput : JSON.stringify(testCase.expectedOutput)}</div>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4 space-x-2">
                        <button
                          onClick={() => handleEditTestCase(testCase)}
                          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTestCase(testCase.id)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      {/* Results Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => { setShowResultsModal(false); setActiveRunId(null); }}
              aria-label="Close"
            >
              ×
            </button>
            <h4 className="text-lg font-semibold mb-2">Test Suite Results</h4>
            {polling && <div className="text-gray-500 mb-2">Polling for results...</div>}
            {pollingError && <div className="text-red-500 mb-2">{pollingError}</div>}
            {runData && (
              <div>
                <div className="mb-2 text-sm">Status: <span className="font-mono">{runData.status}</span> | Pass %: {runData.passPercentage?.toFixed(1) ?? 0}</div>
                <TestResultsView
                  results={runData.results.map(r => ({
                    id: r.id,
                    testCaseName: r.testCaseId, // No name, so use ID
                    status: r.status.toLowerCase() === 'pass' ? 'pass' : 'fail',
                    actualOutput: typeof r.output === 'string' ? r.output : JSON.stringify(r.output)
                  }))}
                />
                {runData.status !== 'COMPLETED' && (
                  <div className="mt-2 text-xs text-gray-500">Still running... results will update automatically.</div>
                )}
              </div>
            )}
          </div>
        </div>
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
