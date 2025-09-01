/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiClient } from '../ApiClient';
import { TestSuiteModal } from './TestSuiteModal';

// Mock the useApiClient hook
jest.mock('../hooks/useApiClient', () => ({
  useApiClient: () => mockApiClient,
}));

const mockApiClient = {
  request: jest.fn(),
} as unknown as jest.Mocked<ApiClient>;

const mockOnClose = jest.fn();
const mockOnTestSuiteCreated = jest.fn();

describe('CreateTestSuiteModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <TestSuiteModal
        isOpen={false}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly when open', () => {
    render(
      <TestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );

    expect(screen.getByTestId('create-test-suite-modal')).toBeInTheDocument();
    expect(screen.getByText('Create New Test Suite')).toBeInTheDocument();
    expect(screen.getByTestId('create-test-suite-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('create-test-suite-cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('create-test-suite-submit-button')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <TestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );

    fireEvent.click(screen.getByTestId('create-test-suite-cancel-button'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('disables submit button when name is empty', () => {
    render(
      <TestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );

    expect(screen.getByTestId('create-test-suite-submit-button')).toBeDisabled();
  });

  it('enables submit button when name is provided', () => {
    render(
      <TestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );

    const nameInput = screen.getByTestId('create-test-suite-name-input');
    fireEvent.change(nameInput, { target: { value: 'Test Suite' } });

    expect(screen.getByTestId('create-test-suite-submit-button')).not.toBeDisabled();
  });

  it('creates test suite successfully', async () => {
    const mockCreatedTestSuite = {
      id: 'suite-1',
      promptId: 'prompt-1',
      name: 'New Test Suite',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    };
    mockApiClient.request.mockResolvedValueOnce(mockCreatedTestSuite);

    render(
      <TestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );

    const nameInput = screen.getByTestId('create-test-suite-name-input');
    fireEvent.change(nameInput, { target: { value: 'New Test Suite' } });
    fireEvent.click(screen.getByTestId('create-test-suite-submit-button'));

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/prompts/prompt-1/test-suites', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Test Suite' }),
      });
    });

    expect(mockOnTestSuiteCreated).toHaveBeenCalledWith(mockCreatedTestSuite);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows error message on creation failure', async () => {
    mockApiClient.request.mockRejectedValueOnce(new Error('API Error'));

    render(
      <TestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );

    const nameInput = screen.getByTestId('create-test-suite-name-input');
    fireEvent.change(nameInput, { target: { value: 'Test Suite' } });
    fireEvent.click(screen.getByTestId('create-test-suite-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Failed to create test suite')).toBeInTheDocument();
    });

    expect(mockOnTestSuiteCreated).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});