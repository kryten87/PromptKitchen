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

  it('shows create prompt form when create new prompt is clicked', async () => {
    mockApiClient.request = jest.fn()
      .mockImplementation((path: string) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts') return Promise.resolve(mockPrompts);
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();

    const createButton = await screen.findByRole('button', { name: 'Create New Prompt' });
    fireEvent.click(createButton);

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
  });

  it('deletes a prompt with confirmation', async () => {
    // Mock window.confirm
    window.confirm = jest.fn().mockReturnValue(true);

    mockApiClient.request = jest.fn()
      .mockImplementation((path: string, options?: { method?: string; body?: string; headers?: Record<string, string> }) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts') return Promise.resolve(mockPrompts);
        if (path === '/prompts/p1' && options?.method === 'DELETE') return Promise.resolve();
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();

    await screen.findByText('Prompt 1');
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this prompt?');

    await waitFor(() => {
      expect(mockApiClient.request).toHaveBeenCalledWith('/prompts/p1', { method: 'DELETE' });
    });
  });

  it('cancels delete when user declines confirmation', async () => {
    // Mock window.confirm to return false
    window.confirm = jest.fn().mockReturnValue(false);

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

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this prompt?');

    // DELETE should not be called
    expect(mockApiClient.request).not.toHaveBeenCalledWith('/prompts/p1', { method: 'DELETE' });
  });

  it('shows cancel button in editor and hides editor when clicked', async () => {
    mockApiClient.request = jest.fn()
      .mockImplementation((path: string) => {
        if (path === '/projects/1') return Promise.resolve(mockProject);
        if (path === '/projects/1/prompts') return Promise.resolve(mockPrompts);
        return Promise.reject(new Error('Unknown path'));
      });

    renderProjectPage();

    const createButton = await screen.findByRole('button', { name: 'Create New Prompt' });
    fireEvent.click(createButton);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByRole('heading', { name: 'Create New Prompt' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Prompt Name')).not.toBeInTheDocument();
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

  it('shows history alert when view history is clicked', async () => {
    window.alert = jest.fn();

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

    const viewHistoryButton = screen.getByText('View History');
    fireEvent.click(viewHistoryButton);

    expect(window.alert).toHaveBeenCalledWith('History modal will be implemented in task 3.4.4');
  });
});
