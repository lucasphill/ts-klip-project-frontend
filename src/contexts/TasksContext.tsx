import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { tasksApi } from '../services/api';
import type { GetTasksDto } from '../types/apiTypes';

interface TasksContextValue {
  tasks: GetTasksDto[];
  fetchTasks: () => Promise<void>;
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

  const fetchTasks = useCallback(async () => {
    const response = await tasksApi.getAll();
    setTasks((response.data ?? []).map(normalizeDueDate));
  }, []);

  const appendTask = useCallback((task: GetTasksDto) => {
    setTasks(prev => [...prev, normalizeDueDate(task)]);
  }, []);

  const updateTaskLocal = useCallback((taskId: string, updates: Partial<GetTasksDto>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  }, []);

  const removeTaskLocal = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
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
