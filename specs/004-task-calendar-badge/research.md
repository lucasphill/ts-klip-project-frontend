# Research: Google Calendar Synchronization Indicator on Tasks

**Feature**: `specs/004-task-calendar-badge`
**Date**: 2026-08-17

## Technical Context & Decisions

### 1. DTO Type Alignment

- **Decision**: Update `GetTasksDto` and `GetTasksWithCustomFieldsDto` in `src/types/apiTypes.ts` to include optional `googleCalendarEventId?: string | null` and `google_calendar_event_id?: string | null`.
- **Rationale**: The backend OpenAPI schema confirms `GetTasksDto` now includes `googleCalendarEventId`. Typing it explicitly preserves TypeScript strict typing and prevents unintended `undefined` errors.
- **Alternatives Considered**: Casting as `any` in component - rejected because it violates Constitution Principle I (Type-Safe, Maintainable Frontend).

### 2. UI Placement and Component Design

- **Decision**: Render the sync indicator in `src/components/TaskTable.tsx` within the task title column flex container, positioned next to `TaskTitleInput` and before the `Subtarefa` badge (if present).
- **Rationale**:
  - Placing it beside the title gives immediate context and high visibility without consuming an entire extra column.
  - Using Lucide's `Calendar` icon with an accessible `title` attribute and amber badge styling (`bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20`) clearly associates the task with calendar synchronization and matches the Google Calendar integration color palette.
- **Alternatives Considered**:
  - *Adding a separate table column for Calendar*: Consumes excessive horizontal table width, especially on mobile or laptop displays.
  - *Showing only in task edit modal*: Hides valuable information from the main task table list.

### 3. Subtask Support

- **Decision**: Ensure both parent rows (`depth === 0`) and child subtask rows (`depth > 0`) render the Google Calendar badge when their respective task data has `googleCalendarEventId`.
- **Rationale**: Subtasks with deadlines can also be synchronized with Google Calendar independently.
