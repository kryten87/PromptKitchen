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
});
