# Task List: Prompt Model Selection

**ID Convention:** All primary keys (`id`) in all tables must be of type `string` (not integer), and all foreign keys must reference string IDs. This is a project-wide convention and must be followed for all new tables and relationships.

This document breaks down the work required to implement the "Prompt Model Selection" feature, as defined in `project/PRD-MODEL-SELECT.md`. The tasks are ordered to be completed sequentially.

---

## Phase 1: Database & Backend Core

### Task 1.1: Create `models` Table Migration

- **Objective:** Create a new database table `models` to store LLM models.
- **File to Create:** `packages/shared/src/migrations/0012_create_models_table.ts` (assuming the last migration was `0011`).
- **Table Schema:**
  - `id`: `increments('id').primary()`
  - `name`: `string('name').notNullable().unique()`
  - `is_active`: `boolean('is_active').defaultTo(true)`
  - `created_at`: `timestamp('created_at').defaultTo(knex.fn.now())`
  - `updated_at`: `timestamp('updated_at').defaultTo(knex.fn.now())`
- **Action:** Create the new migration file with the schema above using `knex`.

### Task 1.2: Add `model_id` to `prompts` Table

- **Objective:** Update the `prompts` table to include a foreign key reference to the new `models` table.
- **File to Create:** `packages/shared/src/migrations/0013_add_model_id_to_prompts.ts`.
- **Migration Logic:**
  - Use `knex.schema.table('prompts', ...)` to add a new column.
  - **Column:** `model_id`: `integer('model_id').unsigned().references('id').inTable('models').onDelete('SET NULL')`.
- **Action:** Create the new migration file that alters the `prompts` table.

### Task 1.3: Define DTOs for Model

- **Objective:** Create the TypeScript types for the new `Model` entity and update the `Prompt` DTO.
- **Files to Modify:**
  1. `packages/shared/src/dto/Model.ts` (new file)
  2. `packages/shared/src/dto/Prompt.ts`
  3. `packages/shared/src/dtos.ts`
- **Actions:**
  1. Create `Model.ts` and define the `Model` interface matching the DB schema.
  2. In `Prompt.ts`, add `modelId: string | null;` and `modelName?: string;` to the `Prompt` interface.
  3. Export the new `Model` type from `packages/shared/src/dtos.ts`.

### Task 1.4: Define Shared Validation Schemas

- **Objective:** Create and update shared `yup` validation schemas in `packages/shared` to ensure consistent validation rules for both the frontend and backend.
- **File to Modify:** `packages/shared/src/validation.ts`.
- **Actions:**
  1.  Create a `defineModelSchema()` function that returns a `yup` schema for the `Model` DTO, following the existing pattern in the file.
  2.  Update the schema returned by `definePromptSchema()` to include `modelId: yup.string().optional().nullable()`. This schema will be used by the backend for payload validation and the frontend for client-side form validation.

### Task 1.5: Create `ModelRepository`

- **Objective:** Create a repository to handle database operations for the `models` table.
- **File to Create:** `packages/backend/src/repositories/ModelRepository.ts`.
- **Class `ModelRepository`:**
  - `constructor(private readonly db: DB)`
  - `findAll(): Promise<Model[]>`: Returns all models.
  - `findByName(name: string): Promise<Model | undefined>`: Finds a model by name.
  - `create(name: string): Promise<Model>`: Creates a new model.
  - `update(id: string, updates: Partial<Model>): Promise<void>`: Updates a model.
  - `upsert(models: string[]): Promise<void>`: A key method that will:
    - Deactivate all existing models (`is_active = false`).
    - For each model name in the input array, either create it or update it to be `is_active = true`.
- **Action:** Implement the `ModelRepository` class with the specified methods. Create `packages/backend/src/repositories/ModelRepository.spec.ts` and add unit tests for all methods.

### Task 1.6: Update `PromptRepository`

- **Objective:** Update the `PromptRepository` to handle the new `model_id` field.
- **File to Modify:** `packages/backend/src/repositories/PromptRepository.ts`.
- **Action:** Update the `PromptRepository` class. Ensure `packages/backend/src/repositories/PromptRepository.spec.ts` is updated to test the changes.

---

## Phase 2: Backend API & Services

### Task 2.1: Create `ModelService` for Model Synchronization

- **Objective:** Create a service to manage the logic of fetching models from OpenAI and updating the database.
- **File to Create:** `packages/backend/src/services/ModelService.ts`.
- **Class `ModelService`:**
  - `constructor(private readonly modelRepository: ModelRepository, private readonly llmService: LLMService)`
  - `refreshModels(): Promise<void>`:
    - Calls a new method on `LLMService` (see next task) to get model names from the OpenAI API.
    - Calls `modelRepository.upsert()` with the fetched model names.
- **Action:** Implement the `ModelService`. Create `packages/backend/src/services/ModelService.spec.ts` and add unit tests, mocking dependencies as needed.

### Task 2.2: Update `LLMService` to Fetch Models

