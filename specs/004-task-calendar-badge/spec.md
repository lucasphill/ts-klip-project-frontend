# Feature Specification: Google Calendar Synchronization Indicator on Tasks

**Feature Directory**: `specs/004-task-calendar-badge`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "Ícone do Google Calendar nas tarefas: Como o backend agora retorna o campo googleCalendarEventId no DTO da tarefa, o frontend pode (opcionalmente) exibir um pequeno ícone/badge do Google Calendar ao lado das tarefas que estão sincronizadas na agenda."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visual Synchronization Indicator in Task List (Priority: P1) 🎯 MVP

As a user browsing my tasks in Inbox, Projects, or Calendar views, I want to see a subtle Google Calendar icon/badge next to tasks that are synchronized with my Google agenda so that I immediately know which commitments are synced without having to open Google Calendar.

**Why this priority**: It delivers immediate visual feedback and clarity on which tasks have an active calendar event attached.

**Independent Test**: Load the task table with tasks that have `googleCalendarEventId` populated and tasks without it. Verify that only synchronized tasks display the Google Calendar indicator badge/icon.

**Acceptance Scenarios**:

1. **Given** a task that has a non-null `googleCalendarEventId`, **When** the task is rendered in the task table (Inbox, Project details, or Calendar task list), **Then** a clean Google Calendar icon or badge is displayed next to the task title or due date.
2. **Given** a task that does NOT have `googleCalendarEventId` (null or empty), **When** the task is rendered, **Then** no Google Calendar icon is displayed.
3. **Given** a user hovers over or focuses on the Google Calendar sync icon, **When** the tooltip/hint appears, **Then** it clearly explains "Sincronizado com o Google Calendar".

---

### User Story 2 - Real-Time Indicator Updates on Task Modifications (Priority: P2)

As a user creating or updating tasks, I want the Google Calendar indicator to appear or update dynamically whenever a task gains or loses synchronization status.

**Why this priority**: Ensures the UI remains consistent after task updates or refreshes without stale synchronization indicators.

**Independent Test**: Update a task's due date or details, receive updated task data, and verify the synchronization indicator state updates immediately in the UI.

**Acceptance Scenarios**:

1. **Given** a task is updated and returns a `googleCalendarEventId`, **When** the table row re-renders, **Then** the Google Calendar badge is displayed.
2. **Given** an existing synchronized task is updated and no longer synced (or detached), **When** re-rendered, **Then** the badge is removed gracefully.

---

### Edge Cases

- **Long Task Titles with Badge**: What happens when a task has a long title on mobile or narrow columns? The badge must fit naturally without wrapping awkwardly or breaking table cell truncation.
- **Subtasks Synchronization**: What happens when subtasks have `googleCalendarEventId`? Subtask rows in the hierarchy tree must also display the sync icon alongside their title.
- **Theme Support**: How does the icon look in light and dark modes? The icon/badge styling must use theme tokens with appropriate contrast.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The task table and task views MUST display a Google Calendar icon/badge for every task where `googleCalendarEventId` is present and non-empty.
- **FR-002**: The icon/badge MUST include an accessible tooltip or accessible text (`aria-label="Sincronizado com o Google Calendar"`).
- **FR-003**: The icon/badge MUST be non-intrusive, aligning neatly with the task title or due date column in both parent tasks and subtasks.
- **FR-004**: When `googleCalendarEventId` is null or undefined, the task row MUST NOT show any sync badge.
- **FR-005**: The indicator MUST render clearly in both light and dark themes.

### Key Entities

- **Task with Google Calendar Event**: Task entity possessing an optional `googleCalendarEventId` (string or null).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of tasks with `googleCalendarEventId` display the synchronization indicator across Inbox, Projects, and Calendar views.
- **SC-002**: Users can distinguish synced tasks from unsynced tasks at a single glance in less than 1 second.
- **SC-003**: Tooltip or hover label renders smoothly without layout shifting.

## Assumptions

- The backend provides `googleCalendarEventId` in the task payloads (`GetTasksDto`, `GetTasksWithCustomFieldsDto`).
- The frontend only reads `googleCalendarEventId` to display the indicator and does not need to construct direct calendar URLs unless desired as a future enhancement.
