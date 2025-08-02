import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ApiClient } from '../ApiClient';
import { DashboardPage } from './DashboardPage';

// Mock the ApiClient
jest.mock('../ApiClient');

describe('DashboardPage', () => {
  it('renders a loading state initially', () => {
    jest.spyOn(ApiClient, 'request').mockReturnValueOnce(new Promise(() => {})); // Never resolves
    render(<DashboardPage />, { wrapper: MemoryRouter });
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  it('renders an error message if fetching projects fails', async () => {
    jest.spyOn(ApiClient, 'request').mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<DashboardPage />, { wrapper: MemoryRouter });
    expect(await screen.findByText('Failed to fetch projects')).toBeInTheDocument();
  });

  it('renders a list of projects when fetching is successful', async () => {
    const mockProjects = [
      { id: '1', name: 'Project 1', description: 'Description 1', createdAt: new Date(), updatedAt: new Date(), userId: '1' },
      { id: '2', name: 'Project 2', description: 'Description 2', createdAt: new Date(), updatedAt: new Date(), userId: '1' },
    ];
    jest.spyOn(ApiClient, 'request').mockResolvedValueOnce(mockProjects);
    render(<DashboardPage />, { wrapper: MemoryRouter });

    expect(await screen.findByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('renders a "New Project" button', () => {
    render(<DashboardPage />, { wrapper: MemoryRouter });
    expect(screen.getByRole('button', { name: /New Project/i })).toBeInTheDocument();
  });
});
