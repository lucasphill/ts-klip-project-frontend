import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { tasksApi } from '../services/api';
import type { GetTasksDto, GetTasksWithCustomFieldsDto } from '../types/apiTypes';

type TaskWithCustomFields = GetTasksDto & Pick<GetTasksWithCustomFieldsDto, 'customFields'>;

interface TasksContextValue {
  tasks: TaskWithCustomFields[];
  fetchTasks: (options?: { force?: boolean }) => Promise<void>;
  appendTask: (task: GetTasksDto | GetTasksWithCustomFieldsDto) => void;
  updateTaskLocal: (taskId: string, updates: Partial<TaskWithCustomFields>) => void;
  removeTaskLocal: (taskId: string) => void;
  removeTasksLocal: (taskIds: string[]) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

const normalizeDueDate = (task: GetTasksDto | GetTasksWithCustomFieldsDto): TaskWithCustomFields => {
  const rawDueDate = (task as any).dueDate ?? (task as any).due_date;
  return {
    ...task,
    customFields: 'customFields' in task ? task.customFields ?? {} : {},
    dueDate:
      typeof rawDueDate === 'string' && rawDueDate.trim()
        ? rawDueDate.split('T')[0]
        : undefined,
  };
};

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<TaskWithCustomFields[]>([]);
  const tasksRef = useRef<TaskWithCustomFields[]>([]);
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
      .getAllWithCustomFields()
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

  const appendTask = useCallback((task: GetTasksDto | GetTasksWithCustomFieldsDto) => {
    setTasks((prev) => {
      const nextTasks = [...prev, normalizeDueDate(task)];
      tasksRef.current = nextTasks;
      hasFetchedOnceRef.current = true;
      return nextTasks;
    });
  }, []);

  const updateTaskLocal = useCallback((taskId: string, updates: Partial<TaskWithCustomFields>) => {
    setTasks((prev) => {
      const nextTasks = prev.map((task) => (task.id === taskId ? normalizeDueDate({ ...task, ...updates }) : task));
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
