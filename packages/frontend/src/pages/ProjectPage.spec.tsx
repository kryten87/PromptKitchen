import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as useApiClientModule from '../hooks/useApiClient';
import { SessionProvider } from '../providers/SessionProvider';
import { ProjectPage } from './ProjectPage';

describe('ProjectPage', () => {
  it('renders project details', async () => {
    const mockProject = {
      id: '1',
      name: 'Test Project',
      description: 'A test project',
      userId: 'u1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    jest.spyOn(useApiClientModule, 'useApiClient').mockReturnValue({
      request: jest.fn().mockResolvedValue(mockProject),
      baseUrl: '/api',
      session: null,
    } as unknown as import('../ApiClient').ApiClient);
    render(
      <SessionProvider>
        <MemoryRouter initialEntries={[`/projects/1`]}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectPage />} />
          </Routes>
        </MemoryRouter>
      </SessionProvider>
    );
    expect(await screen.findByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A test project')).toBeInTheDocument();
    expect(screen.getByText('Project ID: 1')).toBeInTheDocument();
  });

  it('renders project details and prompts', async () => {
    const mockProject = {
      id: '1',
      name: 'Test Project',
      description: 'A test project',
      userId: 'u1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const mockPrompts = [
      {
        id: 'p1',
        projectId: '1',
        name: 'Prompt 1',
        prompt: 'Write a poem about AI.',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'p2',
        projectId: '1',
        name: 'Prompt 2',
        prompt: 'Summarize this text.',
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    jest.spyOn(useApiClientModule, 'useApiClient').mockReturnValue({
      request: jest.fn()
        .mockImplementation((path: string) => {
          if (path === '/projects/1') return Promise.resolve(mockProject);
          if (path === '/projects/1/prompts') return Promise.resolve(mockPrompts);
          return Promise.reject(new Error('Unknown path'));
        }),
      baseUrl: '/api',
      session: null,
    } as unknown as import('../ApiClient').ApiClient);
    render(
      <SessionProvider>
        <MemoryRouter initialEntries={[`/projects/1`]}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectPage />} />
          </Routes>
        </MemoryRouter>
      </SessionProvider>
    );
    expect(await screen.findByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A test project')).toBeInTheDocument();
    expect(screen.getByText('Project ID: 1')).toBeInTheDocument();
    expect(await screen.findByText('Prompt 1')).toBeInTheDocument();
    expect(screen.getByText('Prompt 2')).toBeInTheDocument();
    expect(screen.getByText('Write a poem about AI.')).toBeInTheDocument();
    expect(screen.getByText('Summarize this text.')).toBeInTheDocument();
  });
});
