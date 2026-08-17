# Data Model: Fix Subtask Update

## Task

Represents a work item displayed within a project.

| Field | Meaning | Rules |
| --- | --- | --- |
| `id` | Stable task identifier | Required and unique. |
| `title` | User-visible task name | Required, trimmed before saving. |
| `dueDate` | Optional due date | Normalized to the frontend date representation. |
| `isCompleted` | Completion state | Preserved during hierarchy-only updates. |
| `notes` | Optional task notes | Preserved during hierarchy-only updates. |
| `parentTaskId` | Optional identifier of the parent task | Canonical frontend field; empty values normalize to no parent. |

### Relationships

- A task belongs to one or more project assignments managed separately from its editable fields.
- A task has zero or one parent task.
- A parent task can have zero or more child tasks.
- A valid parent is in the active project, is not the task itself, and is not one of the task's
  descendants.

### State Transitions

| Current state | User action | Result |
| --- | --- | --- |
| Root task | Select a valid parent and save | Task becomes that parent's child after persistence succeeds. |
| Subtask | Select no parent and save | Task becomes a root task after persistence succeeds. |
| Subtask | Save unrelated edits | Parent relationship remains unchanged. |
| Any task | Save fails | Previously persisted hierarchy remains the displayed authoritative state and an error is shown. |

## API Boundary Representation

Incoming task records are normalized to the canonical `parentTaskId` field before they are used by
the edit form or hierarchy tree. The outbound update contract is documented in
[contracts/task-update.md](./contracts/task-update.md) and must be confirmed against a live request
before the implementation is accepted.
