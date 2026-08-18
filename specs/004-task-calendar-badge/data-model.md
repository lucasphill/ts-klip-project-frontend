# Data Model: Google Calendar Synchronization Indicator on Tasks

**Feature**: `specs/004-task-calendar-badge`
**Date**: 2026-08-17

## Entities & Interfaces

### 1. Updated GetTasksDto

```typescript
export interface GetTasksDto {
  dueDate?: string;
  id: string;
  isCompleted?: boolean;
  notes?: string;
  parentTaskId?: string | null;
  parent_task_id?: string | null;
  title: string;
  createdAt?: string;
  googleCalendarEventId?: string | null;
  google_calendar_event_id?: string | null;
}
```

- **Validation Rules**:
  - `googleCalendarEventId`: Optional string or null.
  - When non-empty string, represents the active Google Calendar event identifier.
  - When null or undefined, the task is not currently synchronized with Google Calendar.

---

### 2. TaskTableRow Model

```typescript
export type TaskTableTask = GetTasksDto & {
  customFields?: Record<string, CustomFieldValue>;
};
```

- Inherits `googleCalendarEventId` directly from `GetTasksDto`.
