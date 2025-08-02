import type { Project, Prompt } from '@prompt-kitchen/shared/src/dtos';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApiClient } from '../hooks/useApiClient';

export function ProjectPage() {
  const { projectId } = useParams();
  const apiClient = useApiClient();
  const [project, setProject] = useState<Project | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }
    setLoading(true);
    Promise.all([
      apiClient.request<Project>(`/projects/${projectId}`),
      apiClient.request<Prompt[]>(`/projects/${projectId}/prompts`),
    ])
      .then(([proj, promptList]) => {
        setProject(proj);
        setPrompts(Array.isArray(promptList) ? promptList : []);
        setError(null);
      })
      .catch(() => setError('Failed to load project or prompts'))
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
      <div className="text-gray-500 mb-6">Last Updated: {new Date(project.updatedAt).toLocaleString()}</div>
      <h2 className="text-xl font-semibold mb-2">Prompts</h2>
      {prompts.length === 0 ? (
        <div className="text-gray-500">No prompts found for this project.</div>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white rounded shadow">
          {prompts.map((prompt) => (
            <li key={prompt.id} className="p-4 hover:bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-bold text-lg">{prompt.name}</div>
                <div className="text-gray-600 text-sm truncate max-w-xl">{prompt.prompt}</div>
                <div className="text-xs text-gray-400">Prompt ID: {prompt.id}</div>
              </div>
              <div className="text-xs text-gray-400 mt-2 md:mt-0">
                Last updated: {new Date(prompt.updatedAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
