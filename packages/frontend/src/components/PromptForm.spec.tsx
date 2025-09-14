import { render, waitFor, fireEvent } from '@testing-library/react';
import { PromptForm } from './PromptForm';
import { useApiClient } from '../hooks/useApiClient';

jest.mock('../hooks/useApiClient');

const mockModels = [
  { id: '1', name: 'gpt-3.5', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'gpt-4', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

describe('PromptForm', () => {
  it('renders a refresh button next to the model select', async () => {
    const getModels = jest.fn().mockResolvedValue(mockModels);
    const refreshModels = jest.fn().mockResolvedValue();
    (useApiClient as jest.Mock).mockReturnValue({ getModels, refreshModels });

    const { findByTestId } = render(<PromptForm />);
    const button = await findByTestId('model-refresh-button');
    expect(button).toBeInTheDocument();
  });

  it('calls refreshModels and then getModels when refresh button is clicked', async () => {
    const getModels = jest.fn().mockResolvedValue(mockModels);
    const refreshModels = jest.fn().mockResolvedValue();
    (useApiClient as jest.Mock).mockReturnValue({ getModels, refreshModels });

    const { findByTestId } = render(<PromptForm />);
    const button = await findByTestId('model-refresh-button');
    // Wait for initial getModels
    await waitFor(() => expect(getModels).toHaveBeenCalledTimes(1));
    getModels.mockClear();
    // Click refresh
    button.click();
    await waitFor(() => {
      expect(refreshModels).toHaveBeenCalled();
      expect(getModels).toHaveBeenCalled();
    });
  });
  it('fetches models on mount', async () => {
    const getModels = jest.fn().mockResolvedValue(mockModels);
    (useApiClient as jest.Mock).mockReturnValue({ getModels });

    render(<PromptForm />);

    await waitFor(() => {
      expect(getModels).toHaveBeenCalled();
    });
  });

  it('renders model dropdown with options', async () => {
    const getModels = jest.fn().mockResolvedValue(mockModels);
    (useApiClient as jest.Mock).mockReturnValue({ getModels });

    const { findByTestId } = render(<PromptForm />);
    const select = await findByTestId('create-prompt-model-select');
    expect(select).toBeInTheDocument();
    // Should have an option for each model
    expect(select.children.length).toBe(mockModels.length + 1); // +1 for the disabled placeholder
    expect(select.children[1].textContent).toBe('gpt-3.5');
    expect(select.children[2].textContent).toBe('gpt-4');
  });

  it('includes selected modelId in create payload', async () => {
    const getModels = jest.fn().mockResolvedValue(mockModels);
    (useApiClient as jest.Mock).mockReturnValue({ getModels });
    const onPromptCreated = jest.fn();
    const { findByTestId } = render(
      <PromptForm projectId="proj-1" onPromptCreated={onPromptCreated} />
    );
    // Wait for models to load
  const select = await findByTestId('create-prompt-model-select');
  // Select the second model
  fireEvent.change(select as HTMLSelectElement, { target: { value: mockModels[1].id } });
  // Fill in name and prompt text
  const nameInput = await findByTestId('create-prompt-name-input');
  fireEvent.change(nameInput as HTMLInputElement, { target: { value: 'Test Prompt' } });
  const textInput = await findByTestId('create-prompt-text-input');
  fireEvent.change(textInput as HTMLTextAreaElement, { target: { value: 'Prompt body' } });
  // Submit
  const submit = await findByTestId('create-prompt-submit-button');
  fireEvent.click(submit);
    await waitFor(() => {
      expect(onPromptCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          modelId: mockModels[1].id,
          name: 'Test Prompt',
          prompt: 'Prompt body',
          projectId: 'proj-1',
        })
      );
    });
  });

  it('includes selected modelId in update payload', async () => {
    const getModels = jest.fn().mockResolvedValue(mockModels);
    const request = jest.fn().mockResolvedValue({ id: 'p1', name: 'Prompt', prompt: 'Body', modelId: mockModels[1].id, version: 1, createdAt: new Date(), updatedAt: new Date() });
    (useApiClient as jest.Mock).mockReturnValue({ getModels, request });
  const prompt = { id: 'p1', name: 'Prompt', prompt: 'Body', modelId: mockModels[0].id, version: 1, createdAt: new Date(), updatedAt: new Date(), projectId: 'proj-1' };
  const onPromptUpdated = jest.fn();
  const { findByTestId } = render(
    <PromptForm prompt={prompt} onPromptUpdated={onPromptUpdated} />
  );
  // Wait for models to load
  const select = await findByTestId('edit-prompt-model-select');
  // Select the second model
  fireEvent.change(select as HTMLSelectElement, { target: { value: mockModels[1].id } });
  // Change name and prompt text to trigger canSave
  const nameInput = await findByTestId('edit-prompt-name-input');
  fireEvent.change(nameInput as HTMLInputElement, { target: { value: 'Prompt' } });
  const textInput = await findByTestId('edit-prompt-text-input');
  fireEvent.change(textInput as HTMLTextAreaElement, { target: { value: 'Body' } });
  // Save (edit mode uses a button, not submit)
  const save = await findByTestId('prompt-editor-save-button');
  fireEvent.click(save);
    await waitFor(() => {
      expect(request).toHaveBeenCalledWith(
        '/prompts/p1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            name: 'Prompt',
            prompt: 'Body',
            modelId: mockModels[1].id,
          }),
          headers: expect.any(Object),
        })
      );
    });
  });

});
