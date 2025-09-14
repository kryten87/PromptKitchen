# PRD: Prompt Model Selection

## 1. Objective

To allow users to select a specific language model (e.g., `gpt-4o`, `claude-3-opus-20240229`) for each prompt they create or edit. This will enable more granular control over prompt execution and testing, allowing users to compare model performance and tailor prompts for specific models.

## 2. Background

Currently, the application uses a hardcoded model for all prompt executions. As the variety and capabilities of language models grow, users need the ability to select the most appropriate model for their specific use case. This feature introduces the necessary backend and frontend changes to support model selection per prompt.

## 3. User Stories

- As a **Prompt Engineer**, I want to select a model from a list of available options when creating or editing a prompt, so that I can tailor my prompt to a specific model.
- As a **Prompt Engineer**, I want the list of available models to be up-to-date, so I can use the latest models released by providers.
- As a **Prompt Engineer**, I want to be notified if a model I previously selected for a prompt is no longer available, so I can update my prompt configuration.
- As an **Administrator**, I want the application to automatically refresh the list of available models periodically, so that the list doesn't become stale.

## 4. Requirements

### 4.1. Data Model & Backend

- **`models` Table:**
  - A new database table, `models`, will be created to store the list of available models.
  - Columns:
    - `id`: Primary Key (e.g., auto-incrementing integer)
    - `name`: `TEXT`, `UNIQUE`, `NOT NULL` (e.g., `gpt-4o`)
    - `is_active`: `BOOLEAN`, `DEFAULT TRUE` (To mark if the model is still available from the provider)
    - `created_at`: `TIMESTAMP`
    - `updated_at`: `TIMESTAMP`

- **`prompts` Table Modification:**
  - Add a foreign key column `model_id` to the `prompts` table, which references `models(id)`.
  - This column will store the selected model for the prompt.

- **Model List Synchronization:**
  - **On Server Startup:** The application will fetch the list of available models from the OpenAI API and update the `models` table. Any models that are no longer in the API response will be marked as `is_active = FALSE`.
  - **Periodic Refresh:** A background job will run periodically to refresh the model list from the API.
    - The refresh interval will be configurable via an environment variable `MODEL_REFRESH_INTERVAL_HOURS` (defaulting to `168` hours, i.e., 1 week).
  - **Manual Refresh:** An API endpoint (e.g., `POST /api/models/refresh`) will be created to trigger the model list refresh manually.

### 4.2. Frontend & UI

- **Prompt Create/Edit Modal:**
  - A dropdown/select element will be added to the prompt creation and editing form.
  - This dropdown will be populated with the list of active models from the `models` table.
  - A default model will be pre-selected (hardcoded for now, e.g., `gpt-4o`).
  - A "refresh" icon button will be placed next to the dropdown. Clicking this button will call the `POST /api/models/refresh` endpoint and, upon success, refetch the models to update the dropdown.

- **Prompt List View:**
  - If a prompt is associated with a model that is marked as `is_active = FALSE`, an informational icon (e.g., a warning triangle) will be displayed next to the prompt's name or model name in the UI. A tooltip on the icon should state "Model is no longer available".

### 4.3. Test Runner & Execution

- When a test suite is run, the execution service must use the model specified in the `prompts.model_id` for each prompt.
- The `LLMService` will be updated to accept a model name parameter, which it will pass to the underlying LLM provider API (e.g., OpenAI).

## 5. Non-Goals (Out of Scope for this PRD)

- Support for models from providers other than OpenAI.
- A complex UI for managing the model list (e.g., enabling/disabling models manually). The list is managed automatically.
- Dynamic configuration of the default model in the UI.

## 6. Open Questions

- What is the best strategy for choosing a default model? For now, we will hardcode it, but this should be revisited.
- How should API errors from the model provider (e.g., OpenAI) be handled during the refresh process? Should the old list be kept, or should the list be cleared? (Recommendation: Keep the old list and log the error).
