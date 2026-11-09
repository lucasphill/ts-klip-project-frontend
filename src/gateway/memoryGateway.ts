import { GatewayError } from "../services/gatewayError";
import type {
  CreateTaskInput,
  CustomValue,
  CustomValueInput,
  DeleteMode,
  KlipGateway,
  ProjectCustomValues,
  Task,
  UpdateTaskInput,
} from "./klipGateway";
import { toTaskBody } from "./klipGateway";

export interface MemoryProject {
  id: string;
  isArchived?: boolean;
}

export interface MemoryField {
  id: string;
  name: string;
  isUniversal?: boolean;
  /** Projects where this (project-specific) field is enabled. */
  enabledInProjectIds?: string[];
}

export interface MemorySeed {
  tasks?: Array<Partial<Task> & { id: string; title: string }>;
  projects?: MemoryProject[];
  fields?: MemoryField[];
  values?: Array<Omit<CustomValue, "id"> & { id?: string }>;
}

interface StoredTask {
  id: string;
  title: string;
  notes: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  parentTaskId: string | null;
  createdAt: string;
  googleCalendarEventId: string | null;
}

export interface MemoryGateway extends KlipGateway {
  /** The next gateway call rejects with a GatewayError (HTTP 500), then behaviour returns to normal. */
  failNext(): void;
  /** Current server-side state, for assertions. */
  snapshot(): { tasks: Task[]; links: Array<{ projectId: string; taskId: string }>; values: CustomValue[] };
}

const rejectWith = (serverMessage: string, status = 400) => new GatewayError({ status, serverMessage });

/**
 * In-memory Klip gateway for tests. Mirrors the backend rules: Cascade delete,
 * Detach delete, Delete completed (keeping completed tasks with an incomplete
 * subtask), Project membership validation, archived projects hiding their
 * tasks and custom-value project checks.
 */
