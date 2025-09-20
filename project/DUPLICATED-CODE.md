# Duplicated Code Analysis

This document identifies duplicated code patterns across the backend, frontend, and shared packages that can be extracted into shared modules.

## 3. Repository CRUD Pattern

**Description**: Similar repository structure and patterns across all repositories
**Impact**: Common patterns repeated in 4+ repository files
**Extraction Difficulty**: Medium

### Locations:

- `packages/backend/src/repositories/ProjectRepository.ts:21-34,36-46,48-64,66-74,76-78`
- `packages/backend/src/repositories/ModelRepository.ts:30-33,35-38,40-53,55-64`
- `packages/backend/src/repositories/TestSuiteRepository.ts:20-32,34-43,45-60,62-70,72-74`
- `packages/backend/src/repositories/UserRepository.ts:20-31,33-36,38-44,46-50`

### Patterns:

- ID generation: `Math.random().toString(36).substring(2, 15)`
- Timestamp handling: `created_at: new Date(), updated_at: new Date()`
- Basic CRUD operations structure

### Recommended Solution:

Create base repository class in `packages/shared/src/repositories/BaseRepository.ts`:

```typescript
export abstract class BaseRepository<T> {
  protected generateId(): string
  protected addTimestamps(data: any): any
  protected mapToDto(row: any): T
}
```

## 4. Frontend Modal Component Pattern

**Description**: Similar modal structure and behavior across components
**Impact**: 6+ modal components with identical backdrop/overlay patterns
**Extraction Difficulty**: Medium

### Locations:

- `packages/frontend/src/components/ConfirmModal.tsx:12-35`
- `packages/frontend/src/components/ProjectModal.tsx:71-122`
- `packages/frontend/src/components/TestSuiteModal.tsx:81-122`
- `packages/frontend/src/components/PromptModal.tsx:32`
- `packages/frontend/src/components/CreateTestCaseModal.tsx:26`
- `packages/frontend/src/components/PromptHistoryModal.tsx:72`

### Pattern:

```typescript
<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
  <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
    {/* modal content */}
  </div>
</div>
```

### Recommended Solution:

Create base modal component in `packages/frontend/src/components/common/Modal.tsx`:

```typescript
export const Modal = ({ isOpen, onClose, children, size = 'md' }: ModalProps)
```

## 5. Frontend Form State Management Pattern

**Description**: Repeated form state hooks and error handling
**Impact**: 8+ components with identical state management
**Extraction Difficulty**: Easy

### Locations:

- `packages/frontend/src/components/ProjectModal.tsx:16-17`
- `packages/frontend/src/components/TestSuiteModal.tsx:23-24`
- `packages/frontend/src/components/PromptForm.tsx:48-49`
- `packages/frontend/src/components/TestCaseEditor.tsx:26-27`
- `packages/frontend/src/components/PromptEditor.tsx:14-15`

### Pattern:

