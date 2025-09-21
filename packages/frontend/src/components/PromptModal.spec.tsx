import { fireEvent, render, screen, act, waitFor } from '@testing-library/react';
import { PromptModal } from './PromptModal';
import { useApiClient } from '../hooks/useApiClient';

jest.mock('../hooks/useApiClient');

const mockModels = [
  { id: '1', name: 'gpt-3.5', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'gpt-4', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

const mockPrompt = {
  id: '1',
  name: 'Test Prompt',
  prompt: 'Hello {{name}}',
  projectId: 'project-1',
  version: 1,
  modelId: null,
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z')
};

describe('PromptModal', () => {
  const mockOnPromptCreated = jest.fn();
  const mockOnPromptUpdated = jest.fn();
  const mockOnViewHistory = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const getModels = jest.fn().mockResolvedValue(mockModels);
    (useApiClient as jest.Mock).mockReturnValue({ getModels });
  });

  describe('Create mode', () => {
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

    it('renders the PromptForm with correct props', async () => {
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

  describe('Edit mode', () => {
    it('renders when open is true and prompt is provided', async () => {
      await act(async () => {
        render(
          <PromptModal
            open={true}
            prompt={mockPrompt}
            onPromptUpdated={mockOnPromptUpdated}
            onViewHistory={mockOnViewHistory}
            onCancel={mockOnCancel}
          />
        );
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('edit-prompt-modal')).toBeInTheDocument();
      });
      expect(screen.getByTestId('edit-prompt-header')).toHaveTextContent('Edit Prompt');
      expect(screen.getByTestId('edit-prompt-cancel-button')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(
        <PromptModal
          open={false}
          prompt={mockPrompt}
          onPromptUpdated={mockOnPromptUpdated}
          onViewHistory={mockOnViewHistory}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.queryByTestId('edit-prompt-modal')).not.toBeInTheDocument();
    });

    it('does not render when prompt is null', () => {
      render(
        <PromptModal
          open={true}
          prompt={null}
          onPromptUpdated={mockOnPromptUpdated}
          onViewHistory={mockOnViewHistory}
          onCancel={mockOnCancel}
        />
      );
      
      expect(screen.queryByTestId('edit-prompt-modal')).not.toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', async () => {
      await act(async () => {
        render(
          <PromptModal
            open={true}
            prompt={mockPrompt}
            onPromptUpdated={mockOnPromptUpdated}
            onViewHistory={mockOnViewHistory}
            onCancel={mockOnCancel}
          />
        );
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('edit-prompt-cancel-button')).toBeInTheDocument();
      });
      
      screen.getByTestId('edit-prompt-cancel-button').click();
      
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});