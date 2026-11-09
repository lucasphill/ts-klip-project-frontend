/**
 * Klip gateway: the single seam between the frontend and the server for
 * tasks and custom-field values. Two adapters implement it:
 * - `httpGateway` (axios, production)
 * - `createMemoryGateway` (in memory, tests)
 *
 * Every method returns unwrapped, canonical camelCase entities (no
 * ResponseModelDto, no snake_case aliases) and rejects only with
 * GatewayError. See CONTEXT.md and docs/adr 0001/0002.
 */

/** A unit of work. `parentTaskId` set means it is a Subtask. */
export interface Task {
  id: string;
  title: string;
  notes: string | null;
  /** As sent by the server (`YYYY-MM-DDT00:00:00`), or null. */
  dueDate: string | null;
  isCompleted: boolean;
  parentTaskId: string | null;
  /** Project membership: the projects this task belongs to. */
  projectIds: string[];
  createdAt: string | null;
  googleCalendarEventId: string | null;
  /** Universal custom-field values, keyed by field name, as the server sends them. */
  customFields: Record<string, string>;
}

/** Everything the server stores for a task. Update always sends all of it. */
export interface TaskFields {
  title: string;
  notes: string | null;
  /** `YYYY-MM-DD` or any ISO date-time; empty or null clears it. */
  dueDate: string | null;
  isCompleted: boolean;
  parentTaskId: string | null;
}

export interface CreateTaskInput extends Partial<Omit<TaskFields, "title">> {
  title: string;
  /** Projects to link in the same transaction as the task. */
  projectIds?: string[];
}

export interface UpdateTaskInput extends TaskFields {
  /** Omitted: links untouched. Array: links become exactly this set ([] removes all). */
  projectIds?: string[];
}

export type DeleteMode = "cascade" | "detach";

export interface DeleteTaskResult {
  /** Cascade delete: the task and its whole subtree. Detach delete: just the task. */
  deletedTaskIds: string[];
  /** Detach delete: direct subtasks that became top-level tasks. */
  detachedTaskIds: string[];
}

export interface DeleteCompletedResult {
  deletedTaskIds: string[];
}

export interface CustomValueInput {
  taskId: string;
  customFieldId: string;
  valueText?: string | null;
  valueNumber?: number | null;
  selectedOptionId?: string | null;
}

export interface CustomValue {
  id: string;
  taskId: string;
  customFieldId: string;
  valueText: string | null;
  valueNumber: number | null;
  selectedOptionId: string | null;
}

/** Custom-field values of a project's tasks: taskId → field name → value. */
export type ProjectCustomValues = Record<string, Record<string, string>>;

export interface KlipGateway {
  listTasks(): Promise<Task[]>;
  createTask(input: CreateTaskInput): Promise<Task>;
  updateTask(taskId: string, input: UpdateTaskInput): Promise<Task>;
  deleteTask(taskId: string, mode: DeleteMode): Promise<DeleteTaskResult>;
  /** Delete completed, globally or within one project. */
  deleteCompleted(projectId?: string): Promise<DeleteCompletedResult>;

  createCustomValue(input: CustomValueInput, projectId?: string): Promise<CustomValue>;
  updateCustomValue(input: CustomValueInput, projectId?: string): Promise<CustomValue>;
  /** Removes the value of one field of one task. No value is not an error. */
  deleteCustomValue(taskId: string, customFieldId: string, projectId?: string): Promise<void>;
  listProjectCustomValues(projectId: string): Promise<ProjectCustomValues>;
}

const emptyToNull = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/** `YYYY-MM-DD…` → `YYYY-MM-DDT00:00:00`; empty → null. */
export const toApiDueDate = (value: string | null | undefined): string | null => {
  const date = emptyToNull(value)?.split("T")[0];
  return date ? `${date}T00:00:00` : null;
};

/** The complete body the server expects on create/update, with null for cleared fields. */
export const toTaskBody = (input: CreateTaskInput | UpdateTaskInput) => ({
  title: input.title.trim(),
  notes: emptyToNull(input.notes),
  dueDate: toApiDueDate(input.dueDate),
  isCompleted: input.isCompleted ?? false,
  parentTaskId: emptyToNull(input.parentTaskId),
  ...(input.projectIds !== undefined ? { projectIds: [...new Set(input.projectIds)] } : {}),
});
