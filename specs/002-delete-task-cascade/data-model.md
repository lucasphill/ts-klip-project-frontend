# Data Model: Task Deletion Choice (Cascade vs Detach Subtasks)

**Feature**: `002-delete-task-cascade`  
**Date**: 2026-08-17

## Domain Entities & Types

### 1. TaskDeletionOptions

Represents the user selection when deleting a task with child subtasks.

```typescript
export type TaskDeletionStrategy = 'cascade' | 'detach';

export interface TaskDeletionTarget {
  id: string;
  title: string;
  subtaskCount: number;
  descendantTaskIds: string[];
}

export interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskDeletionTarget | null;
  onConfirm: (taskId: string, cascade?: boolean) => Promise<boolean | void>;
}
```

### 2. Task Hierarchy Relationships

```typescript
export interface TaskHierarchyItem {
  id: string;
  title: string;
  parentTaskId?: string | null;
  parent_task_id?: string | null;
}
```

- **Parent Task**: A task whose `id` is referenced by other tasks as their `parentTaskId`.
- **Direct Child Task**: A task where `parentTaskId === parentTask.id`.
- **Descendant Tasks**: All direct and indirect child tasks identified recursively via `getDescendantTaskIds(tasks, parentTaskId)`.

### 3. State Transitions for Task Deletion

| Initial State | Action / Strategy | API Call | Local State Transition | Final State |
| :--- | :--- | :--- | :--- | :--- |
| Task with 0 subtasks | Delete confirmed | `DELETE /Tasks/{id}` | Remove `taskId` from tasks list | Task is permanently deleted |
| Task with $N$ subtasks | Confirm Cascade (`cascade=true`) | `DELETE /Tasks/{id}?cascade=true` | Remove `taskId` and all `descendantTaskIds` from tasks list | Parent and all $N$ subtasks deleted |
| Task with $N$ subtasks | Confirm Detach (`cascade=false`) | `DELETE /Tasks/{id}?cascade=false` | Remove `taskId`, update direct children to `parentTaskId = undefined` | Parent deleted, subtasks promoted to standalone root tasks |
| Any deletion modal | Cancel / Dismiss | None | No change | Original hierarchy preserved |
