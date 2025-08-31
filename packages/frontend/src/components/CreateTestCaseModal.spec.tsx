import { fireEvent, render, screen } from '@testing-library/react';
import * as useApiClientModule from '../hooks/useApiClient';
import { createMockApiClient } from '../mocks/ApiClient';
import { CreateTestCaseModal } from './CreateTestCaseModal';

describe('CreateTestCaseModal', () => {
  let mockApiClient: ReturnType<typeof createMockApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient = createMockApiClient();
    jest.spyOn(useApiClientModule, 'useApiClient').mockReturnValue(mockApiClient);
  });

  const defaultProps = {
    open: true,
    testSuiteId: 'test-suite-1',
    testCase: null,
    onTestCaseCreated: jest.fn(),
    onTestCaseUpdated: jest.fn(),
    onCancel: jest.fn(),
  };

  it('renders modal when open is true', () => {
    render(<CreateTestCaseModal {...defaultProps} />);

    expect(screen.getByTestId('create-test-case-modal')).toBeInTheDocument();
    expect(screen.getByText('Create New Test Case')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<CreateTestCaseModal {...defaultProps} open={false} />);

    expect(screen.queryByTestId('create-test-case-modal')).not.toBeInTheDocument();
  });

  it('renders with edit mode when testCase is provided', () => {
    const testCase = {
      id: 'tc-1',
      testSuiteId: 'test-suite-1',
      inputs: { input1: 'value1' },
      expectedOutput: 'expected result',
      assertions: [],
      runMode: 'DEFAULT' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(<CreateTestCaseModal {...defaultProps} testCase={testCase} />);

    expect(screen.getByTestId('create-test-case-modal')).toBeInTheDocument();
    expect(screen.getByText('Edit Test Case')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<CreateTestCaseModal {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('has proper modal structure with overlay', () => {
    render(<CreateTestCaseModal {...defaultProps} />);

    const modal = screen.getByTestId('create-test-case-modal');
    expect(modal).toHaveClass('fixed', 'inset-0', 'z-50', 'flex', 'items-center', 'justify-center', 'bg-black', 'bg-opacity-40');
    
    const modalContent = modal.querySelector('.bg-white.rounded-lg.shadow-lg');
    expect(modalContent).toBeInTheDocument();
  });
});