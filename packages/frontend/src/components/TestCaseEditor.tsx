import type { JsonValue, TestCase, TestCaseRunMode } from '@prompt-kitchen/shared/src/dtos';
import { useEffect, useState } from 'react';
import { useApiClient } from '../hooks/useApiClient';
import { Assertion, AssertionsSection } from './AssertionsSection';

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
  const [assertions, setAssertions] = useState<Assertion[]>([]);
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
      setExpectedOutput(
        typeof testCase.expectedOutput === 'string'
          ? testCase.expectedOutput
          : JSON.stringify(testCase.expectedOutput, null, 2)
      );
      setAssertions(
        (testCase.assertions || []).map((a) => ({
          ...a,
          id: Math.random().toString(36).slice(2, 9),
        }))
      );
      setIsJsonOutput(typeof testCase.expectedOutput === 'object');

      // Set run mode
      setRunMode(testCase.runMode);
    }
  }, [testCase]);

  const validateInputs = () => {
    // Validate JSON output if enabled
    if (isJsonOutput && expectedOutput.trim()) {
      try {
        JSON.parse(expectedOutput);
      } catch {
        throw new Error('Invalid JSON in expected output');
      }
    }
  };

  // Helper function to convert string values to appropriate types
  const convertValue = (value: string): JsonValue => {
    const trimmed = value.trim();

    // Handle special values
    if (trimmed === 'null') return null;
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    // Try to parse as number
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed);
      if (!isNaN(num)) return num;
    }

    // Return as string
    return value;
  };

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
      validateInputs();

      // Convert string inputs to appropriate JsonValue types
      const jsonInputs: Record<string, JsonValue> = {};
      for (const [key, value] of Object.entries(inputs)) {
        jsonInputs[key] = convertValue(value);
      }

      const parsedExpectedOutput = isJsonOutput
        ? JSON.parse(expectedOutput)
        : expectedOutput;

      if (isEditing && testCase) {
        // Update existing test case
        const updated = await apiClient.request<TestCase>(`/test-cases/${testCase.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            inputs: jsonInputs,
            expectedOutput: parsedExpectedOutput,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            assertions: assertions.map(({ id, ...rest }) => rest),
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            assertions: assertions.map(({ id, ...rest }) => rest),
            runMode,
          }),
        });
        onTestCaseCreated?.(created);
      }
    } catch (e) {
      const error = e as Error;
      setError(error.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isValid = (Object.keys(inputs).length > 0 &&
                  Object.keys(inputs).every(key => key.trim() !== '')) &&
                  (expectedOutput.trim() !== '' || assertions.length > 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6" data-testid={isEditing ? "edit-test-case-panel" : "create-test-case-panel"}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold" data-testid={isEditing ? "edit-test-case-header" : "create-test-case-header"}>
          {isEditing ? 'Edit Test Case' : 'Create New Test Case'}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-btn-subtle text-text-primary rounded hover:bg-btn-subtle-hover disabled:opacity-50"
            disabled={loading}
            data-testid={isEditing ? "edit-test-case-cancel-button" : "create-test-case-cancel-button"}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="test-case-form"
            className="px-4 py-2 bg-primary text-white rounded hover:opacity-90 disabled:opacity-50"
            disabled={!isValid || loading}
            data-testid={isEditing ? "edit-test-case-update-button" : "create-test-case-submit-button"}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
          </button>
        </div>
      </div>

      <form id="test-case-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Input Variables Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Input Variables
            </label>
            <button
              type="button"
              onClick={addInputField}
              className="text-sm bg-btn-subtle text-text-primary px-2 py-1 rounded hover:bg-btn-subtle-hover"
              disabled={loading}
              data-testid="add-input-button"
            >
              Add Input
            </button>
          </div>

          <div className="space-y-2">
            {Object.entries(inputs).map(([key, value], index) => (
              <div key={`input-${index}`} className="flex gap-2 items-center" data-testid={`input-row-${index}`}>
                <input
                  type="text"
                  placeholder="Key"
                  value={key}
                  onChange={(e) => updateInputKey(key, e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  disabled={loading}
                  data-testid="input-variable-input"
                />
                <span className="text-gray-500">=</span>
                <input
                  type="text"
                  placeholder="Value"
                  value={value}
                  onChange={(e) => updateInputValue(key, e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  disabled={loading}
                  data-testid="input-value-input"
                />
                <button
                  type="button"
                  onClick={() => removeInput(key)}
                  className="text-warning hover:opacity-80 px-2"
                  disabled={loading}
                  data-testid="remove-input-button"
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
            data-testid="expected-output-input"
          />

          {isJsonOutput && (
            <div className="text-xs text-gray-500 mt-1">
              Enter valid JSON. The output will be parsed and compared using deep equality.
            </div>
          )}
        </div>

        {/* Assertions Section */}
        <AssertionsSection assertions={assertions} onChange={setAssertions} />

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
      </form>
    </div>
  );
}