- **Objective:** Add functionality to `LLMService` to fetch the list of available models from OpenAI.
- **File to Modify:** `packages/backend/src/services/LLMService.ts`.
- **Actions:**
  - Add a new public method `listModels(): Promise<string[]>`. This method will use the OpenAI client to list models and return an array of their names (IDs).
  - Update the `execute` method (or equivalent) to accept an optional `modelName: string` parameter and use it in the API call to OpenAI. If not provided, it should fall back to the default model.

### Task 2.3: Create `ModelController`

- **Objective:** Expose model-related functionality via the API.
- **File to Create:** `packages/backend/src/controllers/ModelController.ts`.
- **Class `ModelController`:**
  - `GET /api/models`: Returns a list of all active models from `ModelRepository`.
  - `POST /api/models/refresh`: Triggers `ModelService.refreshModels()`.
- **Action:** Implement the controller and register its routes. Create `packages/backend/src/controllers/ModelController.spec.ts` and add integration tests for the new endpoints.

### Task 2.4: Implement Automatic Model Refresh

- **Objective:** Trigger the model refresh on server startup and periodically.
- **File to Modify:** `packages/backend/src/server.ts` (or `index.ts`).
- **Actions:**
  1. **On Startup:** After the server is initialized, call `modelService.refreshModels()`. Wrap it in a `try/catch` to prevent startup failure if the API call fails.
  2. **Periodic:** Use `setInterval` to call `modelService.refreshModels()` periodically. The interval should be read from `process.env.MODEL_REFRESH_INTERVAL_HOURS` or default to 168.

### Task 2.5: Update `PromptController`

- **Objective:** Allow `model_id` to be set when creating or updating a prompt.
- **File to Modify:** `packages/backend/src/controllers/PromptController.ts`.
- **Actions:**
  - Update the validation for `POST /api/prompts` and `PUT /api/prompts/:id` to use the updated schemas (`CreatePromptSchema`, `UpdatePromptSchema`).
  - The request body for these endpoints will now include an optional `modelId: string`.
  - Pass this `modelId` to the `promptRepository.create` and `promptRepository.update` methods.

### Task 2.6: Update `ExecutionService`

- **Objective:** Ensure the test runner uses the prompt-specific model.
- **File to Modify:** `packages/backend/src/services/ExecutionService.ts`.
- **Action:**
  - When fetching prompts for a test run, ensure the `modelName` is included (this should be handled by Task 1.6).
  - In the `runTestCase` method (or equivalent), pass the `prompt.modelName` to the `llmService.execute` method.

---

## Phase 3: Frontend Integration

### Task 3.1: Update `ApiClient`

- **Objective:** Add frontend API client methods for interacting with the new model endpoints.
- **File to Modify:** `packages/frontend/src/ApiClient.ts`.
- **Actions:**
  - Update the `createPrompt` and `updatePrompt` methods to include `modelId` in the request payload.
  - Add `getModels(): Promise<Model[]>` to fetch from `GET /api/models`.
  - Add `refreshModels(): Promise<void>` to post to `POST /api/models/refresh`.
  - Update unit tests in `packages/frontend/src/ApiClient.spec.ts` to mock and test the new and updated methods.

### Task 3.2: Create `PromptForm` Model Selection UI

- **Objective:** Add a model selection dropdown to the prompt creation/editing modal.
- **File to Modify:** `packages/frontend/src/components/PromptForm.tsx` (or equivalent component).
- **Actions:**
  - Fetch the list of models using `apiClient.getModels()` when the component mounts.
  - Add a `<select>` element to the form, populated with the fetched models. The `value` of each option should be the model's `id`.
  - Add a refresh icon button next to the select element. On click, it should call `apiClient.refreshModels()` and then refetch the model list to update the dropdown.
  - Ensure the selected `modelId` is included when the form is submitted.
  - Update unit tests in `packages/frontend/src/components/PromptForm.spec.tsx` to verify the new dropdown, refresh button, and form submission behavior.

### Task 3.3: Display Model in Prompt List

- **Objective:** Show the selected model for each prompt and indicate if it's inactive.
- **File to Modify:** `packages/frontend/src/pages/DashboardPage.tsx` (or where the prompt list is rendered).
- **Actions:**
  - In the prompt list, display the `prompt.modelName`.
  - The `Prompt` type in the frontend (`packages/frontend/src/types.ts`) may need to be updated to include `modelName` and `isModelActive` (or similar). The backend API response for listing prompts should include this data.
  - If the model associated with a prompt is inactive, display a warning icon with a tooltip saying "Model is no longer available".
  - Update unit tests for the component that renders the prompt list to verify that the model name and warning icon are displayed correctly.

### Task 3.4: Display Model in Test Run View

- **Objective:** Show which model was used for a test result.
- **File to Modify:** The component that renders test suite run results.
- **Action:**
  - The API response for a test suite run should include the `modelName` used for each result.
  - Display this `modelName` in the UI for each test case result.
  - Update unit tests for the test run view to verify that the model name is displayed.

---

## Phase 4: Verification

### Task 4.1: Final Check

- **Objective:** Ensure the entire feature works end-to-end and meets all project standards.
- **Action:** Run the command `npm run check` from the root directory and fix any build, lint, or test failures.
