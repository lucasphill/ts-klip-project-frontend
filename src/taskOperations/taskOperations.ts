import type { QueryClient } from "@tanstack/react-query";
import type {
  CreateTaskInput,
  DeleteCompletedResult,
  DeleteMode,
  DeleteTaskResult,
  KlipGateway,
  ProjectCustomValues,
  Task,
  TaskFields,
} from "../gateway/klipGateway";
import { GatewayError, errorMessage } from "../services/gatewayError";
import { isMarkdownEmpty } from "../lib/markdown";
import { buildCustomFieldValuePayload } from "../lib/customFields";
import type { CustomFieldType, CustomFieldValue } from "../types/apiTypes";

/**
 * Task operations: owns the single `['tasks']` cache (ADR 0001) and every
 * command that changes tasks. Views are filters over the cache.
 *
 * Commands never reject. They resolve to `{ ok: true, ... }` or
 * `{ ok: false, error }`; on failure the module has already shown the
 * Portuguese toast and rolled the cache back.
 */

export const TASKS_QUERY_KEY = ["tasks"] as const;
export const projectCustomValuesQueryKey = (projectId: string) => ["projectCustomValues", projectId] as const;

export const TASKS_STALE_TIME_MS = 30_000;

export const tasksQueryOptions = (gateway: KlipGateway) => ({
  queryKey: TASKS_QUERY_KEY,
  queryFn: () => gateway.listTasks(),
  staleTime: TASKS_STALE_TIME_MS,
});

export type Failure = { ok: false; error: GatewayError };
export type Result<T> = ({ ok: true } & T) | Failure;

export interface Notifier {
  success(message: string): void;
  error(message: string): void;
}

export interface TaskChanges extends Partial<TaskFields> {
  /** Omitted: links untouched. Array: links become exactly this set. */
  projectIds?: string[];
}

export interface CommandMessages {
  success?: string;
  error?: string;
}

export interface CustomFieldRef {
  id: string;
  name: string;
  type: CustomFieldType;
}

export interface TaskOperations {
  create(input: CreateTaskInput, messages?: CommandMessages): Promise<Result<{ task: Task }>>;
  update(taskId: string, changes: TaskChanges, messages?: CommandMessages): Promise<Result<{ task: Task }>>;
  toggle(taskId: string): Promise<Result<{ task: Task }>>;
  setProjects(taskId: string, projectIds: string[], messages?: CommandMessages): Promise<Result<{ task: Task }>>;
  /** Empty value ("", null, undefined) deletes the stored value. With projectId, edits that project's values. */
  setCustomValue(
    taskId: string,
    field: CustomFieldRef,
    value: CustomFieldValue,
    options?: { projectId?: string },
  ): Promise<Result<object>>;
  deleteTask(taskId: string, mode: DeleteMode): Promise<Result<DeleteTaskResult>>;
  deleteCompleted(projectId?: string, messages?: CommandMessages): Promise<Result<DeleteCompletedResult>>;
}

const isEmptyValue = (value: CustomFieldValue) => value === "" || value === null || value === undefined;

const normalizeNotes = (notes: string | null | undefined) => (isMarkdownEmpty(notes) ? null : (notes ?? "").trim());

const fieldsOf = (task: Task): TaskFields => ({
  title: task.title,
  notes: task.notes,
  dueDate: task.dueDate,
  isCompleted: task.isCompleted,
  parentTaskId: task.parentTaskId,
});

const sameIds = (left: string[], right: string[]) =>
  left.length === right.length && [...left].sort().join("|") === [...right].sort().join("|");

