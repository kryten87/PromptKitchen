/**
 * @jest-environment jsdom
 */
import type { TestCase, TestSuite } from '@prompt-kitchen/shared/src/dtos';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiClient } from '../ApiClient';
import { TestSuitePanel } from './TestSuitePanel';

// Mock the useApiClient hook
jest.mock('../hooks/useApiClient', () => ({
  useApiClient: () => mockApiClient,
}));

const mockApiClient = {
  request: jest.fn(),
} as unknown as jest.Mocked<ApiClient>;

// Mock window.confirm for delete tests
Object.defineProperty(window, 'confirm', {
  value: jest.fn(),
  configurable: true,
});

const mockTestSuites: TestSuite[] = [
  {
    id: 'suite-1',
    promptId: 'prompt-1',
    name: 'Test Suite 1',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'suite-2',
    promptId: 'prompt-1',
    name: 'Test Suite 2',
    createdAt: new Date('2025-01-02T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
  },
];

const mockTestCases: TestCase[] = [
  {
    id: 'case-1',
    testSuiteId: 'suite-1',
    inputs: { name: 'Alice' },
    expectedOutput: 'Hello Alice',
    runMode: 'DEFAULT',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    id: 'case-2',
    testSuiteId: 'suite-1',
    inputs: { name: 'Bob', age: '30' },
    expectedOutput: { greeting: 'Hello Bob', age: 30 },
    runMode: 'ONLY',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  },
];

describe('TestSuitePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window.confirm as jest.Mock).mockReturnValue(true);
  });

  it('renders loading state initially', () => {
    mockApiClient.request.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<TestSuitePanel promptId="prompt-1" />);
    expect(screen.getByText('Loading test suites...')).toBeInTheDocument();
  });

  it('renders error state when API call fails', async () => {
    mockApiClient.request.mockRejectedValue(new Error('API Error'));
    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load test suites')).toBeInTheDocument();
    });
  });

  it('renders empty state when no test suites exist', async () => {
    mockApiClient.request.mockResolvedValue([]);
    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('No test suites found for this prompt.')).toBeInTheDocument();
    });

    expect(screen.getByText('Create Test Suite')).toBeInTheDocument();
  });

  it('renders test suites when data is loaded', async () => {
    mockApiClient.request.mockResolvedValue(mockTestSuites);
    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
      expect(screen.getByText('Test Suite 2')).toBeInTheDocument();
    });

    // Check that action buttons are present
    expect(screen.getAllByText('Test Cases')).toHaveLength(2);
    expect(screen.getAllByText('Edit')).toHaveLength(2);
    expect(screen.getAllByText('Delete')).toHaveLength(2);
    expect(screen.getAllByText('Run')).toHaveLength(2);
  });

  it('calls API with correct promptId', async () => {
    mockApiClient.request.mockResolvedValue([]);
    render(<TestSuitePanel promptId="test-prompt-id" />);

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/prompts/test-prompt-id/test-suites');
    });
  });

  it('opens create modal when create button is clicked', async () => {
    mockApiClient.request.mockResolvedValue([]);
    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Create Test Suite')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Create Test Suite'));
    expect(screen.getByText('Create New Test Suite')).toBeInTheDocument();
  });

  it('creates new test suite successfully', async () => {
    const newTestSuite = {
      id: 'suite-new',
      promptId: 'prompt-1',
      name: 'New Test Suite',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockApiClient.request
      .mockResolvedValueOnce([]) // Initial load
      .mockResolvedValueOnce(newTestSuite); // Create API call

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Create Test Suite')).toBeInTheDocument();
    });

    // Open create modal
    fireEvent.click(screen.getByText('Create Test Suite'));

    // Fill in the form
    const nameInput = screen.getByLabelText('Test Suite Name');
    fireEvent.change(nameInput, { target: { value: 'New Test Suite' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/prompts/prompt-1/test-suites', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Test Suite' }),
      });
    });

    // Check that the new test suite appears in the list
    expect(screen.getByText('New Test Suite')).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', async () => {
    mockApiClient.request.mockResolvedValue(mockTestSuites);
    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Edit')[0]);
    expect(screen.getByText('Edit Test Suite')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Suite 1')).toBeInTheDocument();
  });

  it('updates test suite successfully', async () => {
    const updatedTestSuite = {
      ...mockTestSuites[0],
      name: 'Updated Test Suite',
      updatedAt: new Date(),
    };

    mockApiClient.request
      .mockResolvedValueOnce(mockTestSuites) // Initial load
      .mockResolvedValueOnce(updatedTestSuite); // Update API call

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    // Open edit modal
    fireEvent.click(screen.getAllByText('Edit')[0]);

    // Update the form
    const nameInput = screen.getByLabelText('Test Suite Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Test Suite' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/test-suites/suite-1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Test Suite' }),
      });
    });

    // Check that the test suite name is updated in the list
    expect(screen.getByText('Updated Test Suite')).toBeInTheDocument();
    expect(screen.queryByText('Test Suite 1')).not.toBeInTheDocument();
  });

  it('deletes test suite after confirmation', async () => {
    mockApiClient.request
      .mockResolvedValueOnce(mockTestSuites) // Initial load
      .mockResolvedValueOnce(undefined); // Delete API call

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
      expect(screen.getByText('Test Suite 2')).toBeInTheDocument();
    });

    // Click delete button for first test suite
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/test-suites/suite-1', {
        method: 'DELETE',
      });
    });

    // Wait for the state update
    await waitFor(() => {
      expect(screen.queryByText('Test Suite 1')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Test Suite 2')).toBeInTheDocument();
  });

  it('does not delete test suite when confirmation is cancelled', async () => {
    (window.confirm as jest.Mock).mockReturnValue(false);

    mockApiClient.request.mockResolvedValue(mockTestSuites);
    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    // Click delete button for first test suite
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Ensure API was not called since confirmation was cancelled
    expect(mockApiClient.request).toHaveBeenCalledTimes(1); // Only the initial load
    expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
  });

  // Test Cases functionality tests
  it('shows test cases when Test Cases button is clicked', async () => {
    mockApiClient.request
      .mockResolvedValueOnce(mockTestSuites) // Initial test suites load
      .mockResolvedValueOnce(mockTestCases); // Test cases load

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    // Click the Test Cases button for the first test suite
    fireEvent.click(screen.getAllByText('Test Cases')[0]);

    await waitFor(() => {
      expect(screen.getByText('Test Cases for "Test Suite 1"')).toBeInTheDocument();
      expect(mockApiClient.request).toHaveBeenCalledWith('/test-suites/suite-1/test-cases');
    });

    // Check that test cases are displayed
    expect(screen.getByText('Test Case case-1')).toBeInTheDocument();
    expect(screen.getByText('Test Case case-2')).toBeInTheDocument();
    expect(screen.getByText('DEFAULT')).toBeInTheDocument();
    expect(screen.getByText('ONLY')).toBeInTheDocument();
  });

  it('shows empty state when no test cases exist', async () => {
    mockApiClient.request
      .mockResolvedValueOnce(mockTestSuites) // Initial test suites load
      .mockResolvedValueOnce([]); // Empty test cases

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    // Click the Test Cases button
    fireEvent.click(screen.getAllByText('Test Cases')[0]);

    await waitFor(() => {
      expect(screen.getByText('No test cases found for this test suite.')).toBeInTheDocument();
    });
  });

  it('shows test case editor when Add Test Case is clicked', async () => {
    mockApiClient.request
      .mockResolvedValueOnce(mockTestSuites) // Initial test suites load
      .mockResolvedValueOnce([]); // Empty test cases

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    // Click the Test Cases button
    fireEvent.click(screen.getAllByText('Test Cases')[0]);

    await waitFor(() => {
      expect(screen.getByText('Add Test Case')).toBeInTheDocument();
    });

    // Click Add Test Case
    fireEvent.click(screen.getByText('Add Test Case'));

    expect(screen.getByText('Create New Test Case')).toBeInTheDocument();
    expect(screen.getByText('Input Variables')).toBeInTheDocument();
    expect(screen.getByText('Expected Output')).toBeInTheDocument();
    expect(screen.getByText('Run Mode')).toBeInTheDocument();
  });

  it('shows test case editor when editing a test case', async () => {
    mockApiClient.request
      .mockResolvedValueOnce(mockTestSuites) // Initial test suites load
      .mockResolvedValueOnce(mockTestCases); // Test cases load

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    // Click the Test Cases button
    fireEvent.click(screen.getAllByText('Test Cases')[0]);

    await waitFor(() => {
      expect(screen.getByText('Test Case case-1')).toBeInTheDocument();
    });

    // Click Edit on the first test case
    const editButtons = screen.getAllByText('Edit');
    // Skip the test suite edit buttons (2) and click on test case edit button
    fireEvent.click(editButtons[2]);

    expect(screen.getByText('Edit Test Case')).toBeInTheDocument();
    expect(screen.getByDisplayValue('name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
  });

  it('deletes test case after confirmation', async () => {
    (window.confirm as jest.Mock).mockReturnValue(true);

    mockApiClient.request
      .mockResolvedValueOnce(mockTestSuites) // Initial test suites load
      .mockResolvedValueOnce(mockTestCases) // Test cases load
      .mockResolvedValueOnce(undefined); // Delete API call

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    // Click the Test Cases button
    fireEvent.click(screen.getAllByText('Test Cases')[0]);

    await waitFor(() => {
      expect(screen.getByText('Test Case case-1')).toBeInTheDocument();
    });

    // Click Delete on the first test case
    const testCaseDeleteButtons = screen.getAllByText('Delete');
    // Skip the test suite delete buttons (2) and click on test case delete button
    fireEvent.click(testCaseDeleteButtons[2]);

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/test-cases/case-1', {
        method: 'DELETE',
      });
    });

    // Check that the test case is removed from the list
    await waitFor(() => {
      expect(screen.queryByText('Test Case case-1')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Test Case case-2')).toBeInTheDocument();
  });

  it('closes test cases view when Close button is clicked', async () => {
    mockApiClient.request
      .mockResolvedValueOnce(mockTestSuites) // Initial test suites load
      .mockResolvedValueOnce(mockTestCases); // Test cases load

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    // Click the Test Cases button
    fireEvent.click(screen.getAllByText('Test Cases')[0]);

    await waitFor(() => {
      expect(screen.getByText('Test Cases for "Test Suite 1"')).toBeInTheDocument();
    });

    // Click Close
    fireEvent.click(screen.getByText('Close'));

    expect(screen.queryByText('Test Cases for "Test Suite 1"')).not.toBeInTheDocument();
  });

  it('shows error when test cases fail to load', async () => {
    mockApiClient.request
      .mockResolvedValueOnce(mockTestSuites) // Initial test suites load
      .mockRejectedValueOnce(new Error('API Error')); // Test cases load fails

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    // Click the Test Cases button
    fireEvent.click(screen.getAllByText('Test Cases')[0]);

    await waitFor(() => {
      expect(screen.getByText('Failed to load test cases')).toBeInTheDocument();
    });
  });

  it('clears test case view when deleting the selected test suite', async () => {
    mockApiClient.request
      .mockResolvedValueOnce(mockTestSuites) // Initial test suites load
      .mockResolvedValueOnce(mockTestCases) // Test cases load
      .mockResolvedValueOnce(undefined); // Delete test suite API call

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    // Open test cases view
    fireEvent.click(screen.getAllByText('Test Cases')[0]);

    await waitFor(() => {
      expect(screen.getByText('Test Cases for "Test Suite 1"')).toBeInTheDocument();
    });

    // Delete the test suite that's currently being viewed
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]); // First delete button (test suite)

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/test-suites/suite-1', {
        method: 'DELETE',
      });
    });

    // Check that test case view is closed
    expect(screen.queryByText('Test Cases for "Test Suite 1"')).not.toBeInTheDocument();
  });

  it('runs test suite successfully', async () => {
    const runResponse = { runId: 'run-123' };

    mockApiClient.request
      .mockResolvedValueOnce(mockTestSuites) // Initial test suites load
      .mockResolvedValueOnce(runResponse); // Run API call

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    // Click the Run button for the first test suite
    const runButtons = screen.getAllByText('Run');
    fireEvent.click(runButtons[0]);

    // Check that it shows "Running..." state
    expect(screen.getByText('Running...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/test-suites/suite-1/run', {
        method: 'POST',
      });
    });

    // Check that it shows success message
    await waitFor(() => {
      expect(screen.getByText('Test suite execution started. Run ID: run-123')).toBeInTheDocument();
    });

    // Check that the button is no longer in running state
    expect(screen.queryByText('Running...')).not.toBeInTheDocument();
    expect(screen.getAllByText('Run')).toHaveLength(2);
  });

  it('shows error when test suite run fails', async () => {
    mockApiClient.request
      .mockResolvedValueOnce(mockTestSuites) // Initial test suites load
      .mockRejectedValueOnce(new Error('API Error')); // Run API call fails

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    // Click the Run button for the first test suite
    const runButtons = screen.getAllByText('Run');
    fireEvent.click(runButtons[0]);

    // Check that it shows "Running..." state
    expect(screen.getByText('Running...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Failed to start test suite execution: API Error')).toBeInTheDocument();
    });

    // Check that the button is no longer in running state
    expect(screen.queryByText('Running...')).not.toBeInTheDocument();
    expect(screen.getAllByText('Run')).toHaveLength(2);
  });

  it('disables run button during execution', async () => {
    mockApiClient.request
      .mockResolvedValueOnce(mockTestSuites) // Initial test suites load
      .mockImplementation(() => new Promise(() => {})); // Never resolves for run

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    // Click the Run button for the first test suite
    const runButtons = screen.getAllByText('Run');
    fireEvent.click(runButtons[0]);

    // Check that the button is disabled and shows "Running..."
    const runningButton = screen.getByText('Running...');
    expect(runningButton).toBeDisabled();

    // Check that other run buttons are still enabled
    const remainingRunButtons = screen.getAllByText('Run');
    expect(remainingRunButtons).toHaveLength(1);
    expect(remainingRunButtons[0]).not.toBeDisabled();
  });
});
