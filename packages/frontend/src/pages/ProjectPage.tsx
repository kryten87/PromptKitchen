import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApiClient } from '../hooks/useApiClient';
import type { Project } from '@prompt-kitchen/shared/src/dtos';

export function ProjectPage() {
  const { projectId } = useParams();
  const apiClient = useApiClient();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    apiClient.request<Project>(`/projects/${projectId}`)
      .then(setProject)
      .catch(() => setError('Failed to load project'))
      .finally(() => setLoading(false));
  }, [apiClient, projectId]);

  if (loading) return <div className="p-4">Loading project...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!project) return <div className="p-4">Project not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
      <p className="mb-4 text-gray-700">{project.description || 'No description'}</p>
      <div className="text-gray-500">Project ID: {project.id}</div>
      <div className="text-gray-500">Created: {new Date(project.createdAt).toLocaleString()}</div>
      <div className="text-gray-500">Last Updated: {new Date(project.updatedAt).toLocaleString()}</div>
    </div>
  );
}
