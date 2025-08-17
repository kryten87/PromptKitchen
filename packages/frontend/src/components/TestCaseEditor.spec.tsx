/**
 * @jest-environment jsdom
 */
import type { TestCase } from '@prompt-kitchen/shared/src/dtos';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiClient } from '../ApiClient';
import { TestCaseEditor } from './TestCaseEditor';

// Mock the useApiClient hook
jest.mock('../hooks/useApiClient', () => ({
  useApiClient: () => mockApiClient,
}));

const mockApiClient = {
  request: jest.fn(),
} as unknown as jest.Mocked<ApiClient>;

const mockOnTestCaseCreated = jest.fn();
const mockOnTestCaseUpdated = jest.fn();
const mockOnCancel = jest.fn();

const mockTestCase: TestCase = {
  id: 'case-1',
  testSuiteId: 'suite-1',
  inputs: { name: 'Alice', age: '25' },
  expectedOutput: 'Hello Alice, you are 25 years old',
  assertions: [],
  runMode: 'DEFAULT',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

const mockJsonTestCase: TestCase = {
  id: 'case-2',
  testSuiteId: 'suite-1',
  inputs: { userId: '123' },
  expectedOutput: { message: 'User found', userId: 123 },
  assertions: [],
  runMode: 'ONLY',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

describe('TestCaseEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create mode correctly', () => {
    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        onTestCaseCreated={mockOnTestCaseCreated}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Create New Test Case')).toBeInTheDocument();
    expect(screen.getByText('Input Variables')).toBeInTheDocument();
    expect(screen.getByText('Expected Output')).toBeInTheDocument();
    expect(screen.getByText('Run Mode')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders edit mode correctly', () => {
    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        testCase={mockTestCase}
        onTestCaseUpdated={mockOnTestCaseUpdated}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Edit Test Case')).toBeInTheDocument();
    expect(screen.getByDisplayValue('name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('age')).toBeInTheDocument();
    expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello Alice, you are 25 years old')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
  });

  it('renders JSON test case correctly', () => {
    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        testCase={mockJsonTestCase}
        onTestCaseUpdated={mockOnTestCaseUpdated}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('userId')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123')).toBeInTheDocument();

    // Check that the JSON textarea contains the expected content
    const textarea = screen.getByPlaceholderText('Enter expected JSON output...') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toContain('"message": "User found"');
    expect(textarea.value).toContain('"userId": 123');

    expect(screen.getByDisplayValue('ONLY')).toBeChecked();
    expect(screen.getByLabelText('JSON Output')).toBeChecked();
  });

  it('allows adding input fields', () => {
    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        onTestCaseCreated={mockOnTestCaseCreated}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('No input variables defined')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Add Input'));

    expect(screen.getByPlaceholderText('Key')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Value')).toBeInTheDocument();
  });

  it('allows removing input fields', () => {
    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        testCase={mockTestCase}
        onTestCaseUpdated={mockOnTestCaseUpdated}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('age')).toBeInTheDocument();

    const removeButtons = screen.getAllByText('✕');
    fireEvent.click(removeButtons[0]); // Remove first input field

    expect(screen.queryByDisplayValue('name')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('age')).toBeInTheDocument();
  });

  it('allows updating input keys and values', async () => {
    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        testCase={mockTestCase}
        onTestCaseUpdated={mockOnTestCaseUpdated}
        onCancel={mockOnCancel}
      />
    );

    const keyInputs = screen.getAllByPlaceholderText('Key');
    const valueInputs = screen.getAllByPlaceholderText('Value');

    fireEvent.change(keyInputs[0], { target: { value: 'username' } });
    fireEvent.change(valueInputs[1], { target: { value: 'Bob' } });

    await waitFor(() => {
      expect(screen.getByDisplayValue('username')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Bob')).toBeInTheDocument();
    });
  });

  it('toggles JSON output mode', () => {
    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        onTestCaseCreated={mockOnTestCaseCreated}
        onCancel={mockOnCancel}
      />
    );

    const jsonCheckbox = screen.getByLabelText('JSON Output');
    const outputTextarea = screen.getByPlaceholderText('Enter expected string output...');

    expect(jsonCheckbox).not.toBeChecked();
    expect(outputTextarea).toBeInTheDocument();

    fireEvent.click(jsonCheckbox);

    expect(jsonCheckbox).toBeChecked();
    expect(screen.getByPlaceholderText('Enter expected JSON output...')).toBeInTheDocument();
  });

  it('changes run mode correctly', () => {
    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        onTestCaseCreated={mockOnTestCaseCreated}
        onCancel={mockOnCancel}
      />
    );

    const defaultRadio = screen.getByDisplayValue('DEFAULT');
    const skipRadio = screen.getByDisplayValue('SKIP');
    const onlyRadio = screen.getByDisplayValue('ONLY');

    expect(defaultRadio).toBeChecked();

    fireEvent.click(skipRadio);
    expect(skipRadio).toBeChecked();
    expect(defaultRadio).not.toBeChecked();

    fireEvent.click(onlyRadio);
    expect(onlyRadio).toBeChecked();
    expect(skipRadio).not.toBeChecked();
  });

  it('disables create button when form is invalid', () => {
    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        onTestCaseCreated={mockOnTestCaseCreated}
        onCancel={mockOnCancel}
      />
    );

    const createButton = screen.getByRole('button', { name: 'Create' });
    expect(createButton).toBeDisabled();

    // Add input but no expected output
    fireEvent.click(screen.getByText('Add Input'));
    const keyInput = screen.getByPlaceholderText('Key');
    const valueInput = screen.getByPlaceholderText('Value');
    fireEvent.change(keyInput, { target: { value: 'test' } });
    fireEvent.change(valueInput, { target: { value: 'value' } });

    expect(createButton).toBeDisabled();

    // Add expected output
    const outputTextarea = screen.getByPlaceholderText('Enter expected string output...');
    fireEvent.change(outputTextarea, { target: { value: 'Expected result' } });

    expect(createButton).not.toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        onTestCaseCreated={mockOnTestCaseCreated}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('creates new test case successfully', async () => {
    const newTestCase = {
      id: 'case-new',
      testSuiteId: 'suite-1',
      inputs: { input1: 'value' },
      expectedOutput: 'Expected result',
      assertions: [],
      runMode: 'DEFAULT',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockApiClient.request.mockResolvedValue(newTestCase);

    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        onTestCaseCreated={mockOnTestCaseCreated}
        onCancel={mockOnCancel}
      />
    );

    // Add input
    fireEvent.click(screen.getByText('Add Input'));
    const valueInput = screen.getByPlaceholderText('Value');
    fireEvent.change(valueInput, { target: { value: 'value' } });

    // Wait for the state updates to be applied
    await waitFor(() => {
      expect(screen.getByDisplayValue('input1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('value')).toBeInTheDocument();
    });

    // Add expected output
    const outputTextarea = screen.getByPlaceholderText('Enter expected string output...');
    fireEvent.change(outputTextarea, { target: { value: 'Expected result' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/test-suites/suite-1/test-cases', {
        method: 'POST',
        body: JSON.stringify({
          inputs: { input1: 'value' },
          expectedOutput: 'Expected result',
          assertions: [],
          runMode: 'DEFAULT',
        }),
      });
    });

    expect(mockOnTestCaseCreated).toHaveBeenCalledWith(newTestCase);
  });

  it('updates existing test case successfully', async () => {
    const updatedTestCase = {
      ...mockTestCase,
      inputs: { name: 'Charlie' },
      expectedOutput: 'Hello Charlie',
      assertions: [],
    };

    mockApiClient.request.mockResolvedValue(updatedTestCase);

    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        testCase={mockTestCase}
        onTestCaseUpdated={mockOnTestCaseUpdated}
        onCancel={mockOnCancel}
      />
    );

    // Update input value
    const valueInputs = screen.getAllByPlaceholderText('Value');
    fireEvent.change(valueInputs[0], { target: { value: 'Charlie' } });

    // Update expected output
    const outputTextarea = screen.getByDisplayValue('Hello Alice, you are 25 years old');
    fireEvent.change(outputTextarea, { target: { value: 'Hello Charlie' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith(`/test-cases/${mockTestCase.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          inputs: { name: 'Charlie', age: 25 },
          expectedOutput: 'Hello Charlie',
          assertions: [],
          runMode: 'DEFAULT',
        }),
      });
    });

    expect(mockOnTestCaseUpdated).toHaveBeenCalledWith(updatedTestCase);
  });

  it('creates test case with JSON output', async () => {
    const newTestCase = {
      id: 'case-new',
      testSuiteId: 'suite-1',
      inputs: { input1: '123' },
      expectedOutput: { status: 'success' },
      assertions: [],
      runMode: 'DEFAULT',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockApiClient.request.mockResolvedValue(newTestCase);

    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        onTestCaseCreated={mockOnTestCaseCreated}
        onCancel={mockOnCancel}
      />
    );

    // Add input
    fireEvent.click(screen.getByText('Add Input'));
    const valueInput = screen.getByPlaceholderText('Value');
    fireEvent.change(valueInput, { target: { value: '123' } });

    // Wait for the state updates to be applied
    await waitFor(() => {
      expect(screen.getByDisplayValue('input1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123')).toBeInTheDocument();
    });

    // Enable JSON output
    fireEvent.click(screen.getByLabelText('JSON Output'));

    // Add JSON expected output
    const outputTextarea = screen.getByPlaceholderText('Enter expected JSON output...');
    fireEvent.change(outputTextarea, { target: { value: '{"status": "success"}' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/test-suites/suite-1/test-cases', {
        method: 'POST',
        body: JSON.stringify({
          inputs: { input1: 123 },
          expectedOutput: { status: 'success' },
          assertions: [],
          runMode: 'DEFAULT',
        }),
      });
    });

    expect(mockOnTestCaseCreated).toHaveBeenCalledWith(newTestCase);
  });

  it('shows error for invalid JSON', async () => {
    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        onTestCaseCreated={mockOnTestCaseCreated}
        onCancel={mockOnCancel}
      />
    );

    // Add input
    fireEvent.click(screen.getByText('Add Input'));
    const keyInput = screen.getByPlaceholderText('Key');
    const valueInput = screen.getByPlaceholderText('Value');
    fireEvent.change(keyInput, { target: { value: 'test' } });
    fireEvent.change(valueInput, { target: { value: 'value' } });

    // Enable JSON output
    fireEvent.click(screen.getByLabelText('JSON Output'));

    // Add invalid JSON
    const outputTextarea = screen.getByPlaceholderText('Enter expected JSON output...');
    fireEvent.change(outputTextarea, { target: { value: 'invalid json' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid JSON in expected output')).toBeInTheDocument();
    });

    expect(mockApiClient.request).not.toHaveBeenCalled();
    expect(mockOnTestCaseCreated).not.toHaveBeenCalled();
  });

  it('shows error when API call fails', async () => {
    mockApiClient.request.mockRejectedValue(new Error('API Error'));

    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        onTestCaseCreated={mockOnTestCaseCreated}
        onCancel={mockOnCancel}
      />
    );

    // Add input
    fireEvent.click(screen.getByText('Add Input'));
    const keyInput = screen.getByPlaceholderText('Key');
    const valueInput = screen.getByPlaceholderText('Value');
    fireEvent.change(keyInput, { target: { value: 'test' } });
    fireEvent.change(valueInput, { target: { value: 'value' } });

    // Add expected output
    const outputTextarea = screen.getByPlaceholderText('Enter expected string output...');
    fireEvent.change(outputTextarea, { target: { value: 'Expected result' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    expect(mockOnTestCaseCreated).not.toHaveBeenCalled();
  });

  it('converts input values to appropriate types', async () => {
    const newTestCase = {
      id: 'case-new',
      testSuiteId: 'suite-1',
      inputs: {
        input1: 'Alice',
        input2: 25,
        input3: true,
        input4: null
      },
      expectedOutput: 'Expected result',
      assertions: [],
      runMode: 'DEFAULT',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockApiClient.request.mockResolvedValue(newTestCase);

    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        onTestCaseCreated={mockOnTestCaseCreated}
        onCancel={mockOnCancel}
      />
    );

    // Add multiple inputs with different types
    fireEvent.click(screen.getByText('Add Input'));
    fireEvent.click(screen.getByText('Add Input'));
    fireEvent.click(screen.getByText('Add Input'));
    fireEvent.click(screen.getByText('Add Input'));

    const valueInputs = screen.getAllByPlaceholderText('Value');

    fireEvent.change(valueInputs[0], { target: { value: 'Alice' } });
    fireEvent.change(valueInputs[1], { target: { value: '25' } });
    fireEvent.change(valueInputs[2], { target: { value: 'true' } });
    fireEvent.change(valueInputs[3], { target: { value: 'null' } });

    // Wait for the state updates to be applied
    await waitFor(() => {
      expect(screen.getByDisplayValue('input1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
      expect(screen.getByDisplayValue('input2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    });

    // Add expected output
    const outputTextarea = screen.getByPlaceholderText('Enter expected string output...');
    fireEvent.change(outputTextarea, { target: { value: 'Expected result' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/test-suites/suite-1/test-cases', {
        method: 'POST',
        body: JSON.stringify({
          inputs: {
            input1: 'Alice',
            input2: 25,
            input3: true,
            input4: null
          },
          expectedOutput: 'Expected result',
          assertions: [],
          runMode: 'DEFAULT',
        }),
      });
    });

    expect(mockOnTestCaseCreated).toHaveBeenCalledWith(newTestCase);
  });

  it('shows loading state during API call', async () => {
    mockApiClient.request.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <TestCaseEditor
        testSuiteId="suite-1"
        onTestCaseCreated={mockOnTestCaseCreated}
        onCancel={mockOnCancel}
      />
    );

    // Add input
    fireEvent.click(screen.getByText('Add Input'));
    const keyInput = screen.getByPlaceholderText('Key');
    const valueInput = screen.getByPlaceholderText('Value');
    fireEvent.change(keyInput, { target: { value: 'test' } });
    fireEvent.change(valueInput, { target: { value: 'value' } });

    // Add expected output
    const outputTextarea = screen.getByPlaceholderText('Enter expected string output...');
    fireEvent.change(outputTextarea, { target: { value: 'Expected result' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  });
});
