import { Project } from '@prompt-kitchen/shared/src/dtos';
import { ProjectRepository } from '../repositories/ProjectRepository';

export class ProjectService {
  private readonly projectRepository: ProjectRepository;

  constructor(projectRepository: ProjectRepository) {
    this.projectRepository = projectRepository;
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projectRepository.getById(id);
  }

  async getProjectsForUser(userId: string): Promise<Project[]> {
    return this.projectRepository.getAllByUserId(userId);
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return this.projectRepository.create(project);
  }

  async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'userId' | 'createdAt'>>): Promise<Project | null> {
    return this.projectRepository.update(id, updates);
  }

  async deleteProject(id: string): Promise<void> {
    return this.projectRepository.delete(id);
  }
}