export const createTaskOperations = ({
  gateway,
  queryClient,
  notify,
}: {
  gateway: KlipGateway;
  queryClient: QueryClient;
  notify: Notifier;
}): TaskOperations => {
  const readTasks = () => queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY) ?? [];
  const writeTasks = (update: (tasks: Task[]) => Task[]) =>
    queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (tasks) => update(tasks ?? []));
  const patchTask = (taskId: string, patch: (task: Task) => Task) =>
    writeTasks((tasks) => tasks.map((task) => (task.id === taskId ? patch(task) : task)));
  const findTask = (taskId: string) => readTasks().find((task) => task.id === taskId);

  const fail = (error: unknown, fallback: string): Failure => {
    notify.error(errorMessage(error, fallback));
    return {
      ok: false,
      error: error instanceof GatewayError ? error : new GatewayError({ status: null, cause: error }),
    };
  };

  const missingTask = (fallback: string): Failure =>
    fail(new GatewayError({ status: null, serverMessage: "Task not in cache" }), fallback);

  /** Stops an in-flight list refetch from overwriting an optimistic change. */
  const holdRefetch = () => queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });

  /** The server's version wins, except for the custom values it does not send back on update. */
  const acceptServerTask = (saved: Task) =>
    patchTask(saved.id, (current) => ({ ...saved, customFields: current.customFields }));

  const update: TaskOperations["update"] = async (taskId, changes, messages = {}) => {
    const errorText = messages.error ?? "Erro ao atualizar tarefa";
    await holdRefetch();
    const previous = findTask(taskId);
    if (!previous) return missingTask(errorText);

    const { projectIds, ...fieldChanges } = changes;
    const nextFields: TaskFields = { ...fieldsOf(previous), ...fieldChanges };
    nextFields.notes = normalizeNotes(nextFields.notes);
    nextFields.dueDate = nextFields.dueDate?.trim() || null;
    nextFields.parentTaskId = nextFields.parentTaskId?.trim() || null;
    const changedKeys = (Object.keys(fieldChanges) as Array<keyof TaskFields>).filter(
      (key) => nextFields[key] !== previous[key],
    );
    const changesProjects = projectIds !== undefined && !sameIds(projectIds, previous.projectIds);

    if (changedKeys.length === 0 && !changesProjects) {
      return { ok: true, task: previous };
    }

    // Optimistic: apply now, revert only what this command changed if the server refuses.
    patchTask(taskId, (task) => ({
      ...task,
      ...Object.fromEntries(changedKeys.map((key) => [key, nextFields[key]])),
      ...(changesProjects ? { projectIds: [...new Set(projectIds)] } : {}),
    }));

    try {
      const saved = await gateway.updateTask(taskId, {
        ...nextFields,
        ...(changesProjects ? { projectIds } : {}),
      });
      acceptServerTask(saved);
      if (messages.success) notify.success(messages.success);
      return { ok: true, task: saved };
    } catch (error) {
      patchTask(taskId, (task) => ({
        ...task,
        ...Object.fromEntries(changedKeys.map((key) => [key, previous[key]])),
        ...(changesProjects ? { projectIds: previous.projectIds } : {}),
      }));
      return fail(error, errorText);
    }
  };

  const create: TaskOperations["create"] = async (input, messages = {}) => {
    try {
      const created = await gateway.createTask({ ...input, notes: normalizeNotes(input.notes) });
      writeTasks((tasks) => [...tasks.filter((task) => task.id !== created.id), created]);
      notify.success(messages.success ?? "Tarefa criada com sucesso");
      return { ok: true, task: created };
    } catch (error) {
      return fail(error, messages.error ?? "Erro ao criar tarefa");
    }
  };

  const toggle: TaskOperations["toggle"] = async (taskId) => {
    const task = findTask(taskId);
    if (!task) return missingTask("Erro ao atualizar status");
    return update(
      taskId,
      { isCompleted: !task.isCompleted },
      { success: "Status da tarefa atualizado", error: "Erro ao atualizar status" },
    );
  };

  const setProjects: TaskOperations["setProjects"] = (taskId, projectIds, messages = {}) =>
    update(taskId, { projectIds }, { error: "Erro ao atualizar projetos da tarefa", ...messages });

  const setCustomValue: TaskOperations["setCustomValue"] = async (taskId, field, value, options = {}) => {
    const errorText = "Erro ao salvar campo personalizado";
    const { projectId } = options;

    // Universal values live on the task; project values live in that project's query.
    const read = (): CustomFieldValue =>
      projectId
        ? queryClient.getQueryData<ProjectCustomValues>(projectCustomValuesQueryKey(projectId))?.[taskId]?.[field.name]
        : findTask(taskId)?.customFields[field.name];

    const write = (next: CustomFieldValue) => {
      const withValue = (values: Record<string, CustomFieldValue> = {}) => {
        const copy = { ...values };
        if (isEmptyValue(next)) delete copy[field.name];
        else copy[field.name] = next;
        return copy;
      };
      if (projectId) {
        queryClient.setQueryData<ProjectCustomValues>(projectCustomValuesQueryKey(projectId), (all = {}) => ({
          ...all,
          [taskId]: withValue(all[taskId]),
        }));
      } else {
        patchTask(taskId, (task) => ({ ...task, customFields: withValue(task.customFields) }));
      }
    };

    if (!projectId) {
      await holdRefetch();
      if (!findTask(taskId)) return missingTask(errorText);
    } else {
      await queryClient.cancelQueries({ queryKey: projectCustomValuesQueryKey(projectId) });
    }

    const previous = read();
    const hadValue = !isEmptyValue(previous);
    if (!hadValue && isEmptyValue(value)) return { ok: true };
    if (previous === value) return { ok: true };

    write(value);

    try {
      if (isEmptyValue(value)) {
        await gateway.deleteCustomValue(taskId, field.id, projectId);
      } else {
        const payload = buildCustomFieldValuePayload(taskId, field.id, field.type, value);
        if (hadValue) {
          await gateway.updateCustomValue(payload, projectId);
        } else {
          // A cleared value may still exist as an empty record (older clients wrote "").
          // Deleting first is idempotent and makes create always valid.
          await gateway.deleteCustomValue(taskId, field.id, projectId);
          await gateway.createCustomValue(payload, projectId);
        }
      }
      return { ok: true };
    } catch (error) {
      if (read() === value || (isEmptyValue(read()) && isEmptyValue(value))) write(previous);
      return fail(error, errorText);
    }
  };

  const removeFromCache = (deletedTaskIds: string[], detachedTaskIds: string[] = []) => {
    const deleted = new Set(deletedTaskIds);
    const detached = new Set(detachedTaskIds);
    writeTasks((tasks) =>
      tasks
        .filter((task) => !deleted.has(task.id))
        .map((task) =>
          detached.has(task.id) || (task.parentTaskId && deleted.has(task.parentTaskId))
            ? { ...task, parentTaskId: null }
            : task,
        ),
    );
    void queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
  };

  const deleteTask: TaskOperations["deleteTask"] = async (taskId, mode) => {
    try {
      const result = await gateway.deleteTask(taskId, mode);
      removeFromCache(result.deletedTaskIds, result.detachedTaskIds);
      notify.success(
        mode === "cascade" && result.deletedTaskIds.length > 1
          ? "Tarefa e subtarefas excluídas"
          : result.detachedTaskIds.length > 0
            ? "Tarefa excluída e subtarefas mantidas"
            : "Tarefa excluída",
      );
      return { ok: true, ...result };
    } catch (error) {
      return fail(error, "Erro ao excluir tarefa");
    }
  };

  const deleteCompleted: TaskOperations["deleteCompleted"] = async (projectId, messages = {}) => {
    try {
      const result = await gateway.deleteCompleted(projectId);
      removeFromCache(result.deletedTaskIds);
      const count = result.deletedTaskIds.length;
      if (messages.success !== undefined) {
        notify.success(messages.success);
      } else if (count === 0) {
        notify.success("Nenhuma tarefa concluída encontrada para exclusão.");
      } else {
        notify.success(
          count === 1 ? "1 tarefa concluída foi excluída." : `${count} tarefas concluídas foram excluídas.`,
        );
      }
      return { ok: true, ...result };
    } catch (error) {
      return fail(error, messages.error ?? "Não foi possível excluir as tarefas concluídas.");
    }
  };

  return { create, update, toggle, setProjects, setCustomValue, deleteTask, deleteCompleted };
};
