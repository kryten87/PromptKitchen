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
      <TestSuiteModal
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
      <TestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={null}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly when open with testSuite', () => {
    render(
      <TestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );

    expect(screen.getByTestId('edit-test-suite-modal')).toBeInTheDocument();
    expect(screen.getByText('Edit Test Suite')).toBeInTheDocument();
    expect(screen.getByTestId('edit-test-suite-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('edit-test-suite-cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('edit-test-suite-submit-button')).toBeInTheDocument();
  });

  it('pre-fills name input with testSuite name', () => {
    render(
      <TestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );

    const nameInput = screen.getByTestId('edit-test-suite-name-input') as HTMLInputElement;
    expect(nameInput.value).toBe('Test Suite 1');
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <TestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );

    fireEvent.click(screen.getByTestId('edit-test-suite-cancel-button'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('updates test suite successfully', async () => {
    const mockUpdatedTestSuite = { ...mockTestSuite, name: 'Updated Test Suite' };
    mockApiClient.request.mockResolvedValueOnce(mockUpdatedTestSuite);

    render(
      <TestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );

    const nameInput = screen.getByTestId('edit-test-suite-name-input');
    fireEvent.change(nameInput, { target: { value: 'Updated Test Suite' } });
    fireEvent.click(screen.getByTestId('edit-test-suite-submit-button'));

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/test-suites/suite-1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Test Suite' }),
      });
    });

    expect(mockOnTestSuiteUpdated).toHaveBeenCalledWith(mockUpdatedTestSuite);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows error message on update failure', async () => {
    mockApiClient.request.mockRejectedValueOnce(new Error('API Error'));

    render(
      <TestSuiteModal
        isOpen={true}
        onClose={mockOnClose}
        testSuite={mockTestSuite}
        onTestSuiteUpdated={mockOnTestSuiteUpdated}
      />
    );

    const nameInput = screen.getByTestId('edit-test-suite-name-input');
    fireEvent.change(nameInput, { target: { value: 'Updated Test Suite' } });
    fireEvent.click(screen.getByTestId('edit-test-suite-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('Failed to update test suite')).toBeInTheDocument();
    });

    expect(mockOnTestSuiteUpdated).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});