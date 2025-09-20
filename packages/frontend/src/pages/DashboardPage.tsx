import type { Project } from '@prompt-kitchen/shared';
import { toKebabCase } from '@prompt-kitchen/shared/src/helpers/toKebabCase';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';
import { ProjectModal } from '../components/ProjectModal';
import { useApiClient } from '../hooks/useApiClient';

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
      } | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const apiClient = useApiClient();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await apiClient.request<Project[]>('/projects');
        setProjects(data);
      } catch (err) {
        setError('Failed to fetch projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [apiClient]);

  const handleProjectCreated = (project: Project) => {
    setProjects([project, ...projects]);
    navigate(`/projects/${project.id}`);
  };

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const handleProjectUpdated = (updated: Project) => {
    setProjects(projects.map(p => (p.id === updated.id ? updated : p)));
  };

  const handleDelete = async (projectId: string) => {
    setConfirmModal({
      open: true,
      message: 'Are you sure you want to delete this project?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await apiClient.request(`/projects/${projectId}`, { method: 'DELETE' });
          setProjects(projects.filter(p => p.id !== projectId));
        } catch {
          setErrorAlert('Failed to delete project');
        }
      },
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold" data-testid="dashboard-title">Dashboard</h1>
        <button
          className="bg-primary hover:opacity-90 text-white py-2 px-4 rounded"
          onClick={() => setShowModal(true)}
          data-testid="dashboard-new-project-button"
        >
          New Project
        </button>
      </div>

      <ProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onProjectCreated={handleProjectCreated}
      />

      <ProjectModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        project={selectedProject}
        onProjectUpdated={handleProjectUpdated}
      />

      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <ul className="space-y-4">
          {projects.map((project) => (
            <li
              key={project.id}
              role="button"
              tabIndex={0}
              className="relative group block p-6 w-full text-left bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}`)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/projects/${project.id}`); }}
              aria-label={`Go to project ${project.name}`}
              data-testid={`project-list-item-${toKebabCase(project.name)}`}
            >
              <div>
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{project.name}</h5>
                <p className="font-normal text-gray-700">{project.description || 'No description'}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="bg-btn-subtle hover:bg-btn-subtle-hover text-text-secondary py-1 px-2 rounded text-xs z-10"
                  onClick={e => { e.stopPropagation(); handleEditClick(project); }}
                  aria-label={`Edit ${project.name}`}
                  data-testid={`project-list-item-edit-button-${toKebabCase(project.name)}`}
                >
                  Edit
                </button>
                <button
                  className="bg-warning hover:opacity-90 text-white py-1 px-2 rounded text-xs z-10"
                  onClick={e => { e.stopPropagation(); handleDelete(project.id); }}
                  aria-label={`Delete ${project.name}`}
                  data-testid={`project-list-item-delete-button-${toKebabCase(project.name)}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ConfirmModal for delete confirmations */}
      {confirmModal && (
        <ConfirmModal
          open={confirmModal.open}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* ConfirmModal for error alerts */}
      {errorAlert && (
        <ConfirmModal
          open={true}
          message={errorAlert}
          onConfirm={() => setErrorAlert(null)}
          onCancel={() => setErrorAlert(null)}
        />
      )}
    </div>
  );
}
