import { Project } from '@prompt-kitchen/shared';
import Fastify from 'fastify';
import jwt from 'jsonwebtoken';
import { registerProjectRoutes } from './ProjectController';
import { ProjectService } from '../services/ProjectService';
import { UserService } from '../services/UserService';

describe('ProjectController', () => {
  const mockProject: Project = {
    id: 'project-1',
    userId: 'user-1',
    name: 'Test Project',
    description: 'Test Description',
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  };

  const expectedSerializedProject = {
    id: 'project-1',
    userId: 'user-1',
    name: 'Test Project',
    description: 'Test Description',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  };

  const jwtSecret = 'test-secret';
  const mockProjectService: jest.Mocked<ProjectService> = {
    getProjectById: jest.fn(),
    getProjectsForUser: jest.fn(),
    createProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
  } as unknown as jest.Mocked<ProjectService>;

  const mockUserService: jest.Mocked<UserService> = {
    verifyJwt: jest.fn(),
  } as unknown as jest.Mocked<UserService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/projects', () => {
    it('returns projects for authenticated user', async () => {
      const server = Fastify();
      const token = jwt.sign({ id: 'user-1', email: 'test@example.com', name: 'Test User' }, jwtSecret);
      
      mockUserService.verifyJwt.mockReturnValue({ id: 'user-1', email: 'test@example.com', name: 'Test User' });
      mockProjectService.getProjectsForUser.mockResolvedValue([mockProject]);

      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'GET',
        url: '/api/projects',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual([expectedSerializedProject]);
      expect(mockProjectService.getProjectsForUser).toHaveBeenCalledWith('user-1');
    });

    it('returns 401 for unauthenticated request', async () => {
      const server = Fastify();
      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'GET',
        url: '/api/projects',
      });

      expect(response.statusCode).toBe(401);
    });

    it('returns 401 when user is not attached to request', async () => {
      const server = Fastify();
      mockUserService.verifyJwt.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'GET',
        url: '/api/projects',
        headers: { Authorization: 'Bearer invalid-token' },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/projects', () => {
    it('creates a new project for authenticated user', async () => {
      const server = Fastify();
      const token = jwt.sign({ id: 'user-1', email: 'test@example.com', name: 'Test User' }, jwtSecret);
      const projectData = { name: 'New Project', description: 'New Description' };
      
      mockUserService.verifyJwt.mockReturnValue({ id: 'user-1', email: 'test@example.com', name: 'Test User' });
      mockProjectService.createProject.mockResolvedValue(mockProject);

      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'POST',
        url: '/api/projects',
        headers: { Authorization: `Bearer ${token}` },
        payload: projectData,
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual(expectedSerializedProject);
      expect(mockProjectService.createProject).toHaveBeenCalledWith({
        ...projectData,
        userId: 'user-1',
      });
    });

    it('returns 401 for unauthenticated request', async () => {
      const server = Fastify();
      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'POST',
        url: '/api/projects',
        payload: { name: 'Test Project' },
      });

      expect(response.statusCode).toBe(401);
    });

    it('returns 400 for validation errors', async () => {
      const server = Fastify();
      const token = jwt.sign({ id: 'user-1', email: 'test@example.com', name: 'Test User' }, jwtSecret);
      
      mockUserService.verifyJwt.mockReturnValue({ id: 'user-1', email: 'test@example.com', name: 'Test User' });

      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'POST',
        url: '/api/projects',
        headers: { Authorization: `Bearer ${token}` },
        payload: {}, // Missing required name field
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation failed');
      expect(body.details).toBeDefined();
    });
  });

  describe('GET /api/projects/:id', () => {
    it('returns project by id', async () => {
      const server = Fastify();
      const token = jwt.sign({ id: 'user-1', email: 'test@example.com', name: 'Test User' }, jwtSecret);
      
      mockUserService.verifyJwt.mockReturnValue({ id: 'user-1', email: 'test@example.com', name: 'Test User' });
      mockProjectService.getProjectById.mockResolvedValue(mockProject);

      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'GET',
        url: '/api/projects/project-1',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(expectedSerializedProject);
      expect(mockProjectService.getProjectById).toHaveBeenCalledWith('project-1');
    });

    it('returns 404 when project not found', async () => {
      const server = Fastify();
      const token = jwt.sign({ id: 'user-1', email: 'test@example.com', name: 'Test User' }, jwtSecret);
      
      mockUserService.verifyJwt.mockReturnValue({ id: 'user-1', email: 'test@example.com', name: 'Test User' });
      mockProjectService.getProjectById.mockResolvedValue(null);

      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'GET',
        url: '/api/projects/nonexistent',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({ error: 'Not found' });
    });

    it('returns 401 for unauthenticated request', async () => {
      const server = Fastify();
      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'GET',
        url: '/api/projects/project-1',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('updates project by id', async () => {
      const server = Fastify();
      const token = jwt.sign({ id: 'user-1', email: 'test@example.com', name: 'Test User' }, jwtSecret);
      const updates = { name: 'Updated Project', description: 'Updated Description' };
      const updatedProject = { ...mockProject, ...updates };
      const expectedUpdatedProject = { ...expectedSerializedProject, ...updates };
      
      mockUserService.verifyJwt.mockReturnValue({ id: 'user-1', email: 'test@example.com', name: 'Test User' });
      mockProjectService.updateProject.mockResolvedValue(updatedProject);

      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'PUT',
        url: '/api/projects/project-1',
        headers: { Authorization: `Bearer ${token}` },
        payload: updates,
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(expectedUpdatedProject);
      expect(mockProjectService.updateProject).toHaveBeenCalledWith('project-1', updates);
    });

    it('returns 404 when project not found', async () => {
      const server = Fastify();
      const token = jwt.sign({ id: 'user-1', email: 'test@example.com', name: 'Test User' }, jwtSecret);
      
      mockUserService.verifyJwt.mockReturnValue({ id: 'user-1', email: 'test@example.com', name: 'Test User' });
      mockProjectService.updateProject.mockResolvedValue(null);

      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'PUT',
        url: '/api/projects/nonexistent',
        headers: { Authorization: `Bearer ${token}` },
        payload: { name: 'Updated Name' },
      });

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({ error: 'Not found' });
    });

    it('returns 400 for validation errors', async () => {
      const server = Fastify();
      const token = jwt.sign({ id: 'user-1', email: 'test@example.com', name: 'Test User' }, jwtSecret);
      
      mockUserService.verifyJwt.mockReturnValue({ id: 'user-1', email: 'test@example.com', name: 'Test User' });

      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'PUT',
        url: '/api/projects/project-1',
        headers: { Authorization: `Bearer ${token}` },
        payload: { name: '' }, // Invalid empty name
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation failed');
      expect(body.details).toBeDefined();
    });

    it('returns 401 for unauthenticated request', async () => {
      const server = Fastify();
      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'PUT',
        url: '/api/projects/project-1',
        payload: { name: 'Updated Name' },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('deletes project by id', async () => {
      const server = Fastify();
      const token = jwt.sign({ id: 'user-1', email: 'test@example.com', name: 'Test User' }, jwtSecret);
      
      mockUserService.verifyJwt.mockReturnValue({ id: 'user-1', email: 'test@example.com', name: 'Test User' });
      mockProjectService.deleteProject.mockResolvedValue();

      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'DELETE',
        url: '/api/projects/project-1',
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('');
      expect(mockProjectService.deleteProject).toHaveBeenCalledWith('project-1');
    });

    it('returns 401 for unauthenticated request', async () => {
      const server = Fastify();
      await registerProjectRoutes(server, mockProjectService, mockUserService);

      const response = await server.inject({
        method: 'DELETE',
        url: '/api/projects/project-1',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});