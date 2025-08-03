import type { Prompt, PromptHistory } from '@prompt-kitchen/shared/src/dtos';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as useApiClientModule from '../hooks/useApiClient';
import { createMockApiClient } from '../mocks/ApiClient';
import PromptHistoryModal from './PromptHistoryModal';

const mockOnClose = jest.fn();
const mockOnPromptRestored = jest.fn();

describe('PromptHistoryModal', () => {
  let mockApiClient: ReturnType<typeof createMockApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient = createMockApiClient();
    jest.spyOn(useApiClientModule, 'useApiClient').mockReturnValue(mockApiClient);
  });

  const mockPrompt: Prompt = {
    id: 'prompt-1',
    projectId: 'project-1',
    name: 'Test Prompt',
    prompt: 'Current prompt text',
    version: 3,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-03'),
  };

  const mockHistory: PromptHistory[] = [
    {
      id: 'h3',
      promptId: 'prompt-1',
      prompt: 'Current prompt text',
      version: 3,
      createdAt: new Date('2023-01-03'),
    },
    {
      id: 'h2',
      promptId: 'prompt-1',
      prompt: 'Second version text',
      version: 2,
      createdAt: new Date('2023-01-02'),
    },
    {
      id: 'h1',
      promptId: 'prompt-1',
      prompt: 'First version text',
      version: 1,
      createdAt: new Date('2023-01-01'),
    },
  ];

  it('does not render when closed', () => {
    const { container } = render(
      <PromptHistoryModal
        isOpen={false}
        onClose={mockOnClose}
        prompt={mockPrompt}
        onPromptRestored={mockOnPromptRestored}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal when open and loads history', async () => {
    mockApiClient.request = jest.fn().mockResolvedValue(mockHistory);

    render(
      <PromptHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        prompt={mockPrompt}
        onPromptRestored={mockOnPromptRestored}
      />
    );

    expect(screen.getByText('Prompt History')).toBeInTheDocument();
    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('Current Version: 3')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/prompts/prompt-1/history');
    });

    expect(screen.getByText('Version 3')).toBeInTheDocument();
    expect(screen.getByText('Version 2')).toBeInTheDocument();
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('shows loading state while fetching history', () => {
    mockApiClient.request = jest.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <PromptHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        prompt={mockPrompt}
        onPromptRestored={mockOnPromptRestored}
      />
    );

    expect(screen.getByText('Loading history...')).toBeInTheDocument();
  });

  it('shows error when history loading fails', async () => {
    mockApiClient.request = jest.fn().mockRejectedValue(new Error('API Error'));

    render(
      <PromptHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        prompt={mockPrompt}
        onPromptRestored={mockOnPromptRestored}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load prompt history')).toBeInTheDocument();
    });
  });

  it('shows empty state when no history is found', async () => {
    mockApiClient.request = jest.fn().mockResolvedValue([]);

    render(
      <PromptHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        prompt={mockPrompt}
        onPromptRestored={mockOnPromptRestored}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No history found')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    mockApiClient.request = jest.fn().mockResolvedValue(mockHistory);

    render(
      <PromptHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        prompt={mockPrompt}
        onPromptRestored={mockOnPromptRestored}
      />
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Version 3')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', async () => {
    mockApiClient.request = jest.fn().mockResolvedValue(mockHistory);

    render(
      <PromptHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        prompt={mockPrompt}
        onPromptRestored={mockOnPromptRestored}
      />
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Version 3')).toBeInTheDocument();
    });

    const xButton = screen.getByText('✕');
    fireEvent.click(xButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('restores prompt from history when restore button is clicked', async () => {
    const restoredPrompt = { ...mockPrompt, prompt: 'Second version text', version: 4 };
    mockApiClient.request = jest.fn()
      .mockResolvedValueOnce(mockHistory) // Initial history load
      .mockResolvedValueOnce(restoredPrompt); // Restore call

    render(
      <PromptHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        prompt={mockPrompt}
        onPromptRestored={mockOnPromptRestored}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Version 2')).toBeInTheDocument();
    });

    const restoreButtons = screen.getAllByText('Restore');
    fireEvent.click(restoreButtons[0]); // First restore button (version 2)

    expect(screen.getByText('Restoring...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/prompts/prompt-1/restore', {
        method: 'POST',
        body: JSON.stringify({ version: 2 }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await waitFor(() => {
      expect(mockOnPromptRestored).toHaveBeenCalledWith(restoredPrompt);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error when restore fails', async () => {
    mockApiClient.request = jest.fn()
      .mockResolvedValueOnce(mockHistory) // Initial history load
      .mockRejectedValueOnce(new Error('Restore failed')); // Restore call fails

    render(
      <PromptHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        prompt={mockPrompt}
        onPromptRestored={mockOnPromptRestored}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Version 2')).toBeInTheDocument();
    });

    const restoreButtons = screen.getAllByText('Restore');
    fireEvent.click(restoreButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Failed to restore prompt from history')).toBeInTheDocument();
    });

    expect(mockOnPromptRestored).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('displays current version badge correctly', async () => {
    mockApiClient.request = jest.fn().mockResolvedValue(mockHistory);

    render(
      <PromptHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        prompt={mockPrompt}
        onPromptRestored={mockOnPromptRestored}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Version 3')).toBeInTheDocument();
    });

    // Current version should have "Current" badge and no restore button
    const currentVersionEntry = screen.getByText('Version 3').closest('.border');
    expect(currentVersionEntry).toContainElement(screen.getByText('Current'));

    // Other versions should have restore buttons
    const version2Entry = screen.getByText('Version 2').closest('.border');
    const version1Entry = screen.getByText('Version 1').closest('.border');

    expect(version2Entry).toContainElement(screen.getAllByText('Restore')[0]);
    expect(version1Entry).toContainElement(screen.getAllByText('Restore')[1]);
  });

  it('disables buttons while restoring', async () => {
    mockApiClient.request = jest.fn()
      .mockResolvedValueOnce(mockHistory)
      .mockImplementation(() => new Promise(() => {})); // Never resolves restore

    render(
      <PromptHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        prompt={mockPrompt}
        onPromptRestored={mockOnPromptRestored}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Version 2')).toBeInTheDocument();
    });

    const restoreButton = screen.getAllByText('Restore')[0];
    fireEvent.click(restoreButton);

    // All buttons should be disabled during restore
    expect(screen.getByText('Close')).toBeDisabled();
    expect(screen.getByText('✕')).toBeDisabled();
    expect(screen.getByText('Restoring...')).toBeDisabled();
  });

  it('formats dates correctly', async () => {
    mockApiClient.request = jest.fn().mockResolvedValue(mockHistory);

    render(
      <PromptHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        prompt={mockPrompt}
        onPromptRestored={mockOnPromptRestored}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Version 3')).toBeInTheDocument();
    });

    // Check that dates are formatted (exact format may vary by locale)
    const dateElements = screen.getAllByText(/\/.*\/.*,/); // Matches typical date format
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('handles null prompt gracefully', () => {
    render(
      <PromptHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        prompt={null}
        onPromptRestored={mockOnPromptRestored}
      />
    );

    expect(screen.getByText('Prompt History')).toBeInTheDocument();
    expect(mockApiClient.request).not.toHaveBeenCalled();
  });

  it('displays prompt text with proper formatting', async () => {
    const historyWithLongText = [
      {
        id: 'h1',
        promptId: 'prompt-1',
        prompt: 'This is a long prompt text with\nmultiple lines\nand special characters: {{variable}}',
        version: 1,
        createdAt: new Date('2023-01-01'),
      },
    ];

    mockApiClient.request = jest.fn().mockResolvedValue(historyWithLongText);

    render(
      <PromptHistoryModal
        isOpen={true}
        onClose={mockOnClose}
        prompt={mockPrompt}
        onPromptRestored={mockOnPromptRestored}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/This is a long prompt text with/)).toBeInTheDocument();
    });

    // Check that the text is displayed in a monospace font container
    const promptTextContainer = screen.getByText(/This is a long prompt text with/).closest('.font-mono');
    expect(promptTextContainer).toBeInTheDocument();
  });
});
