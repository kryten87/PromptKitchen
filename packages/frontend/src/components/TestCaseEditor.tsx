import type { JsonValue, TestCase, TestCaseRunMode } from '@prompt-kitchen/shared/src/dtos';
import { useEffect, useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';

interface TestCaseEditorProps {
  testSuiteId: string;
  testCase?: TestCase | null;
  onTestCaseCreated?: (testCase: TestCase) => void;
  onTestCaseUpdated?: (testCase: TestCase) => void;
  onCancel: () => void;
}

export function TestCaseEditor({
  testSuiteId,
  testCase,
  onTestCaseCreated,
  onTestCaseUpdated,
  onCancel
}: TestCaseEditorProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [expectedOutput, setExpectedOutput] = useState('');
  const [isJsonOutput, setIsJsonOutput] = useState(false);
  const [runMode, setRunMode] = useState<TestCaseRunMode>('DEFAULT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiClient = useApiClient();

  const isEditing = !!testCase;

  useEffect(() => {
    if (testCase) {
      // Convert inputs to string values for form inputs
      const stringInputs: Record<string, string> = {};
      for (const [key, value] of Object.entries(testCase.inputs)) {
        stringInputs[key] = String(value);
      }
      setInputs(stringInputs);

      // Set expected output
      if (typeof testCase.expectedOutput === 'string') {
        setExpectedOutput(testCase.expectedOutput);
        setIsJsonOutput(false);
      } else {
        setExpectedOutput(JSON.stringify(testCase.expectedOutput, null, 2));
        setIsJsonOutput(true);
      }

      setRunMode(testCase.runMode);
    } else {
      // Reset for new test case
      setInputs({});
      setExpectedOutput('');
      setIsJsonOutput(false);
      setRunMode('DEFAULT');
    }
  }, [testCase]);

  const addInputField = () => {
    const newKey = `input${Object.keys(inputs).length + 1}`;
    setInputs(prev => ({ ...prev, [newKey]: '' }));
  };

  const updateInputKey = (oldKey: string, newKey: string) => {
    setInputs(prev => {
      const updated = { ...prev };
      // Always allow the key change, even if it's empty or duplicate
      // The validation will happen when submitting
      updated[newKey] = updated[oldKey];
      if (oldKey !== newKey) {
        delete updated[oldKey];
      }
      return updated;
    });
  };

  const updateInputValue = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const removeInput = (key: string) => {
    setInputs(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert string inputs back to JsonValue
      const jsonInputs: Record<string, JsonValue> = {};
      for (const [key, value] of Object.entries(inputs)) {
        // Try to parse as JSON first, fall back to string
        try {
          jsonInputs[key] = JSON.parse(value);
        } catch {
          jsonInputs[key] = value;
        }
      }

      // Parse expected output
      let parsedExpectedOutput: string | Record<string, JsonValue>;
      if (isJsonOutput) {
        try {
          parsedExpectedOutput = JSON.parse(expectedOutput);
        } catch {
          throw new Error('Invalid JSON in expected output');
        }
      } else {
        parsedExpectedOutput = expectedOutput;
      }

      if (isEditing && testCase) {
        // Update existing test case
        const updated = await apiClient.request<TestCase>(`/test-cases/${testCase.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            inputs: jsonInputs,
            expectedOutput: parsedExpectedOutput,
            runMode,
          }),
        });
        onTestCaseUpdated?.(updated);
      } else {
        // Create new test case
        const created = await apiClient.request<TestCase>(`/test-suites/${testSuiteId}/test-cases`, {
          method: 'POST',
          body: JSON.stringify({
            inputs: jsonInputs,
            expectedOutput: parsedExpectedOutput,
            runMode,
          }),
        });
        onTestCaseCreated?.(created);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save test case';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isValid = Object.keys(inputs).length > 0 &&
                  Object.keys(inputs).every(key => key.trim() !== '') &&
                  expectedOutput.trim() !== '';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {isEditing ? 'Edit Test Case' : 'Create New Test Case'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          disabled={loading}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Variables Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Input Variables
            </label>
            <button
              type="button"
              onClick={addInputField}
              className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              disabled={loading}
            >
              Add Input
            </button>
          </div>

          <div className="space-y-2">
            {Object.entries(inputs).map(([key, value], index) => (
              <div key={`input-${index}`} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Key"
                  value={key}
                  onChange={(e) => updateInputKey(key, e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  disabled={loading}
                />
                <span className="text-gray-500">=</span>
                <input
                  type="text"
                  placeholder="Value"
                  value={value}
                  onChange={(e) => updateInputValue(key, e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => removeInput(key)}
                  className="text-red-500 hover:text-red-700 px-2"
                  disabled={loading}
                >
                  ✕
                </button>
              </div>
            ))}

            {Object.keys(inputs).length === 0 && (
              <div className="text-gray-500 text-sm py-2">
                No input variables defined
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 mt-1">
            Input values will be automatically converted to appropriate types (strings, numbers, booleans, null).
          </div>
        </div>

        {/* Expected Output Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Expected Output
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={isJsonOutput}
                onChange={(e) => setIsJsonOutput(e.target.checked)}
                className="form-checkbox"
                disabled={loading}
              />
              <span className="ml-2 text-sm">JSON Output</span>
            </label>
          </div>

          <textarea
            value={expectedOutput}
            onChange={(e) => setExpectedOutput(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            rows={isJsonOutput ? 6 : 3}
            placeholder={isJsonOutput ? 'Enter expected JSON output...' : 'Enter expected string output...'}
            disabled={loading}
          />

          {isJsonOutput && (
            <div className="text-xs text-gray-500 mt-1">
              Enter valid JSON. The output will be parsed and compared using deep equality.
            </div>
          )}
        </div>

        {/* Run Mode Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Run Mode
          </label>

          <div className="space-y-1">
            {(['DEFAULT', 'SKIP', 'ONLY'] as TestCaseRunMode[]).map((mode) => (
              <label key={mode} className="inline-flex items-center">
                <input
                  type="radio"
                  value={mode}
                  checked={runMode === mode}
                  onChange={(e) => setRunMode(e.target.value as TestCaseRunMode)}
                  className="form-radio"
                  disabled={loading}
                />
                <span className="ml-2 text-sm">{mode}</span>
              </label>
            ))}
          </div>

          <div className="text-xs text-gray-500 mt-1">
            DEFAULT: Run normally. SKIP: Don't run this test. ONLY: Run only tests marked as ONLY.
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={!isValid || loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
}
