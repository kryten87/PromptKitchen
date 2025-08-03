/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiClient } from '../ApiClient';
import { EditTestSuiteModal } from './EditTestSuiteModal';

// Mock the useApiClient hook
jest.mock('../hooks/useApiClient', () => ({
  useApiClient: () => mockApiClient,
}));

const mockApiClient = {
  request: jest.fn(),
} as unknown as jest.Mocked<ApiClient>;

const mockOnClose = jest.fn();
const mockOnTestSuiteUpdated = jest.fn();

const mockTestSuite = {
  id: 'suite-1',
  promptId: 'prompt-1',
  name: 'Test Suite 1',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

describe('EditTestSuiteModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <EditTestSuiteModal
        isOpen={false}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render when testSuite is null', () => {
    const { container } = render(
      <EditTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={null}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal when open with test suite', () => {
    render(
      <EditTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );
    expect(screen.getByText('Edit Test Suite')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Suite Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Suite 1')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    render(
      <EditTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('updates test suite name in form', () => {
    render(
      <EditTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );

    const nameInput = screen.getByLabelText('Test Suite Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Test Suite' } });

    expect(screen.getByDisplayValue('Updated Test Suite')).toBeInTheDocument();
  });

  it('disables save button when name is empty', () => {
    render(
      <EditTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );

    const nameInput = screen.getByLabelText('Test Suite Name');
    fireEvent.change(nameInput, { target: { value: '' } });

    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('updates test suite successfully', async () => {
    const updatedTestSuite = {
      ...mockTestSuite,
      name: 'Updated Test Suite',
      updatedAt: new Date(),
    };

    mockApiClient.request.mockResolvedValue(updatedTestSuite);

    render(
      <EditTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );

    const nameInput = screen.getByLabelText('Test Suite Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Test Suite' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/test-suites/suite-1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Test Suite' }),
      });
    });

    expect(mockOnTestSuiteUpdated).toHaveBeenCalledWith(updatedTestSuite);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows error message when update fails', async () => {
    mockApiClient.request.mockRejectedValue(new Error('API Error'));

    render(
      <EditTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );

    const nameInput = screen.getByLabelText('Test Suite Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Test Suite' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Failed to update test suite')).toBeInTheDocument();
    });

    expect(mockOnTestSuiteUpdated).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('shows loading state during update', async () => {
    mockApiClient.request.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <EditTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );

    const nameInput = screen.getByLabelText('Test Suite Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Test Suite' } });
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(nameInput).toBeDisabled();
  });

  it('trims whitespace from name', async () => {
    const updatedTestSuite = {
      ...mockTestSuite,
      name: 'Updated Test Suite',
      updatedAt: new Date(),
    };

    mockApiClient.request.mockResolvedValue(updatedTestSuite);

    render(
      <EditTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );

    const nameInput = screen.getByLabelText('Test Suite Name');
    fireEvent.change(nameInput, { target: { value: '  Updated Test Suite  ' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/test-suites/suite-1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Test Suite' }),
      });
    });
  });

  it('updates name when testSuite prop changes', () => {
    const { rerender } = render(
      <EditTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );

    expect(screen.getByDisplayValue('Test Suite 1')).toBeInTheDocument();

    const newTestSuite = {
      ...mockTestSuite,
      id: 'suite-2',
      name: 'Different Test Suite',
    };

    rerender(
      <EditTestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={newTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );

    expect(screen.getByDisplayValue('Different Test Suite')).toBeInTheDocument();
  });
});
