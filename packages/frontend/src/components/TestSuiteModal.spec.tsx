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
const mockOnTestSuiteUpdated = jest.fn();

const mockTestSuite = {
  id: 'suite-1',
  promptId: 'prompt-1',
  name: 'Test Suite 1',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

describe('TestSuiteModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create mode', () => {
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
      const mockCreatedTestSuite = { ...mockTestSuite, name: 'New Test Suite' };
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

  describe('Edit mode', () => {
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
});