export const createMemoryGateway = (seed: MemorySeed = {}): MemoryGateway => {
  let idCounter = 0;
  const newId = (prefix: string) => `${prefix}-${++idCounter}`;

  const tasks = new Map<string, StoredTask>();
  const links: Array<{ projectId: string; taskId: string }> = [];
  const projects = new Map((seed.projects ?? []).map((project) => [project.id, { ...project }]));
  const fields = new Map((seed.fields ?? []).map((field) => [field.id, { ...field }]));
  let values: CustomValue[] = [];
  let failNextCall = false;

  for (const task of seed.tasks ?? []) {
    tasks.set(task.id, {
      id: task.id,
      title: task.title,
      notes: task.notes ?? null,
      dueDate: task.dueDate ?? null,
      isCompleted: task.isCompleted ?? false,
      parentTaskId: task.parentTaskId ?? null,
      createdAt: task.createdAt ?? new Date(0).toISOString(),
      googleCalendarEventId: task.googleCalendarEventId ?? null,
    });
    for (const projectId of task.projectIds ?? []) links.push({ projectId, taskId: task.id });
  }
  for (const value of seed.values ?? []) {
    values.push({ ...value, id: value.id ?? newId("value") });
  }

  const projectIdsOf = (taskId: string) => links.filter((l) => l.taskId === taskId).map((l) => l.projectId);

  // Same formatting as the backend dictionary: text ?? number ?? option ?? "".
  const display = (value: CustomValue) =>
    value.valueText ?? (value.valueNumber !== null ? String(value.valueNumber) : null) ?? value.selectedOptionId ?? "";

  const valuesByName = (taskId: string, include: (field: MemoryField) => boolean) => {
    const result: Record<string, string> = {};
    for (const value of values) {
      const field = fields.get(value.customFieldId);
      if (value.taskId === taskId && field && include(field)) result[field.name] = display(value);
    }
    return result;
  };

  const toTask = (stored: StoredTask): Task => ({
    ...stored,
    projectIds: projectIdsOf(stored.id),
    customFields: valuesByName(stored.id, (field) => field.isUniversal === true),
  });

  const removeTasks = (ids: Set<string>) => {
    for (const id of ids) tasks.delete(id);
    for (let i = links.length - 1; i >= 0; i--) if (ids.has(links[i].taskId)) links.splice(i, 1);
    values = values.filter((value) => !ids.has(value.taskId));
  };

  const assertProjectsExist = (projectIds: string[]) => {
    if (projectIds.some((id) => !projects.has(id))) throw rejectWith("Project not found.");
  };

  const setLinks = (taskId: string, projectIds: string[]) => {
    for (let i = links.length - 1; i >= 0; i--) if (links[i].taskId === taskId) links.splice(i, 1);
    for (const projectId of new Set(projectIds)) links.push({ projectId, taskId });
  };

  const taskInProject = (taskId: string, projectId: string) =>
    links.some((l) => l.taskId === taskId && l.projectId === projectId);

  const fieldEnabledInProject = (fieldId: string, projectId: string) =>
    fields.get(fieldId)?.enabledInProjectIds?.includes(projectId) ?? false;

  /** Runs a gateway call: honours failNext() and keeps the async contract. */
  const call = async <T>(operation: () => T): Promise<T> => {
    await Promise.resolve();
    if (failNextCall) {
      failNextCall = false;
      throw rejectWith("Simulated failure", 500);
    }
    return operation();
  };

  const write = (stored: StoredTask, input: CreateTaskInput | UpdateTaskInput) => {
    const body = toTaskBody(input);
    stored.title = body.title;
    stored.notes = body.notes;
    stored.dueDate = body.dueDate;
    stored.isCompleted = body.isCompleted;
    stored.parentTaskId = body.parentTaskId;
    stored.googleCalendarEventId = body.dueDate ? stored.googleCalendarEventId ?? newId("event") : null;
    return body;
  };

  return {
    failNext() {
      failNextCall = true;
    },

    snapshot() {
      return {
        tasks: [...tasks.values()].map(toTask),
        links: links.map((l) => ({ ...l })),
        values: values.map((v) => ({ ...v })),
      };
    },

    listTasks: () =>
      call(() => {
        const archived = new Set([...projects.values()].filter((p) => p.isArchived).map((p) => p.id));
        return [...tasks.values()]
          .filter((task) => !projectIdsOf(task.id).some((projectId) => archived.has(projectId)))
          .map(toTask);
      }),

    createTask: (input) =>
      call(() => {
        if (input.projectIds) assertProjectsExist(input.projectIds);
        const stored: StoredTask = {
          id: newId("task"),
          title: "",
          notes: null,
          dueDate: null,
          isCompleted: false,
          parentTaskId: null,
          createdAt: new Date().toISOString(),
          googleCalendarEventId: null,
        };
        const body = write(stored, input);
        tasks.set(stored.id, stored);
        if (body.projectIds) setLinks(stored.id, body.projectIds);
        return toTask(stored);
      }),

    updateTask: (taskId, input) =>
      call(() => {
        const stored = tasks.get(taskId);
        if (!stored) throw rejectWith("Task not found");
        if (input.projectIds) assertProjectsExist(input.projectIds);
        const body = write(stored, input);
        if (body.projectIds) setLinks(taskId, body.projectIds);
        return toTask(stored);
      }),

    deleteTask: (taskId, mode: DeleteMode) =>
      call(() => {
        if (!tasks.has(taskId)) throw rejectWith("Task not found");

        if (mode === "detach") {
          const detachedTaskIds = [...tasks.values()].filter((t) => t.parentTaskId === taskId).map((t) => t.id);
          for (const id of detachedTaskIds) tasks.get(id)!.parentTaskId = null;
          removeTasks(new Set([taskId]));
          return { deletedTaskIds: [taskId], detachedTaskIds };
        }

        const subtree = new Set<string>();
        const queue = [taskId];
        while (queue.length > 0) {
          const current = queue.shift()!;
          if (subtree.has(current)) continue;
          subtree.add(current);
          for (const task of tasks.values()) if (task.parentTaskId === current) queue.push(task.id);
        }
        removeTasks(subtree);
        return { deletedTaskIds: [...subtree], detachedTaskIds: [] };
      }),

    deleteCompleted: (projectId) =>
      call(() => {
        if (projectId && !projects.has(projectId)) throw rejectWith("Project not found.");

        // Incomplete tasks block themselves and every ancestor.
        const blocked = new Set<string>();
        for (const task of tasks.values()) {
          if (task.isCompleted) continue;
          let current: StoredTask | undefined = task;
          while (current && !blocked.has(current.id)) {
            blocked.add(current.id);
            current = current.parentTaskId ? tasks.get(current.parentTaskId) : undefined;
          }
        }

        const eligible = [...tasks.values()]
          .filter((task) => task.isCompleted && !blocked.has(task.id))
          .filter((task) => !projectId || taskInProject(task.id, projectId))
          .map((task) => task.id);

        const deleted = new Set(eligible);
        // Survivors whose parent was deleted become top-level, as in the backend.
        for (const task of tasks.values()) {
          if (!deleted.has(task.id) && task.parentTaskId && deleted.has(task.parentTaskId)) task.parentTaskId = null;
        }
        removeTasks(deleted);
        return { deletedTaskIds: eligible };
      }),

    createCustomValue: (input: CustomValueInput, projectId) =>
      call(() => {
        if (projectId) {
          if (!taskInProject(input.taskId, projectId))
            throw rejectWith("Task does not belong to this project or you don't have permission.");
          if (!fieldEnabledInProject(input.customFieldId, projectId))
            throw rejectWith("Custom field is not enabled for this project.");
        }
        if (values.some((v) => v.taskId === input.taskId && v.customFieldId === input.customFieldId))
          throw rejectWith("Custom field value already exists for this task. Use update instead.");
        const value: CustomValue = {
          id: newId("value"),
          taskId: input.taskId,
          customFieldId: input.customFieldId,
          valueText: input.valueText ?? null,
          valueNumber: input.valueNumber ?? null,
          selectedOptionId: input.selectedOptionId ?? null,
        };
        values.push(value);
        return { ...value };
      }),

    updateCustomValue: (input: CustomValueInput, projectId) =>
      call(() => {
        if (projectId && !taskInProject(input.taskId, projectId))
          throw rejectWith("Task does not belong to this project or you don't have permission.");
        const value = values.find((v) => v.taskId === input.taskId && v.customFieldId === input.customFieldId);
        if (!value) throw rejectWith("Custom field value not found.");
        value.valueText = input.valueText ?? null;
        value.valueNumber = input.valueNumber ?? null;
        value.selectedOptionId = input.selectedOptionId ?? null;
        return { ...value };
      }),

    deleteCustomValue: (taskId, customFieldId, projectId) =>
      call(() => {
        const value = values.find((v) => v.taskId === taskId && v.customFieldId === customFieldId);
        if (!value) return;
        if (projectId) {
          if (!taskInProject(taskId, projectId))
            throw rejectWith("Task does not belong to this project or you don't have permission.");
          if (!fieldEnabledInProject(customFieldId, projectId))
            throw rejectWith("Custom field is not enabled for this project.");
        }
        values = values.filter((v) => v !== value);
      }),

    listProjectCustomValues: (projectId) =>
      call(() => {
        if (!projects.has(projectId)) throw rejectWith("Project not found.");
        const result: ProjectCustomValues = {};
        for (const link of links) {
          if (link.projectId === projectId) result[link.taskId] = valuesByName(link.taskId, () => true);
        }
        return result;
      }),
  };
};
