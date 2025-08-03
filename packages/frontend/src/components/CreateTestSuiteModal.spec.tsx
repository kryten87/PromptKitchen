/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiClient } from '../ApiClient';
import { CreateTestSuiteModal } from './CreateTestSuiteModal';

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
      <CreateTestSuiteModal
        isOpen={false}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal when open', () => {
    render(
      <CreateTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );
    expect(screen.getByText('Create New Test Suite')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Suite Name')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    render(
      <CreateTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables create button when name is empty', () => {
    render(
      <CreateTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );
    const createButton = screen.getByText('Create');
    expect(createButton).toBeDisabled();
  });

  it('enables create button when name is provided', () => {
    render(
      <CreateTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );

    const nameInput = screen.getByLabelText('Test Suite Name');
    fireEvent.change(nameInput, { target: { value: 'Test Suite 1' } });

    const createButton = screen.getByText('Create');
    expect(createButton).not.toBeDisabled();
  });

  it('creates test suite successfully', async () => {
    const newTestSuite = {
      id: 'suite-1',
      promptId: 'prompt-1',
      name: 'Test Suite 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockApiClient.request.mockResolvedValue(newTestSuite);

    render(
      <CreateTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );

    const nameInput = screen.getByLabelText('Test Suite Name');
    fireEvent.change(nameInput, { target: { value: 'Test Suite 1' } });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/prompts/prompt-1/test-suites', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Suite 1' }),
      });
    });

    expect(mockOnTestSuiteCreated).toHaveBeenCalledWith(newTestSuite);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows error message when creation fails', async () => {
    mockApiClient.request.mockRejectedValue(new Error('API Error'));

    render(
      <CreateTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );

    const nameInput = screen.getByLabelText('Test Suite Name');
    fireEvent.change(nameInput, { target: { value: 'Test Suite 1' } });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('Failed to create test suite')).toBeInTheDocument();
    });

    expect(mockOnTestSuiteCreated).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('shows loading state during creation', async () => {
    mockApiClient.request.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <CreateTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );

    const nameInput = screen.getByLabelText('Test Suite Name');
    fireEvent.change(nameInput, { target: { value: 'Test Suite 1' } });
    fireEvent.click(screen.getByText('Create'));

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(nameInput).toBeDisabled();
  });

  it('trims whitespace from name', async () => {
    const newTestSuite = {
      id: 'suite-1',
      promptId: 'prompt-1',
      name: 'Test Suite 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockApiClient.request.mockResolvedValue(newTestSuite);

    render(
      <CreateTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        promptId="prompt-1"
        onTestSuiteCreated={mockOnTestSuiteCreated}
      />
    );

    const nameInput = screen.getByLabelText('Test Suite Name');
    fireEvent.change(nameInput, { target: { value: '  Test Suite 1  ' } });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/prompts/prompt-1/test-suites', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Suite 1' }),
      });
    });
  });
});
