import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as useApiClientModule from '../hooks/useApiClient';
import { createMockApiClient } from '../mocks/ApiClient';
import { CreateProjectModal } from './CreateProjectModal';

const mockOnClose = jest.fn();
const mockOnProjectCreated = jest.fn();

describe('CreateProjectModal', () => {
  let mockApiClient: ReturnType<typeof createMockApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient = createMockApiClient();
    jest.spyOn(useApiClientModule, 'useApiClient').mockReturnValue(mockApiClient);
  });

  it('renders when open', () => {
    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} onProjectCreated={mockOnProjectCreated} />
    );
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <CreateProjectModal isOpen={false} onClose={mockOnClose} onProjectCreated={mockOnProjectCreated} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClose when cancel is clicked', () => {
    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} onProjectCreated={mockOnProjectCreated} />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('submits form and calls onProjectCreated', async () => {
    mockApiClient.request = jest.fn().mockResolvedValue({ id: '1', name: 'Test', description: 'Desc' });
    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} onProjectCreated={mockOnProjectCreated} />
    );
    fireEvent.change(screen.getByLabelText('Project Name', { selector: 'input' }), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Description', { selector: 'textarea' }), { target: { value: 'Desc' } });
    fireEvent.click(screen.getByText('Create'));
    await waitFor(() => expect(mockOnProjectCreated).toHaveBeenCalledWith({ id: '1', name: 'Test', description: 'Desc' }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows error on API failure', async () => {
    mockApiClient.request = jest.fn().mockRejectedValue(new Error('fail'));
    render(
      <CreateProjectModal isOpen={true} onClose={mockOnClose} onProjectCreated={mockOnProjectCreated} />
    );
    fireEvent.change(screen.getByLabelText('Project Name', { selector: 'input' }), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText('Create'));
    await waitFor(() => expect(screen.getByText('Failed to create project')).toBeInTheDocument());
  });
});
