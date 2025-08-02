import type { Project } from '@prompt-kitchen/shared/src/dtos';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { EditProjectModal } from '../components/EditProjectModal';
import { useApiClient } from '../hooks/useApiClient';

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const apiClient = useApiClient();

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

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const handleProjectUpdated = (updated: Project) => {
    setProjects(projects.map(p => (p.id === updated.id ? updated : p)));
  };

  const handleDelete = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await apiClient.request(`/projects/${projectId}`, { method: 'DELETE' });
        setProjects(projects.filter(p => p.id !== projectId));
      } catch {
        alert('Failed to delete project');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setShowModal(true)}
        >
          New Project
        </button>
      </div>

      <CreateProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onProjectCreated={(project: Project) => setProjects([project, ...projects])}
      />

      <EditProjectModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        project={selectedProject}
        onProjectUpdated={handleProjectUpdated}
      />

      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="relative group block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
              <Link to={`/projects/${project.id}`} className="block">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{project.name}</h5>
                <p className="font-normal text-gray-700">{project.description || 'No description'}</p>
              </Link>
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => handleEditClick(project)}
                  aria-label={`Edit ${project.name}`}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:underline text-sm"
                  onClick={() => handleDelete(project.id)}
                  aria-label={`Delete ${project.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
