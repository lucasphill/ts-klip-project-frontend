import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { tasksApi } from '../services/api';
import type { GetTasksWithCustomFieldsDto } from '../types/apiTypes';

interface TasksContextValue {
  tasks: GetTasksWithCustomFieldsDto[];
  fetchTasks: (options?: { force?: boolean }) => Promise<void>;
  appendTask: (task: GetTasksWithCustomFieldsDto) => void;
  updateTaskLocal: (taskId: string, updates: Partial<GetTasksWithCustomFieldsDto>) => void;
  removeTaskLocal: (taskId: string) => void;
  removeTasksLocal: (taskIds: string[]) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

const normalizeTask = (task: GetTasksWithCustomFieldsDto): GetTasksWithCustomFieldsDto => {
  const rawDueDate = (task as any).dueDate ?? (task as any).due_date;
  return {
    ...task,
    dueDate:
      typeof rawDueDate === 'string' && rawDueDate.trim()
        ? rawDueDate.split('T')[0]
        : undefined,
    customFields: task.customFields ?? {},
  };
};

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<GetTasksWithCustomFieldsDto[]>([]);
  const tasksRef = useRef<GetTasksWithCustomFieldsDto[]>([]);
  const hasFetchedOnceRef = useRef(false);
  const fetchPromiseRef = useRef<Promise<void> | null>(null);

  const fetchTasks = useCallback(async (options?: { force?: boolean }) => {
    const shouldForce = options?.force ?? false;

    if (fetchPromiseRef.current && !shouldForce) {
      return fetchPromiseRef.current;
    }

    if (hasFetchedOnceRef.current && !shouldForce) {
      return;
    }

    const promise = tasksApi
      .getAllWithUniversalCustomFields()
      .then((response) => {
        const normalizedTasks = (response.data ?? []).map(normalizeTask);
        tasksRef.current = normalizedTasks;
        hasFetchedOnceRef.current = true;
        setTasks(normalizedTasks);
      })
      .finally(() => {
        if (fetchPromiseRef.current === promise) {
          fetchPromiseRef.current = null;
        }
      });

    fetchPromiseRef.current = promise;
    return promise;
  }, []);

  const appendTask = useCallback((task: GetTasksWithCustomFieldsDto) => {
    setTasks((prev) => {
      const nextTasks = [...prev, normalizeTask(task)];
      tasksRef.current = nextTasks;
      hasFetchedOnceRef.current = true;
      return nextTasks;
    });
  }, []);

  const updateTaskLocal = useCallback((taskId: string, updates: Partial<GetTasksWithCustomFieldsDto>) => {
    setTasks((prev) => {
      const nextTasks = prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task));
      tasksRef.current = nextTasks;
      hasFetchedOnceRef.current = true;
      return nextTasks;
    });
  }, []);

  const removeTaskLocal = useCallback((taskId: string) => {
    setTasks((prev) => {
      const nextTasks = prev.filter((task) => task.id !== taskId);
      tasksRef.current = nextTasks;
      hasFetchedOnceRef.current = true;
      return nextTasks;
    });
  }, []);

  const removeTasksLocal = useCallback((taskIds: string[]) => {
    const idsToRemove = new Set(taskIds.filter(Boolean));
    if (idsToRemove.size === 0) return;

    setTasks((prev) => {
      const nextTasks = prev.filter((task) => !idsToRemove.has(task.id));
      tasksRef.current = nextTasks;
      hasFetchedOnceRef.current = true;
      return nextTasks;
    });
  }, []);

  return (
    <TasksContext.Provider value={{ tasks, fetchTasks, appendTask, updateTaskLocal, removeTaskLocal, removeTasksLocal }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasksContext = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasksContext must be used within TasksProvider');
  return ctx;
};
