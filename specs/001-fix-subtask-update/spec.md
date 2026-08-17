# Feature Specification: Fix Subtask Update

**Feature Branch**: `001-fix-subtask-update`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "Corrigir a atualização de uma tarefa de projeto ao defini-la como
subtarefa, pois a associação com a tarefa pai aparentemente não está sendo persistida."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save a Task as a Subtask (Priority: P1)

As a project member, I want to edit an existing task in a project and define another task as its
parent so that the task becomes a subtask in the project hierarchy.

**Why this priority**: Saving task hierarchy is the core user action currently failing.

**Independent Test**: Edit a task in a project, select a valid parent task, save, and confirm that
the edited task appears under that parent without an error.

**Acceptance Scenarios**:

1. **Given** an existing task in a project and a valid parent task in the same project, **When**
   the user saves the existing task as a subtask of that parent, **Then** the change is saved and
   the task appears as a subtask.
2. **Given** an existing task in a project, **When** the user saves it without changing its parent,
   **Then** its current hierarchy and other task data remain unchanged.

---

### User Story 2 - Retain the Saved Hierarchy (Priority: P2)

As a project member, I want the saved parent-child relationship to remain visible after revisiting
the project so that I can trust that the task organization was preserved.

**Why this priority**: A successful save is valuable only if the relationship remains persisted.

**Independent Test**: Save a task as a subtask, reload or leave and return to the project, and
confirm that the same parent-child relationship is displayed.

**Acceptance Scenarios**:

1. **Given** a task that was successfully saved as a subtask, **When** the user reloads or returns
   to the project, **Then** the task remains associated with the selected parent.
2. **Given** a task saved as a subtask, **When** the user opens it for editing, **Then** the
   selected parent is shown correctly.

### Edge Cases

- The system prevents saving a task as its own parent or as a descendant that would create a
  circular hierarchy.
- If a selected parent task is unavailable when saving, the system preserves the existing task
  data, does not report a false success, and shows a clear error.
- Updating a task's hierarchy does not unintentionally change its title, description, status,
  project, or other saved attributes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a user to save an existing task in a project with a valid
  parent task relationship.
- **FR-002**: The system MUST include all relationship information required to persist the selected
  parent when the task is updated.
- **FR-003**: The system MUST display the saved parent-child relationship immediately after a
  successful update.
- **FR-004**: The system MUST retain the saved parent-child relationship after the user reloads or
  revisits the project.
- **FR-005**: The system MUST preserve task attributes unrelated to the hierarchy when updating a
  task's parent.
- **FR-006**: The system MUST show an actionable error and preserve the previously saved hierarchy
  if the hierarchy update cannot be completed.
- **FR-007**: The system MUST reject self-parenting and circular parent-child relationships.

### Key Entities *(include if feature involves data)*

- **Task**: A work item belonging to a project, with user-editable attributes and an optional
  parent task relationship.
- **Parent task relationship**: The hierarchical association that identifies a task as a subtask of
  another task in the same project.
- **Project**: The scope that contains the task hierarchy being displayed and edited.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, users successfully save an existing project task as a
  subtask of a valid parent in 100% of 10 consecutive attempts.
- **SC-002**: In the same 10 attempts, the saved parent-child relationship remains visible after
  reloading or revisiting the project in 100% of cases.
- **SC-003**: In 100% of those attempts, attributes unrelated to hierarchy remain unchanged.
- **SC-004**: Users receive a clear success confirmation or a clear error outcome for every
  hierarchy update attempt, without an ambiguous state.

## Assumptions

- Users already have permission to edit tasks in the selected project.
- A subtask can only have one parent task, and valid parent tasks belong to the same project.
- Existing task creation, project selection, and task display behavior are outside the scope of
  this correction.
- Browser-based validation will be performed when a browser testing capability is available, in
  accordance with the project constitution.
