import type { CreateTaskDto, GetTasksDto } from "../types/apiTypes";
import { normalizeParentTaskId } from "./taskHierarchy";

type TaskWithParentAlias = GetTasksDto & {
  parent_task_id?: string | null;
};

export type NormalizedTask<T extends TaskWithParentAlias> = Omit<
  T,
  "parentTaskId" | "parent_task_id"
> & {
  parentTaskId?: string;
};

const toApiDueDate = (value?: string) => {
  const normalizedDate = value?.trim().split("T")[0];
  return normalizedDate ? `${normalizedDate}T00:00:00` : undefined;
};

export const normalizeTask = <T extends TaskWithParentAlias>(task: T): NormalizedTask<T> => {
  const { parent_task_id: _parentTaskId, parentTaskId, ...taskWithoutParentAlias } = task;
  const normalizedParentTaskId =
    normalizeParentTaskId(parentTaskId) ?? normalizeParentTaskId(_parentTaskId);

  return {
    ...taskWithoutParentAlias,
    ...(normalizedParentTaskId ? { parentTaskId: normalizedParentTaskId } : {}),
  } as NormalizedTask<T>;
};

export const toTaskPayload = (task: CreateTaskDto): CreateTaskDto => ({
  title: task.title.trim(),
  dueDate: toApiDueDate(task.dueDate),
  isCompleted: task.isCompleted ?? false,
  notes: task.notes?.trim() || undefined,
  parentTaskId: normalizeParentTaskId(task.parentTaskId) ?? null,
});
