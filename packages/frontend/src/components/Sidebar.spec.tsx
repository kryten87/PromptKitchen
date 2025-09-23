import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../providers/SessionProvider';
import { Sidebar } from './Sidebar';

// Mock react-router-dom to control navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the version constant
(globalThis as Record<string, unknown>).__APP_VERSION__ = '0.1.2';

describe('Sidebar', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
    mockNavigate.mockClear();
  });

  it('renders the main elements', () => {
    render(
      <SessionProvider>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </SessionProvider>
    );

    expect(screen.getByTestId('sidebar-title')).toHaveTextContent('Prompt Kitchen');
    expect(screen.getByTestId('sidebar-home-link')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-logout-button')).toBeInTheDocument();
  });

  it('displays the version number', () => {
    render(
      <SessionProvider>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </SessionProvider>
    );

    const versionElement = screen.getByTestId('sidebar-version');
    expect(versionElement).toBeInTheDocument();
    expect(versionElement).toHaveTextContent('v0.1.2');
  });

  it('handles logout correctly', () => {
    render(
      <SessionProvider>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </SessionProvider>
    );

    const logoutButton = screen.getByTestId('sidebar-logout-button');
    fireEvent.click(logoutButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders navigation links', () => {
    render(
      <SessionProvider>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </SessionProvider>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('Manage user')).toBeInTheDocument();
  });
});