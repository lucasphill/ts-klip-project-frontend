import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { tasksApi } from '../services/api';
import type { GetTasksDto } from '../types/apiTypes';

interface TasksContextValue {
  tasks: GetTasksDto[];
  fetchTasks: (options?: { force?: boolean }) => Promise<void>;
  appendTask: (task: GetTasksDto) => void;
  updateTaskLocal: (taskId: string, updates: Partial<GetTasksDto>) => void;
  removeTaskLocal: (taskId: string) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

const normalizeDueDate = (task: GetTasksDto): GetTasksDto => {
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
  const [tasks, setTasks] = useState<GetTasksDto[]>([]);
  const tasksRef = useRef<GetTasksDto[]>([]);
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

    fetchPromiseRef.current = tasksApi
      .getAll()
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

  return (
    <TasksContext.Provider value={{ tasks, fetchTasks, appendTask, updateTaskLocal, removeTaskLocal }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasksContext = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasksContext must be used within TasksProvider');
  return ctx;
};
