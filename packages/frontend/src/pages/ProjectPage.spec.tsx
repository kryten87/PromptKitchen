import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as useApiClientModule from '../hooks/useApiClient';
import { createMockApiClient } from '../mocks/ApiClient';
import { SessionProvider } from '../providers/SessionProvider';
import { ProjectPage } from './ProjectPage';

describe('ProjectPage', () => {
  let mockApiClient: ReturnType<typeof createMockApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient = createMockApiClient();
    jest.spyOn(useApiClientModule, 'useApiClient').mockReturnValue(mockApiClient);
  });

  const mockProject = {
    id: '1',
    name: 'Test Project',
    description: 'A test project',
    userId: 'u1',
    createdAt: new Date('2023-01-01').toISOString(),
    updatedAt: new Date('2023-01-02').toISOString(),
  };

  const mockPrompts = [
    {
      id: 'p1',
      projectId: '1',
      name: 'Prompt 1',
      prompt: 'Write a poem about AI.',
      version: 1,
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date('2023-01-02').toISOString(),
    },
    {
      id: 'p2',
      projectId: '1',
      name: 'Prompt 2',
      prompt: 'Summarize this text.',
      version: 1,
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date('2023-01-02').toISOString(),
    },
  ];

  const renderProjectPage = () => {
    return render(
      <SessionProvider>
        <MemoryRouter initialEntries={['/projects/1']}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectPage />} />
          </Routes>
        </MemoryRouter>
      </SessionProvider>
    );
  };

  it('renders project details and prompts', async () => {
    mockApiClient.request = jest.fn()
      .mockImplementation((path: string) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts') return Promise.resolve(mockPrompts);
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();

    expect(await screen.findByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A test project')).toBeInTheDocument();
    expect(screen.getByText('Project ID: 1')).toBeInTheDocument();
    expect(await screen.findByText('Prompt 1')).toBeInTheDocument();
    expect(screen.getByText('Prompt 2')).toBeInTheDocument();
    expect(screen.getByText('Write a poem about AI.')).toBeInTheDocument();
    expect(screen.getByText('Summarize this text.')).toBeInTheDocument();
  });

  it('shows create new prompt button', async () => {
    mockApiClient.request = jest.fn()
      .mockImplementation((path: string) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts') return Promise.resolve(mockPrompts);
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();

    expect(await screen.findByRole('button', { name: 'Create New Prompt' })).toBeInTheDocument();
  });

  it('shows edit and delete buttons for each prompt', async () => {
    mockApiClient.request = jest.fn()
      .mockImplementation((path: string) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts') return Promise.resolve(mockPrompts);
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();

    await screen.findByText('Prompt 1');

    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('shows create prompt modal when create new prompt is clicked', async () => {
    mockApiClient.request = jest.fn()
      .mockImplementation((path: string) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts') return Promise.resolve(mockPrompts);
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();

    const createButton = await screen.findByRole('button', { name: 'Create New Prompt' });
    fireEvent.click(createButton);

    expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Create New Prompt' })).toBeInTheDocument();
    expect(screen.getByLabelText('Prompt Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Prompt Text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Prompt' })).toBeInTheDocument();
  });

  it('shows prompt editor when edit prompt is clicked', async () => {
    mockApiClient.request = jest.fn()
      .mockImplementation((path: string) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts') return Promise.resolve(mockPrompts);
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();

    await screen.findByText('Prompt 1');
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByDisplayValue('Prompt 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Write a poem about AI.')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('creates a new prompt successfully', async () => {
    const newPrompt = {
      id: 'p3',
      projectId: '1',
      name: 'New Prompt',
      prompt: 'New prompt text',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockApiClient.request = jest.fn()
      .mockImplementation((path: string, options?: { method?: string; body?: string; headers?: Record<string, string> }) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts' && !options) return Promise.resolve(mockPrompts);
        if (path === '/projects/1/prompts' && options?.method === 'POST') return Promise.resolve(newPrompt);
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();

    const createButton = await screen.findByRole('button', { name: 'Create New Prompt' });
    fireEvent.click(createButton);

    // Wait for modal to open
    await screen.findByTestId('create-prompt-modal');

    const nameInput = screen.getByLabelText('Prompt Name');
    const textInput = screen.getByLabelText('Prompt Text');
    const createPromptButton = screen.getByText('Create Prompt');

    fireEvent.change(nameInput, { target: { value: 'New Prompt' } });
    fireEvent.change(textInput, { target: { value: 'New prompt text' } });
    fireEvent.click(createPromptButton);

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/projects/1/prompts', {
        method: 'POST',
        body: JSON.stringify({
          projectId: '1',
          name: 'New Prompt',
          prompt: 'New prompt text',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    // Modal should close after successful creation
    await waitFor(() => {
      expect(screen.queryByTestId('create-prompt-modal')).not.toBeInTheDocument();
    });
  });

  it('deletes a prompt with confirmation', async () => {
    mockApiClient.request = jest.fn()
      .mockImplementation((path: string) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts') return Promise.resolve(mockPrompts);
        if (path === '/prompts/p1') return Promise.resolve(); // DELETE
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();
    await screen.findByText('Prompt 1');
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    // ConfirmModal should appear
    expect(screen.getByText('Are you sure you want to delete this prompt?')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('confirm-yes'));
    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/prompts/p1', { method: 'DELETE' });
    });
  });

  it('cancels delete when user declines confirmation', async () => {
    mockApiClient.request = jest.fn()
      .mockImplementation((path: string) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts') return Promise.resolve(mockPrompts);
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();
    await screen.findByText('Prompt 1');
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    // ConfirmModal should appear
    expect(screen.getByText('Are you sure you want to delete this prompt?')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('confirm-no'));
    // DELETE should not be called
    expect(mockApiClient.request).not.toHaveBeenCalledWith('/prompts/p1', { method: 'DELETE' });
  });

  it('shows cancel button in modal and hides modal when clicked', async () => {
    mockApiClient.request = jest.fn()
      .mockImplementation((path: string) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts') return Promise.resolve(mockPrompts);
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();

    const createButton = await screen.findByRole('button', { name: 'Create New Prompt' });
    fireEvent.click(createButton);

    const cancelButton = screen.getByTestId('create-prompt-cancel-button');
    fireEvent.click(cancelButton);

    expect(screen.queryByTestId('create-prompt-modal')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Create New Prompt' })).not.toBeInTheDocument();
  });

  it('shows no prompts message when prompts list is empty', async () => {
    mockApiClient.request = jest.fn()
      .mockImplementation((path: string) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts') return Promise.resolve([]);
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();

    expect(await screen.findByText('No prompts found for this project.')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    mockApiClient.request = jest.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

    renderProjectPage();

    expect(screen.getByText('Loading project...')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockApiClient.request = jest.fn().mockRejectedValue(new Error('API Error'));

    renderProjectPage();

    expect(await screen.findByText('Failed to load project or prompts')).toBeInTheDocument();
  });

  it('opens history modal when view history is clicked', async () => {
    const mockHistory = [
      {
        id: 'h1',
        promptId: 'p1',
        prompt: 'Write a poem about AI.',
        version: 1,
        createdAt: new Date('2023-01-01'),
      },
    ];

    mockApiClient.request = jest.fn()
      .mockImplementation((path: string) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts') return Promise.resolve(mockPrompts);
        if (path === '/prompts/p1/history') return Promise.resolve(mockHistory);
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();

    await screen.findByText('Prompt 1');
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    const viewHistoryButton = screen.getByText('View History');
    fireEvent.click(viewHistoryButton);

    // Check that the history modal opens
    expect(await screen.findByText('Prompt History')).toBeInTheDocument();
    expect(screen.getByText('Current Version: 1')).toBeInTheDocument();
  });

  it('restores prompt from history and updates the editor', async () => {
    const mockHistory = [
      {
        id: 'h2',
        promptId: 'p1',
        prompt: 'Updated poem prompt.',
        version: 2,
        createdAt: new Date('2023-01-02'),
      },
      {
        id: 'h1',
        promptId: 'p1',
        prompt: 'Original poem prompt.',
        version: 1,
        createdAt: new Date('2023-01-01'),
      },
    ];

    // Mock prompt with version 2 to make version 1 restorable
    const currentMockPrompts = [
      {
        ...mockPrompts[0],
        version: 2,
        prompt: 'Updated poem prompt.',
      },
      mockPrompts[1],
    ];

    const restoredPrompt = {
      ...mockPrompts[0],
      prompt: 'Original poem prompt.',
      version: 3, // New version after restore
    };

    mockApiClient.request = jest.fn()
      .mockImplementation((path: string, options?: { method?: string; body?: string; headers?: Record<string, string> }) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts') return Promise.resolve(currentMockPrompts);
        if (path === '/prompts/p1/history') return Promise.resolve(mockHistory);
        if (path === '/prompts/p1/restore' && options?.method === 'POST') return Promise.resolve(restoredPrompt);
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();

    await screen.findByText('Prompt 1');
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    const viewHistoryButton = screen.getByText('View History');
    fireEvent.click(viewHistoryButton);

    // Wait for history modal to load
    await screen.findByText('Prompt History');

    // Should only have one restore button for version 1 (since current is version 2)
    const restoreButtons = screen.getAllByText('Restore');
    fireEvent.click(restoreButtons[0]); // Should restore version 1

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/prompts/p1/restore', {
        method: 'POST',
        body: JSON.stringify({ version: 1 }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    // Modal should close and prompt should be updated
    await waitFor(() => {
      expect(screen.queryByText('Prompt History')).not.toBeInTheDocument();
    });
  });
});
