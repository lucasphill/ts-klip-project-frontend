# Feature Specification: Task Deletion Choice (Cascade vs Detach Subtasks)

**Feature Branch**: `002-delete-task-cascade`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "Opção 3: Modal de Escolha no Frontend (Cascade vs. Desvincular) - Ao tentar remover uma tarefa com filhas, um modal oferece duas alternativas ao usuário: Excluir tarefa e todas as subtarefas vs. Excluir apenas o pai e manter as subtarefas como tarefas avulsas."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Delete Parent Task with All Subtasks (Cascade) (Priority: P1)

As a user managing tasks, when I delete a parent task that contains subtasks, I want the option to delete the parent along with all of its subtasks in a single operation, so that obsolete or finished group work is completely cleaned up.

**Why this priority**: Core deletion functionality that prevents orphaned or cluttering subtasks when the entire initiative is being discarded.

**Independent Test**: Can be tested by creating a parent task with 2 subtasks, requesting deletion, selecting "Delete task and all subtasks", and verifying that both the parent and all subtasks are removed.

**Acceptance Scenarios**:

1. **Given** a parent task that has one or more subtasks, **When** the user triggers deletion on the parent task, **Then** a confirmation dialog opens displaying an explicit choice on how to handle the child subtasks.
2. **Given** the confirmation dialog is open for a parent task with subtasks, **When** the user chooses to delete all subtasks (cascade) and confirms, **Then** the parent task and all associated subtasks are deleted, and the UI immediately updates to reflect their removal.

---

### User Story 2 - Delete Parent Task and Keep Subtasks (Detach / Standalone) (Priority: P1)

As a user managing tasks, when I delete a parent task whose grouping is no longer needed, I want the option to delete only the parent while preserving its subtasks as standalone tasks, so that ongoing or valuable child work is not accidentally lost.

**Why this priority**: Critical data protection flow to prevent accidental data loss of subtasks when only the parent container task needs to be removed.

**Independent Test**: Can be tested by creating a parent task with subtasks, requesting deletion, selecting "Delete only parent and keep subtasks", and verifying that the parent is deleted while the subtasks remain visible as independent tasks.

**Acceptance Scenarios**:

1. **Given** the confirmation dialog is open for a parent task with subtasks, **When** the user chooses to delete only the parent and keep subtasks, **Then** the parent task is deleted, its subtasks are preserved and promoted to standalone tasks in the project, and the UI updates accordingly.
2. **Given** subtasks are preserved after parent deletion, **When** the list refreshes, **Then** the preserved tasks retain their title, status, description, assignees, and custom field values.

---

### User Story 3 - Delete Simple Task Without Subtasks (Priority: P2)

As a user managing tasks, when I delete a task that has no child subtasks, I want a standard confirmation without unnecessary subtask choice options, so that I can quickly remove simple tasks.

**Why this priority**: Ensures standard task deletion remains fast and uncluttered for tasks without hierarchy.

**Independent Test**: Can be tested by deleting a task with 0 subtasks and verifying that only the standard confirmation is presented and processed.

**Acceptance Scenarios**:

1. **Given** a task with no subtasks, **When** the user requests deletion, **Then** standard confirmation is presented without subtask choice toggles or options.
2. **Given** confirmation is granted for a simple task, **When** confirmed, **Then** the task is removed and UI updates smoothly.

---

### User Story 4 - Cancel Task Deletion (Priority: P3)

As a user managing tasks, when I open the deletion dialog and decide not to proceed, I want to cancel the action without any modifications to the parent or child tasks.

**Why this priority**: Essential safety mechanism to prevent unintended operations.

**Independent Test**: Can be tested by opening the deletion modal on any task and clicking cancel or dismissing the dialog, verifying no changes occur.

**Acceptance Scenarios**:

1. **Given** the deletion dialog is open for any task (with or without subtasks), **When** the user cancels or dismisses the dialog, **Then** no deletion occurs and the task hierarchy remains completely intact.

---

### Edge Cases

- What happens when a user attempts to delete a parent task while one of its subtasks is actively being edited in another view or by another user?
- What happens if the deletion operation fails due to network or server issues? The dialog should provide clear feedback and allow retrying or canceling without leaving the UI in an inconsistent state.
- What happens if a parent task has completed vs incomplete subtasks? The choice should clearly indicate that all subtasks are affected according to the selected option.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST detect whether a task has one or more subtasks before initiating deletion.
- **FR-002**: When a task has subtasks, the system MUST present a choice dialog allowing the user to select between deleting all subtasks (cascade) or keeping subtasks as standalone tasks.
- **FR-003**: The deletion dialog MUST clearly explain the consequences of each choice to the user before confirmation.
- **FR-004**: The system MUST allow the user to cancel the deletion at any time before submission with zero data modifications.
- **FR-005**: When cascade deletion is chosen, the system MUST remove the parent task and all its associated child subtasks.
- **FR-006**: When standalone retention is chosen, the system MUST remove only the parent task and ensure all child subtasks remain accessible as standalone tasks.
- **FR-007**: When a task has no subtasks, the system MUST bypass the cascade selection options and present a standard delete confirmation.
- **FR-008**: The system MUST provide accessible keyboard navigation (Tab, Enter, Escape) and screen-reader accessible elements in the deletion dialog.
- **FR-009**: The system MUST provide clear error feedback if the deletion operation fails and maintain state consistency.

### Key Entities

- **Task**: An item of work containing metadata (title, status, assignees, custom fields) and optional relationships to child subtasks or a parent task.
- **Subtask**: A task entity associated with a parent task. When detached, it becomes a top-level task without a parent reference.
- **Deletion Option**: A choice indicating whether to delete child subtasks alongside the parent (`cascade = true`) or keep them as standalone tasks (`cascade = false`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of deletion attempts on tasks with subtasks display the choice dialog prior to deletion execution.
- **SC-002**: 0% accidental subtask data loss when users select the option to preserve subtasks as standalone items.
- **SC-003**: 100% of preserved subtasks retain their original metadata (title, status, custom fields) after their parent task is deleted.
- **SC-004**: Users can understand the options and complete or cancel the deletion in under 5 seconds.
- **SC-005**: The deletion workflow operates with full keyboard accessibility (closing on Escape, focus management, confirmation via Enter/Space).

## Assumptions

- Subtasks are identified by their parent-child relationship with the target task.
- When subtasks are preserved, they remain within the same project workspace as standalone tasks.
- The underlying service layer supports specifying whether deletion cascades to subtasks or unlinks them.
