import { DatabaseConnector, runMigrations } from '@prompt-kitchen/shared';
import { ModelRepository } from './ModelRepository';
import { Model } from '@prompt-kitchen/shared';

describe('ModelRepository', () => {
  let db: DatabaseConnector;
  let modelRepository: ModelRepository;

  beforeAll(async () => {
    db = new DatabaseConnector({ dbFile: ':memory:' });
    await runMigrations(db);
    modelRepository = new ModelRepository(db);
  });

  beforeEach(async () => {
    // Clean the table before each test
    await db.knex('models').delete();
  });

  afterAll(async () => {
    await db.knex.destroy();
  });

  describe('create', () => {
    it('should create a new model and return it', async () => {
      const modelName = 'gpt-4';
      const model = await modelRepository.create(modelName);

      expect(model).toBeDefined();
      expect(model.name).toBe(modelName);
      expect(model.isActive).toBe(true);

      const dbModel = await db.knex('models').where({ id: model.id }).first();
      expect(dbModel).toBeDefined();
      expect(dbModel.name).toBe(modelName);
    });
  });

  describe('findAll', () => {
    it('should return all models', async () => {
      await modelRepository.create('gpt-4');
      await modelRepository.create('gpt-3.5-turbo');

      const models = await modelRepository.findAll();
      expect(models).toHaveLength(2);
    });
  });

  describe('findByName', () => {
    it('should find a model by its name', async () => {
      const modelName = 'gpt-4-turbo';
      await modelRepository.create(modelName);

      const model = await modelRepository.findByName(modelName);
      expect(model).toBeDefined();
      expect(model!.name).toBe(modelName);
    });

    it('should return undefined if model is not found', async () => {
      const model = await modelRepository.findByName('non-existent-model');
      expect(model).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update a model', async () => {
      const createdModel = await modelRepository.create('gpt-4');
      const updates: Partial<Model> = { name: 'gpt-4-vision', isActive: false };

      await modelRepository.update(createdModel.id, updates);

      const updatedModel = await modelRepository.findByName('gpt-4-vision');
      expect(updatedModel).toBeDefined();
      expect(updatedModel!.id).toBe(createdModel.id);
      expect(updatedModel!.isActive).toBe(false);
    });
  });

  describe('upsert', () => {
    it('should create new models and deactivate old ones', async () => {
      // Pre-existing models
      await modelRepository.create('old-model-1');
      const existingModel = await modelRepository.create('gpt-4');

      const newModelNames = ['gpt-4', 'gpt-4-turbo'];
      await modelRepository.upsert(newModelNames);

      const allModels = await modelRepository.findAll();
      const activeModels = allModels.filter((m) => m.isActive);

      expect(activeModels.map((m) => m.name).sort()).toEqual(newModelNames.sort());

      const oldModel = await modelRepository.findByName('old-model-1');
      expect(oldModel).toBeDefined();
      expect(oldModel!.isActive).toBe(false);

      const updatedExistingModel = await modelRepository.findByName('gpt-4');
      expect(updatedExistingModel).toBeDefined();
      expect(updatedExistingModel!.id).toBe(existingModel.id);
      expect(updatedExistingModel!.isActive).toBe(true);

      const newModel = await modelRepository.findByName('gpt-4-turbo');
      expect(newModel).toBeDefined();
      expect(newModel!.isActive).toBe(true);
    });
  });
});