```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

### Recommended Solution:

Create custom hook in `packages/frontend/src/hooks/useFormState.ts`:

```typescript
export const useFormState = () => {
  return {
    loading,
    setLoading,
    error,
    setError,
    clearError,
    handleAsyncOperation,
  }
}
```

## 6. Frontend Edit/Create Mode Pattern

**Description**: Similar edit vs create mode logic across modal components
**Impact**: Multiple modal components with identical mode handling
**Extraction Difficulty**: Medium

### Locations:

- `packages/frontend/src/components/ProjectModal.tsx:20-24,40-68`
- `packages/frontend/src/components/TestSuiteModal.tsx:27-35,48-78`

### Pattern:

```typescript
const isEditMode = Boolean(initialData)
const title = isEditMode ? `Edit ${resourceName}` : `Create ${resourceName}`
const buttonText = isEditMode ? 'Update' : 'Create'
const loadingText = isEditMode ? 'Updating...' : 'Creating...'
```

### Recommended Solution:

Create custom hook in `packages/frontend/src/hooks/useEditCreateMode.ts`:

```typescript
export const useEditCreateMode = (initialData: any, resourceName: string)
```

## 7. Database Row to DTO Mapping Pattern

**Description**: Repetitive mapping between database snake_case and DTO camelCase
**Impact**: All repository files contain similar mapping logic
**Extraction Difficulty**: Medium

### Locations:

- `packages/backend/src/repositories/ProjectRepository.ts:26-33,38-45`
- `packages/backend/src/repositories/ModelRepository.ts:20-28`
- `packages/backend/src/repositories/TestSuiteRepository.ts:25-31,36-42`
- `packages/backend/src/repositories/UserRepository.ts:52-61`

### Pattern:

```typescript
return {
  id: row.id,
  name: row.name,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  // ... other field mappings
}
```

### Recommended Solution:

Create mapping utilities in `packages/shared/src/utils/dbMapping.ts`:

```typescript
export const mapTimestamps = (row: any) => ({
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
})
export const mapBaseEntity = (row: any) => ({
  id: row.id,
  ...mapTimestamps(row),
})
```

## 8. Shared Entity Interface Pattern

**Description**: Common fields across entity DTOs
**Impact**: All entity DTOs contain identical base fields
**Extraction Difficulty**: Easy

### Locations:

- `packages/shared/src/dto/Project.ts:1-8`
- `packages/shared/src/dto/Model.ts:1-7`
- `packages/shared/src/dto/Prompt.ts:1-12`
- All other DTO files

### Pattern:

```typescript
export interface EntityDto {
  id: string
  createdAt: Date
  updatedAt: Date
  // ... specific fields
}
```

### Recommended Solution:

Create base interface in `packages/shared/src/dto/BaseEntity.ts`:

```typescript
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}
```

## 9. Frontend API Error Handling Pattern

**Description**: Repeated try-catch error handling in API calls
**Impact**: Multiple components with identical async operation patterns
**Extraction Difficulty**: Easy

### Locations:

- `packages/frontend/src/components/ProjectModal.tsx:44-67`
- `packages/frontend/src/components/TestSuiteModal.tsx:57-77`
- Multiple other components with API calls

### Pattern:

```typescript
setLoading(true)
setError(null)
try {
  // API call
} catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred')
} finally {
  setLoading(false)
}
```

### Recommended Solution:

Create custom hook in `packages/frontend/src/hooks/useApiCall.ts`:

```typescript
export const useApiCall = () => {
  return { executeApiCall, loading, error }
}
```

## 10. Validation Schema Pattern

**Description**: Similar yup validation schema definitions
**Impact**: Repetitive schema creation patterns in validation.ts
**Extraction Difficulty**: Medium

### Locations:

- `packages/shared/src/validation.ts:21-30,34-43,47-55,59-70`

### Pattern:

```typescript
export const EntityCreateSchema = yup.object({
  name: yup.string().required(),
  // ... other fields
})

export const EntityUpdateSchema = EntityCreateSchema.omit(['id'])
```

### Recommended Solution:

Create schema factory functions in `packages/shared/src/validation/schemaFactory.ts`:

```typescript
export const createBaseEntitySchema = (additionalFields: yup.ObjectSchema)
export const createUpdateSchema = (createSchema: yup.ObjectSchema)
```

## Summary

**Total Issues Identified**: 10 major duplication patterns
**High Priority (Easy Fixes)**: 5 patterns
**Medium Priority (Moderate Complexity)**: 5 patterns

**Estimated Impact**:

- **Lines of Code Reduction**: ~500-800 lines
- **Maintenance Improvement**: Centralized logic reduces bug surface area
- **Developer Experience**: Consistent patterns and utilities

## Implementation Priority

1. **Phase 1 (Quick Wins)**:
   - API Response Error Handling (#1)
   - Form State Management (#5)
   - Shared Entity Interfaces (#8)
   - API Error Handling (#9)
   - Validation Error Handling (#2)

2. **Phase 2 (Moderate Effort)**:
   - Modal Component Pattern (#4)
   - Edit/Create Mode Pattern (#6)
   - Database Mapping Pattern (#7)
   - Validation Schema Pattern (#10)

3. **Phase 3 (Architectural)**:
   - Repository CRUD Pattern (#3)

Each phase should include updating existing code to use the new shared utilities and adding appropriate tests.
