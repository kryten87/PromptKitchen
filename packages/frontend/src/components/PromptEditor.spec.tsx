import type { Prompt } from '@prompt-kitchen/shared/src/dtos';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as useApiClientModule from '../hooks/useApiClient';
import { createMockApiClient } from '../mocks/ApiClient';
import { PromptEditor } from './PromptEditor';

const mockOnPromptUpdated = jest.fn();
const mockOnViewHistory = jest.fn();

describe('PromptEditor', () => {
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
    prompt: 'Hello {{name}}!',
    version: 1,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  };

  it('renders placeholder when no prompt is provided', () => {
    render(
      <PromptEditor
        prompt={null}
        onPromptUpdated={mockOnPromptUpdated}
        onViewHistory={mockOnViewHistory}
      />
    );

    expect(screen.getByText('Select a prompt to edit')).toBeInTheDocument();
  });

  it('renders prompt details when prompt is provided', () => {
    render(
      <PromptEditor
        prompt={mockPrompt}
        onPromptUpdated={mockOnPromptUpdated}
        onViewHistory={mockOnViewHistory}
      />
    );

    expect(screen.getByText('Edit Prompt')).toBeInTheDocument();
    expect(screen.getByText(/Version 1/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Prompt')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello {{name}}!')).toBeInTheDocument();
  });

  it('enables save button when changes are made', () => {
    render(
      <PromptEditor
        prompt={mockPrompt}
        onPromptUpdated={mockOnPromptUpdated}
        onViewHistory={mockOnViewHistory}
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();

    const nameInput = screen.getByLabelText('Prompt Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Prompt' } });

    expect(saveButton).toBeEnabled();
  });

  it('disables save button when name is empty', () => {
    render(
      <PromptEditor
        prompt={mockPrompt}
        onPromptUpdated={mockOnPromptUpdated}
        onViewHistory={mockOnViewHistory}
      />
    );

    const nameInput = screen.getByLabelText('Prompt Name');
    fireEvent.change(nameInput, { target: { value: '' } });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
  });

  it('disables save button when prompt text is empty', () => {
    render(
      <PromptEditor
        prompt={mockPrompt}
        onPromptUpdated={mockOnPromptUpdated}
        onViewHistory={mockOnViewHistory}
      />
    );

    const promptTextarea = screen.getByLabelText('Prompt Text');
    fireEvent.change(promptTextarea, { target: { value: '' } });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
  });

  it('saves prompt successfully and shows success message', async () => {
    const updatedPrompt = { ...mockPrompt, name: 'Updated Prompt', version: 2 };
    mockApiClient.request = jest.fn().mockResolvedValue(updatedPrompt);

    render(
      <PromptEditor
        prompt={mockPrompt}
        onPromptUpdated={mockOnPromptUpdated}
        onViewHistory={mockOnViewHistory}
      />
    );

    const nameInput = screen.getByLabelText('Prompt Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Prompt' } });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/prompts/prompt-1', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Prompt',
          prompt: 'Hello {{name}}!',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Prompt saved successfully!')).toBeInTheDocument();
    });

    expect(mockOnPromptUpdated).toHaveBeenCalledWith(updatedPrompt);
  });

  it('shows error message when save fails', async () => {
    mockApiClient.request = jest.fn().mockRejectedValue(new Error('API Error'));

    render(
      <PromptEditor
        prompt={mockPrompt}
        onPromptUpdated={mockOnPromptUpdated}
        onViewHistory={mockOnViewHistory}
      />
    );

    const nameInput = screen.getByLabelText('Prompt Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Prompt' } });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save prompt')).toBeInTheDocument();
    });

    expect(mockOnPromptUpdated).not.toHaveBeenCalled();
  });

  it('calls onViewHistory when View History button is clicked', () => {
    render(
      <PromptEditor
        prompt={mockPrompt}
        onPromptUpdated={mockOnPromptUpdated}
        onViewHistory={mockOnViewHistory}
      />
    );

    const viewHistoryButton = screen.getByRole('button', { name: 'View History' });
    fireEvent.click(viewHistoryButton);

    expect(mockOnViewHistory).toHaveBeenCalled();
  });

  it('trims whitespace from name and prompt before saving', async () => {
    const updatedPrompt = { ...mockPrompt, name: 'Trimmed Name', prompt: 'Trimmed prompt' };
    mockApiClient.request = jest.fn().mockResolvedValue(updatedPrompt);

    render(
      <PromptEditor
        prompt={mockPrompt}
        onPromptUpdated={mockOnPromptUpdated}
        onViewHistory={mockOnViewHistory}
      />
    );

    const nameInput = screen.getByLabelText('Prompt Name');
    const promptTextarea = screen.getByLabelText('Prompt Text');

    fireEvent.change(nameInput, { target: { value: '  Trimmed Name  ' } });
    fireEvent.change(promptTextarea, { target: { value: '  Trimmed prompt  ' } });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/prompts/prompt-1', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Trimmed Name',
          prompt: 'Trimmed prompt',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  it('disables form fields and buttons while loading', async () => {
    mockApiClient.request = jest.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <PromptEditor
        prompt={mockPrompt}
        onPromptUpdated={mockOnPromptUpdated}
        onViewHistory={mockOnViewHistory}
      />
    );

    const nameInput = screen.getByLabelText('Prompt Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Prompt' } });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Prompt Name')).toBeDisabled();
    expect(screen.getByLabelText('Prompt Text')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'View History' })).toBeDisabled();
  });

  it('shows templating hint text', () => {
    render(
      <PromptEditor
        prompt={mockPrompt}
        onPromptUpdated={mockOnPromptUpdated}
        onViewHistory={mockOnViewHistory}
      />
    );

    expect(screen.getByText((_, element) => {
      return element?.textContent === 'Use {{variable}} syntax for dynamic templating';
    })).toBeInTheDocument();
  });

  it('displays last updated time', () => {
    render(
      <PromptEditor
        prompt={mockPrompt}
        onPromptUpdated={mockOnPromptUpdated}
        onViewHistory={mockOnViewHistory}
      />
    );

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });
});
