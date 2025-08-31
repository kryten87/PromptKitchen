import { render, screen } from '@testing-library/react';
import { EditPromptModal } from './EditPromptModal';

const mockPrompt = {
  id: '1',
  name: 'Test Prompt',
  prompt: 'Hello {{name}}',
  projectId: 'project-1',
  version: 1,
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z')
};

describe('EditPromptModal', () => {
  const defaultProps = {
    open: true,
    prompt: mockPrompt,
    onPromptUpdated: jest.fn(),
    onViewHistory: jest.fn(),
    onCancel: jest.fn()
  };

  it('renders when open is true and prompt is provided', () => {
    render(<EditPromptModal {...defaultProps} />);
    
    expect(screen.getByTestId('edit-prompt-modal')).toBeInTheDocument();
    expect(screen.getByTestId('edit-prompt-header')).toHaveTextContent('Edit Prompt');
    expect(screen.getByTestId('edit-prompt-cancel-button')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<EditPromptModal {...defaultProps} open={false} />);
    
    expect(screen.queryByTestId('edit-prompt-modal')).not.toBeInTheDocument();
  });

  it('does not render when prompt is null', () => {
    render(<EditPromptModal {...defaultProps} prompt={null} />);
    
    expect(screen.queryByTestId('edit-prompt-modal')).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn();
    render(<EditPromptModal {...defaultProps} onCancel={onCancel} />);
    
    screen.getByTestId('edit-prompt-cancel-button').click();
    
    expect(onCancel).toHaveBeenCalled();
  });
});