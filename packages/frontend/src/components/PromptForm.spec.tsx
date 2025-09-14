import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { PromptForm } from './PromptForm';
import { useApiClient } from '../hooks/useApiClient';

jest.mock('../hooks/useApiClient');

const mockModels = [
  { id: '1', name: 'gpt-3.5', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'gpt-4', isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

describe('PromptForm', () => {
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
});
