import type { Project } from '@prompt-kitchen/shared/src/dtos';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClient } from '../ApiClient';
import { CreateProjectModal } from '../components/CreateProjectModal';

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await ApiClient.request<Project[]>('/projects');
        setProjects(data);
      } catch (err) {
        setError('Failed to fetch projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

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

      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link to={`/projects/${project.id}`} key={project.id} className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{project.name}</h5>
              <p className="font-normal text-gray-700">{project.description || 'No description'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
