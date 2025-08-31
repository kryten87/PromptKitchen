import { render, screen, fireEvent } from '@testing-library/react';
import { EditPromptForm } from './EditPromptForm';

const mockPrompt = {
  id: '1',
  name: 'Test Prompt',
  prompt: 'Hello {{name}}',
  projectId: 'project-1',
  version: 1,
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z')
};

const mockApiClient = {
  request: jest.fn()
};

jest.mock('../hooks/useApiClient', () => ({
  useApiClient: () => mockApiClient
}));

describe('EditPromptForm', () => {
  const defaultProps = {
    prompt: mockPrompt,
    onPromptUpdated: jest.fn(),
    onViewHistory: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays prompt information and form fields', () => {
    render(<EditPromptForm {...defaultProps} />);
    
    expect(screen.getByDisplayValue('Test Prompt')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello {{name}}')).toBeInTheDocument();
    expect(screen.getByText(/Version 1/)).toBeInTheDocument();
  });

  it('enables save button when form has changes', () => {
    render(<EditPromptForm {...defaultProps} />);
    
    const nameInput = screen.getByDisplayValue('Test Prompt');
    fireEvent.change(nameInput, { target: { value: 'Updated Prompt' } });
    
    const saveButton = screen.getByTestId('prompt-editor-save-button');
    expect(saveButton).not.toBeDisabled();
  });

  it('disables save button when form has no changes', () => {
    render(<EditPromptForm {...defaultProps} />);
    
    const saveButton = screen.getByTestId('prompt-editor-save-button');
    expect(saveButton).toBeDisabled();
  });

  it('calls onViewHistory when view history button is clicked', () => {
    const onViewHistory = jest.fn();
    render(<EditPromptForm {...defaultProps} onViewHistory={onViewHistory} />);
    
    const viewHistoryButton = screen.getByTestId('prompt-editor-view-history-button');
    fireEvent.click(viewHistoryButton);
    
    expect(onViewHistory).toHaveBeenCalled();
  });
});