import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CreatePromptForm } from './CreatePromptForm';

describe('CreatePromptForm', () => {
  const mockOnPromptCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<CreatePromptForm projectId="1" onPromptCreated={mockOnPromptCreated} />);

    expect(screen.getByLabelText('Prompt Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Prompt Text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Prompt' })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<CreatePromptForm projectId="1" onPromptCreated={mockOnPromptCreated} />);

    const nameInput = screen.getByLabelText('Prompt Name');
    const textInput = screen.getByLabelText('Prompt Text');
    const submitButton = screen.getByRole('button', { name: 'Create Prompt' });

    fireEvent.change(nameInput, { target: { value: 'Test Prompt' } });
    fireEvent.change(textInput, { target: { value: 'Test prompt content' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnPromptCreated).toHaveBeenCalledWith({
        projectId: '1',
        name: 'Test Prompt',
        prompt: 'Test prompt content',
      });
    });
  });

  it('disables submit button when fields are empty', () => {
    render(<CreatePromptForm projectId="1" onPromptCreated={mockOnPromptCreated} />);

    const submitButton = screen.getByRole('button', { name: 'Create Prompt' });
    expect(submitButton).toBeDisabled();
  });

  it('disables submit button when only name is filled', () => {
    render(<CreatePromptForm projectId="1" onPromptCreated={mockOnPromptCreated} />);

    const nameInput = screen.getByLabelText('Prompt Name');
    const submitButton = screen.getByRole('button', { name: 'Create Prompt' });

    fireEvent.change(nameInput, { target: { value: 'Test Prompt' } });
    expect(submitButton).toBeDisabled();
  });

  it('disables submit button when only text is filled', () => {
    render(<CreatePromptForm projectId="1" onPromptCreated={mockOnPromptCreated} />);

    const textInput = screen.getByLabelText('Prompt Text');
    const submitButton = screen.getByRole('button', { name: 'Create Prompt' });

    fireEvent.change(textInput, { target: { value: 'Test prompt content' } });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when both fields are filled', () => {
    render(<CreatePromptForm projectId="1" onPromptCreated={mockOnPromptCreated} />);

    const nameInput = screen.getByLabelText('Prompt Name');
    const textInput = screen.getByLabelText('Prompt Text');
    const submitButton = screen.getByRole('button', { name: 'Create Prompt' });

    fireEvent.change(nameInput, { target: { value: 'Test Prompt' } });
    fireEvent.change(textInput, { target: { value: 'Test prompt content' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('shows error message when creation fails', async () => {
    const failingOnPromptCreated = jest.fn().mockRejectedValue(new Error('Creation failed'));
    render(<CreatePromptForm projectId="1" onPromptCreated={failingOnPromptCreated} />);

    const nameInput = screen.getByLabelText('Prompt Name');
    const textInput = screen.getByLabelText('Prompt Text');
    const submitButton = screen.getByRole('button', { name: 'Create Prompt' });

    fireEvent.change(nameInput, { target: { value: 'Test Prompt' } });
    fireEvent.change(textInput, { target: { value: 'Test prompt content' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to create prompt')).toBeInTheDocument();
    });
  });

  it('resets form after successful creation', async () => {
    render(<CreatePromptForm projectId="1" onPromptCreated={mockOnPromptCreated} />);

    const nameInput = screen.getByLabelText('Prompt Name');
    const textInput = screen.getByLabelText('Prompt Text');
    const submitButton = screen.getByRole('button', { name: 'Create Prompt' });

    fireEvent.change(nameInput, { target: { value: 'Test Prompt' } });
    fireEvent.change(textInput, { target: { value: 'Test prompt content' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnPromptCreated).toHaveBeenCalled();
    });

    // Form should be reset
    expect(nameInput).toHaveValue('');
    expect(textInput).toHaveValue('');
    expect(submitButton).toBeDisabled();
  });
});
