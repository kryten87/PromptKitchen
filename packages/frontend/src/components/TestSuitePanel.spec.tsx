/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { ApiClient } from '../ApiClient';
import { TestSuitePanel } from './TestSuitePanel';

// Mock the useApiClient hook
jest.mock('../hooks/useApiClient', () => ({
  useApiClient: () => mockApiClient,
}));

const mockApiClient = {
  request: jest.fn(),
} as unknown as jest.Mocked<ApiClient>;

describe('TestSuitePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
