import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { httpGateway } from '../gateway/httpGateway';
import type { Task } from '../gateway/klipGateway';
import { TASKS_QUERY_KEY, tasksQueryOptions } from '../taskOperations/taskOperations';
import type { GetTasksWithCustomFieldsDto } from '../types/apiTypes';

/**
 * Legacy task API for the screens not yet migrated to Task operations.
 * It is only an adapter over the single ['tasks'] query cache (ADR 0001), so
 * every screen sees the same tasks. To be removed once all screens use
 * Task operations.
 */
interface TasksContextValue {
  tasks: GetTasksWithCustomFieldsDto[];
  fetchTasks: (options?: { force?: boolean }) => Promise<void>;
  appendTask: (task: GetTasksWithCustomFieldsDto) => void;
  updateTaskLocal: (taskId: string, updates: Partial<GetTasksWithCustomFieldsDto>) => void;
  removeTaskLocal: (taskId: string) => void;
  removeTasksLocal: (taskIds: string[]) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

type LegacyTask = GetTasksWithCustomFieldsDto & { projectIds?: string[] };

const toLegacy = (task: Task): LegacyTask => ({
  ...task,
  dueDate: task.dueDate ? task.dueDate.split('T')[0] : undefined,
  parentTaskId: task.parentTaskId ?? undefined,
  createdAt: task.createdAt ?? undefined,
});

const fromLegacy = (task: LegacyTask): Task => ({
  id: task.id,
  title: task.title,
  notes: task.notes ?? null,
  dueDate: task.dueDate || null,
  isCompleted: task.isCompleted ?? false,
  parentTaskId: task.parentTaskId ?? task.parent_task_id ?? null,
  projectIds: task.projectIds ?? [],
  createdAt: task.createdAt ?? null,
  googleCalendarEventId: task.googleCalendarEventId ?? task.google_calendar_event_id ?? null,
  customFields: { ...(task.customFields ?? {}) },
});

/** Legacy partial updates use `undefined` to clear a field; the cache uses null. */
const mergeLegacy = (task: Task, updates: Partial<LegacyTask>): Task => {
  const next: Record<string, unknown> = { ...task };
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id') continue;
    if (key === 'customFields') next.customFields = { ...(value as object | undefined) };
    else if (key === 'dueDate') next.dueDate = (value as string | undefined) || null;
    else next[key] = value === undefined ? null : value;
  }
  return next as unknown as Task;
};

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  // Observes the shared cache without fetching on its own: this provider also
  // wraps the public pages. Screens fetch through fetchTasks or Task operations.
  const { data } = useQuery({ ...tasksQueryOptions(httpGateway), enabled: false });

  const tasks = useMemo(() => (data ?? []).map(toLegacy), [data]);

  const writeTasks = useCallback(
    (update: (tasks: Task[]) => Task[]) =>
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (current) => update(current ?? [])),
    [queryClient],
  );

  const fetchTasks = useCallback(
    async (options?: { force?: boolean }) => {
      const query = tasksQueryOptions(httpGateway);
      if (options?.force) {
        await queryClient.fetchQuery({ ...query, staleTime: 0 });
      } else {
        await queryClient.ensureQueryData(query);
      }
    },
    [queryClient],
  );

  const appendTask = useCallback(
    (task: GetTasksWithCustomFieldsDto) =>
      writeTasks((current) => [...current.filter((t) => t.id !== task.id), fromLegacy(task)]),
    [writeTasks],
  );

  const updateTaskLocal = useCallback(
    (taskId: string, updates: Partial<GetTasksWithCustomFieldsDto>) =>
      writeTasks((current) => current.map((task) => (task.id === taskId ? mergeLegacy(task, updates) : task))),
    [writeTasks],
  );

  const removeTasksLocal = useCallback(
    (taskIds: string[]) => {
      const ids = new Set(taskIds.filter(Boolean));
      if (ids.size === 0) return;
      writeTasks((current) => current.filter((task) => !ids.has(task.id)));
    },
    [writeTasks],
  );

  const removeTaskLocal = useCallback((taskId: string) => removeTasksLocal([taskId]), [removeTasksLocal]);

  const value = useMemo(
    () => ({ tasks, fetchTasks, appendTask, updateTaskLocal, removeTaskLocal, removeTasksLocal }),
    [tasks, fetchTasks, appendTask, updateTaskLocal, removeTaskLocal, removeTasksLocal],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasksContext = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasksContext must be used within TasksProvider');
  return ctx;
};
