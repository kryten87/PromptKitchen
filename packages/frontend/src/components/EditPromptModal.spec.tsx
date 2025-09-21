import { render, screen, act, waitFor } from '@testing-library/react';
import { PromptModal } from './PromptModal';
import { useApiClient } from '../hooks/useApiClient';

jest.mock('../hooks/useApiClient');

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

const mockUseApiClient = useApiClient as jest.MockedFunction<typeof useApiClient>;

describe('EditPromptModal', () => {
  beforeEach(() => {
    mockUseApiClient.mockReturnValue({
      getModels: jest.fn().mockResolvedValue([]),
    } as Partial<ReturnType<typeof useApiClient>> as ReturnType<typeof useApiClient>);
  });
  const defaultProps = {
    open: true,
    prompt: mockPrompt,
    onPromptUpdated: jest.fn(),
    onViewHistory: jest.fn(),
    onCancel: jest.fn()
  };

  it('renders when open is true and prompt is provided', async () => {
    await act(async () => {
      render(<PromptModal {...defaultProps} />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-prompt-modal')).toBeInTheDocument();
      expect(screen.getByTestId('edit-prompt-header')).toHaveTextContent('Edit Prompt');
      expect(screen.getByTestId('edit-prompt-cancel-button')).toBeInTheDocument();
    });
  });

  it('does not render when open is false', async () => {
    await act(async () => {
      render(<PromptModal {...defaultProps} open={false} />);
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('edit-prompt-modal')).not.toBeInTheDocument();
    });
  });

  it('does not render when prompt is null', async () => {
    await act(async () => {
      render(<PromptModal {...defaultProps} prompt={null} />);
    });
    
    await waitFor(() => {
      expect(screen.queryByTestId('edit-prompt-modal')).not.toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = jest.fn();
    await act(async () => {
      render(<PromptModal {...defaultProps} onCancel={onCancel} />);
    });
    
    await waitFor(() => {
      screen.getByTestId('edit-prompt-cancel-button').click();
    });
    
    expect(onCancel).toHaveBeenCalled();
  });
});