import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { tasksApi } from '../services/api';
import type { CustomFieldValue, GetTasksDto } from '../types/apiTypes';

type TasksContextTask = GetTasksDto & {
  customFields?: Record<string, CustomFieldValue>;
};

interface TasksContextValue {
  tasks: TasksContextTask[];
  fetchTasks: (options?: { force?: boolean }) => Promise<void>;
  appendTask: (task: GetTasksDto) => void;
  updateTaskLocal: (taskId: string, updates: Partial<TasksContextTask>) => void;
  removeTaskLocal: (taskId: string) => void;
  removeTasksLocal: (taskIds: string[]) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

const normalizeDueDate = (task: TasksContextTask): TasksContextTask => {
  const rawDueDate = (task as any).dueDate ?? (task as any).due_date;
  return {
    ...task,
    dueDate:
      typeof rawDueDate === 'string' && rawDueDate.trim()
        ? rawDueDate.split('T')[0]
        : undefined,
  };
};

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<TasksContextTask[]>([]);
  const tasksRef = useRef<TasksContextTask[]>([]);
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

    fetchPromiseRef.current = (async () => {
      try {
        return await tasksApi.getWithCustomFields();
      } catch {
        return await tasksApi.getAll();
      }
    })()
      .then((response) => {
        const normalizedTasks = (response.data ?? []).map(normalizeDueDate);
        tasksRef.current = normalizedTasks;
        hasFetchedOnceRef.current = true;
        setTasks(normalizedTasks);
      })
      .finally(() => {
        fetchPromiseRef.current = null;
      });

    return fetchPromiseRef.current;
  }, []);

  const appendTask = useCallback((task: GetTasksDto) => {
    setTasks((prev) => {
      const nextTasks = [...prev, normalizeDueDate(task)];
      tasksRef.current = nextTasks;
      hasFetchedOnceRef.current = true;
      return nextTasks;
    });
  }, []);

  const updateTaskLocal = useCallback((taskId: string, updates: Partial<GetTasksDto>) => {
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
