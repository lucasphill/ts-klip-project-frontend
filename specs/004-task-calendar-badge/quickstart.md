# Quickstart & Validation Guide: Task Google Calendar Synchronization Badge

**Feature**: `specs/004-task-calendar-badge`
**Date**: 2026-08-17

## Prerequisites

1. Frontend running on `http://localhost:5173`.
2. Authenticated user session.

---

## Validation Scenarios

### Scenario 1: Task with Google Calendar Event ID

1. In Inbox, Project or Calendar task list, load tasks where `googleCalendarEventId` is populated.
2. Confirm the amber Google Calendar icon appears right beside the task title.
3. Hover over the icon and verify the tooltip displays "Sincronizado com o Google Calendar".

### Scenario 2: Task without Google Calendar Event ID

1. In the same list, view tasks where `googleCalendarEventId` is null/empty.
2. Confirm no sync icon is rendered for these tasks.

### Scenario 3: Subtask Sync Badge

1. Expand a parent task that has subtasks.
2. Verify subtasks with `googleCalendarEventId` also display the calendar sync badge alongside the `Subtarefa` pill.
