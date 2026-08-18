# Research: Task Deletion Choice (Cascade vs Detach Subtasks)

**Feature**: `002-delete-task-cascade`  
**Date**: 2026-08-17

## Research Findings & Architectural Decisions

### 1. API Contract for Task Deletion with Hierarchy Options

- **Decision**: Update `tasksApi.remove(taskId: string, cascade?: boolean)` in `src/services/api.ts` to forward `cascade` as a query parameter `DELETE /Tasks/{id}?cascade={true|false}` when specified.
- **Rationale**: The backend endpoint accepts `DELETE /Tasks/{id}?cascade=true` (for recursive deletion of parent + all descendants) and `DELETE /Tasks/{id}?cascade=false` (for deleting only the parent and unlinking/promoting subtasks to standalone tasks). When no parameter is sent or when deleting a task without subtasks, standard deletion is executed.
- **Alternatives considered**:
  - *Sending JSON body in DELETE request*: Rejected because query parameters (`?cascade=...`) are standard for HTTP DELETE and align with the backend contract.
  - *Separate endpoint like `/Tasks/{id}/cascade`*: Rejected because the existing RESTful route `DELETE /Tasks/{id}` with query parameters is simpler and already established.

### 2. Dialog Component Architecture & UX Pattern

- **Decision**: Create a dedicated, reusable `DeleteTaskModal` component (`src/components/DeleteTaskModal.tsx`) built on top of the existing Radix UI `Dialog` primitive (`src/components/ui/dialog.tsx`).
- **Rationale**: 
  - Centralizes deletion confirmation logic instead of duplicating `window.confirm` calls across `HomePage.tsx`, `ProjectsPage.tsx`, and `MonthViewPage.tsx`.
  - When the task has subtasks (`descendantCount > 0`), the dialog displays the task title, number of subtasks, and an accessible selection (radio group or distinct action cards/buttons) allowing the user to select between:
    1. **Excluir tudo (tarefa e subtarefas)**: `cascade = true`
    2. **Excluir apenas tarefa pai (manter subtarefas como avulsas)**: `cascade = false`
  - When the task has no subtasks (`descendantCount === 0`), the dialog shows a simple, clean delete confirmation ("Tem certeza que deseja excluir esta tarefa?").
  - Includes loading state indicator during deletion and disables buttons to prevent double-submissions.
- **Alternatives considered**:
  - *Native `window.confirm` with multiple prompts*: Rejected because native alerts cannot offer dual choice (cascade vs unlink) and lack accessible styling.
  - *Inline dropdown menu choice*: Rejected because task deletion is destructive and requires a focused modal confirmation to prevent accidental data loss.

### 3. Local State Updates & Synchronization

- **Decision**:
  - In `TasksContext` and local page states:
    - If `cascade === true`: remove `[taskId, ...descendantTaskIds]` from local state.
    - If `cascade === false`: remove `taskId` and update direct child tasks in local state (clearing their `parentTaskId` / `parent_task_id` reference) so they immediately render as standalone/root-level tasks, followed by background synchronization/refetch if needed.
- **Rationale**: Immediate optimistic/local feedback provides an instant responsive UI without waiting for full page reloads, adhering to Principle V of the Constitution.
- **Alternatives considered**:
  - *Full page refetch only*: Rejected due to brief UI flicker and slower perceived performance compared to optimistic local state update + sync.

### 4. Accessibility & UI Consistency

- **Decision**: Use shadcn/Radix accessible dialog components with full keyboard support (Esc to close, Tab to cycle choices, Enter to confirm, auto-focus management) and consistent brand styling via CSS variables (`var(--brand)`, `var(--bg-panel)`, `var(--text-primary)`).
- **Rationale**: Aligns strictly with Principle II (Accessible and Consistent User Experience) of the Klip Frontend Constitution.
