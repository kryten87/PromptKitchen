import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as useApiClientModule from '../hooks/useApiClient';
import { createMockApiClient } from '../mocks/ApiClient';
import { ProjectModal } from './ProjectModal';

const mockOnClose = jest.fn();
const mockOnProjectCreated = jest.fn();
const mockOnProjectUpdated = jest.fn();

describe('ProjectModal', () => {
  let mockApiClient: ReturnType<typeof createMockApiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient = createMockApiClient();
    jest.spyOn(useApiClientModule, 'useApiClient').mockReturnValue(mockApiClient);
  });

  describe('Create mode', () => {
    it('renders when open', () => {
      render(
        <ProjectModal isOpen={true} onClose={mockOnClose} onProjectCreated={mockOnProjectCreated} />
      );
      expect(screen.getByText('Create New Project')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      const { container } = render(
        <ProjectModal isOpen={false} onClose={mockOnClose} onProjectCreated={mockOnProjectCreated} />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('calls onClose when cancel is clicked', () => {
      render(
        <ProjectModal isOpen={true} onClose={mockOnClose} onProjectCreated={mockOnProjectCreated} />
      );
      fireEvent.click(screen.getByText('Cancel'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('submits form and calls onProjectCreated', async () => {
      mockApiClient.request = jest.fn().mockResolvedValue({ 
        id: '1', 
        userId: 'user1',
        name: 'Test', 
        description: 'Desc',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      render(
        <ProjectModal isOpen={true} onClose={mockOnClose} onProjectCreated={mockOnProjectCreated} />
      );
      fireEvent.change(screen.getByLabelText('Project Name', { selector: 'input' }), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText('Description', { selector: 'textarea' }), { target: { value: 'Desc' } });
      fireEvent.click(screen.getByText('Create'));
      await waitFor(() => expect(mockOnProjectCreated).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test', description: 'Desc' })));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('shows error on API failure', async () => {
      mockApiClient.request = jest.fn().mockRejectedValue(new Error('fail'));
      render(
        <ProjectModal isOpen={true} onClose={mockOnClose} onProjectCreated={mockOnProjectCreated} />
      );
      fireEvent.change(screen.getByLabelText('Project Name', { selector: 'input' }), { target: { value: 'Test' } });
      fireEvent.click(screen.getByText('Create'));
      await waitFor(() => expect(screen.getByText('Failed to create project')).toBeInTheDocument());
    });
  });

  describe('Edit mode', () => {
    const mockProject = { 
      id: '1', 
      userId: 'user1',
      name: 'Existing Project', 
      description: 'Existing description',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('renders when open with project', () => {
      render(
        <ProjectModal isOpen={true} onClose={mockOnClose} project={mockProject} onProjectUpdated={mockOnProjectUpdated} />
      );
      expect(screen.getByText('Edit Project')).toBeInTheDocument();
    });

    it('does not render when project is null', () => {
      const { container } = render(
        <ProjectModal isOpen={true} onClose={mockOnClose} project={null} onProjectUpdated={mockOnProjectUpdated} />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('pre-fills form with project data', () => {
      render(
        <ProjectModal isOpen={true} onClose={mockOnClose} project={mockProject} onProjectUpdated={mockOnProjectUpdated} />
      );
      expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
    });

    it('submits form and calls onProjectUpdated', async () => {
      mockApiClient.request = jest.fn().mockResolvedValue({ 
        id: '1', 
        userId: 'user1',
        name: 'Updated', 
        description: 'Updated desc',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      render(
        <ProjectModal isOpen={true} onClose={mockOnClose} project={mockProject} onProjectUpdated={mockOnProjectUpdated} />
      );
      fireEvent.change(screen.getByLabelText('Project Name', { selector: 'input' }), { target: { value: 'Updated' } });
      fireEvent.change(screen.getByLabelText('Description', { selector: 'textarea' }), { target: { value: 'Updated desc' } });
      fireEvent.click(screen.getByText('Save'));
      await waitFor(() => expect(mockOnProjectUpdated).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated', description: 'Updated desc' })));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('shows error on API failure', async () => {
      mockApiClient.request = jest.fn().mockRejectedValue(new Error('fail'));
      render(
        <ProjectModal isOpen={true} onClose={mockOnClose} project={mockProject} onProjectUpdated={mockOnProjectUpdated} />
      );
      fireEvent.click(screen.getByText('Save'));
      await waitFor(() => expect(screen.getByText('Failed to update project')).toBeInTheDocument());
    });
  });
});