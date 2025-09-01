import { fireEvent, render, screen } from '@testing-library/react';
import { PromptModal } from './PromptModal';

describe('CreatePromptModal', () => {
  const mockOnPromptCreated = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when open is false', () => {
    render(
      <PromptModal
        open={false}
        projectId="test-project-id"
        onPromptCreated={mockOnPromptCreated}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByTestId('create-prompt-modal')).not.toBeInTheDocument();
  });

  it('renders modal when open is true', () => {
    render(
      <PromptModal
        open={true}
        projectId="test-project-id"
        onPromptCreated={mockOnPromptCreated}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create New Prompt' })).toBeInTheDocument();
    expect(screen.getByTestId('create-prompt-cancel-button')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <PromptModal
        open={true}
        projectId="test-project-id"
        onPromptCreated={mockOnPromptCreated}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByTestId('create-prompt-cancel-button'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('renders the CreatePromptForm with correct props', () => {
    render(
      <PromptModal
        open={true}
        projectId="test-project-id"
        onPromptCreated={mockOnPromptCreated}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText('Prompt Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Prompt Text')).toBeInTheDocument();
  });
});