/**
 * @jest-environment jsdom
 */
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
    const mockTestSuites = [
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

    mockApiClient.request.mockResolvedValue(mockTestSuites);
    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
      expect(screen.getByText('Test Suite 2')).toBeInTheDocument();
    });

    // Check that action buttons are present
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
    const mockTestSuites = [
      {
        id: 'suite-1',
        promptId: 'prompt-1',
        name: 'Test Suite 1',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      },
    ];

    mockApiClient.request.mockResolvedValue(mockTestSuites);
    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit Test Suite')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Suite 1')).toBeInTheDocument();
  });

  it('updates test suite successfully', async () => {
    const mockTestSuites = [
      {
        id: 'suite-1',
        promptId: 'prompt-1',
        name: 'Test Suite 1',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      },
    ];

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
    fireEvent.click(screen.getByText('Edit'));

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
    const mockTestSuites = [
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

    const mockTestSuites = [
      {
        id: 'suite-1',
        promptId: 'prompt-1',
        name: 'Test Suite 1',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      },
    ];

    mockApiClient.request.mockResolvedValue(mockTestSuites);
    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));

    // Check that delete API was not called
    expect(mockApiClient.request).toHaveBeenCalledTimes(1); // Only initial load
    expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
  });

  it('shows error when delete fails', async () => {
    // Mock window.alert for this test
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    const mockTestSuites = [
      {
        id: 'suite-1',
        promptId: 'prompt-1',
        name: 'Test Suite 1',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      },
    ];

    mockApiClient.request
      .mockResolvedValueOnce(mockTestSuites) // Initial load
      .mockRejectedValueOnce(new Error('Delete failed')); // Delete API call

    render(<TestSuitePanel promptId="prompt-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Suite 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to delete test suite');
    });

    // Test suite should still be in the list since delete failed
    expect(screen.getByText('Test Suite 1')).toBeInTheDocument();

    // Clean up
    alertSpy.mockRestore();
  });
});
