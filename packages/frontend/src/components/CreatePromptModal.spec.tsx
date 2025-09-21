import { fireEvent, render, screen, act, waitFor } from '@testing-library/react';
import { PromptModal } from './PromptModal';
import { useApiClient } from '../hooks/useApiClient';

jest.mock('../hooks/useApiClient');

const mockModels = [
  { id: '1', name: 'gpt-3.5', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'gpt-4', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

describe('CreatePromptModal', () => {
  const mockOnPromptCreated = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const getModels = jest.fn().mockResolvedValue(mockModels);
    (useApiClient as jest.Mock).mockReturnValue({ getModels });
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

  it('renders modal when open is true', async () => {
    await act(async () => {
      render(
        <PromptModal
          open={true}
          projectId="test-project-id"
          onPromptCreated={mockOnPromptCreated}
          onCancel={mockOnCancel}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Create New Prompt' })).toBeInTheDocument();
    expect(screen.getByTestId('create-prompt-cancel-button')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    await act(async () => {
      render(
        <PromptModal
          open={true}
          projectId="test-project-id"
          onPromptCreated={mockOnPromptCreated}
          onCancel={mockOnCancel}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('create-prompt-cancel-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('create-prompt-cancel-button'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('renders the CreatePromptForm with correct props', async () => {
    await act(async () => {
      render(
        <PromptModal
          open={true}
          projectId="test-project-id"
          onPromptCreated={mockOnPromptCreated}
          onCancel={mockOnCancel}
        />
      );
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Prompt Name')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Prompt Text')).toBeInTheDocument();
  });
});