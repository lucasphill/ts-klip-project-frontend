# Technical Research & Decisions: Exclusão em Lote de Tarefas Concluídas

**Feature Branch**: `009-delete-completed-tasks` | **Date**: 2026-08-25

## 1. Technical Context Analysis & Unknowns Resolution

### Decision 1: API Endpoint Integration & Contract
- **Decision**: Centralize bulk deletion in `tasksApi.deleteCompleted(projectId?: string)` in `src/services/api.ts`.
- **Endpoint**: `DELETE /api/Tasks/completed`
  - Query Parameter: `projectId?: string` (optional UUID)
  - Success Response: `ResponseModelDto<DeleteCompletedTasksResponseDto>` where:
    ```typescript
    export interface DeleteCompletedTasksResponseDto {
      deletedCount: number;
      deletedTaskIds: string[];
    }
    ```
- **Rationale**: Direct mapping to the official API specification (`openapi/v1.json`). Centralized service method maintains single responsibility and handles Auth0 Bearer token automatically via existing Axios interceptor.
- **Alternatives Considered**:
  - Calling individual `DELETE /api/Tasks/{id}` in a client-side loop: Rejected because it causes massive network overhead, race conditions, lack of backend transactionality, and ignores the dedicated API endpoint.

### Decision 2: Modal Safeguard Architecture & Reusability
- **Decision**: Create a dedicated, accessible confirmation modal `src/components/DeleteCompletedTasksModal.tsx` capable of handling both Global and Project-scoped deletions based on whether a `projectName` prop is passed.
- **Confirmation Keyword**: `DELETAR` (strictly trimmed and converted to uppercase for comparison).
- **Rationale**: Adheres to the established UX pattern seen in `DeleteAccountModal.tsx`. Asking the user to type `DELETAR` provides strong friction against accidental bulk data loss while maintaining visual consistency.
- **Alternatives Considered**:
  - Generic simple browser `window.confirm()` or 1-click dialog: Rejected because deleting potentially hundreds of tasks across an account or project is irreversible and requires explicit user intent.
  - Creating two separate modal components (`GlobalDeleteCompletedModal.tsx` and `ProjectDeleteCompletedModal.tsx`): Rejected because the UI structure, validation logic, keyboard shortcuts, and state are 95% identical; parameterizing `projectName?: string` is much cleaner and easier to maintain.

### Decision 3: State Synchronization & Cache Invalidation
- **Decision**: When `tasksApi.deleteCompleted` succeeds:
  1. Use the returned `deletedTaskIds` to immediately remove items from `TasksContext` via `removeTasksLocal(deletedTaskIds)`.
  2. For project-scoped deletions inside `ProjectsPage.tsx`, update the local component `tasks` state by filtering out completed tasks and trigger `fetchTasks({ force: true })` in the background to ensure consistency.
  3. Emit a feedback toast via `sonner` displaying the exact number of deleted tasks (e.g. `toast.success(`${deletedCount} tarefas concluídas foram excluídas com sucesso.`)`).
- **Rationale**: Provides instant optimistic/reactive UI updates with < 50ms latency without requiring a page reload (`F5`), avoiding stale data when navigating between views.
- **Alternatives Considered**:
  - Full browser reload (`window.location.reload()`): Rejected because it degrades UX, loses current scroll position/focus, and violates Principle V of the Constitution.

### Decision 4: Header Actions in `TaskViewLayout`
- **Decision**: Extend `TaskViewLayoutProps` in `src/components/TaskViewLayout.tsx` to accept an optional `actions?: ReactNode` slot (or `onDeleteCompleted?: () => void`), rendering the project cleanup button alongside "Gerenciar campos".
- **Rationale**: Keeps `TaskViewLayout` generic and reusable across different views (Home, Month, Projects) while allowing `ProjectsPage` to inject project-specific action buttons.
- **Alternatives Considered**:
  - Hardcoding project delete button inside `TaskViewLayout`: Rejected because `TaskViewLayout` is also used on views that are not single-project pages (e.g. Month View or generic layouts).

## 2. Best Practices & Risk Mitigation

- **Keyboard Accessibility**: Auto-focus on input when modal opens; `Enter` submits when input matches `DELETAR`; `Esc` cancels/closes modal.
- **Re-entrance Prevention**: `isSubmitting` state locks inputs, dismiss buttons, and changes submit button to a spinner (`Loader2`).
- **Zero-item Scenarios**: If no tasks are deleted (`deletedCount === 0`), show a gentle information toast without error styling.
- **Failure Resilience**: API errors are caught, user-friendly messages extracted from response payload when available, and toasts rendered via `toast.error()`.
