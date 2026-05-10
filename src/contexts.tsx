import { createContext, useContext, useCallback } from 'react'
import type { Task, Project, CustomField } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'

// ─── THEME CONTEXT ────────────────────────────────────────────────────────────

export interface ThemeCtx { isDark: boolean; toggle: () => void }
export const ThemeContext = createContext<ThemeCtx>({ isDark: false, toggle: () => { } })
export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useLocalStorage('klip-theme-dark', false)
  const toggle = useCallback(() => setIsDark(v => !v), [setIsDark])

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ─── LOADER CONTEXT ───────────────────────────────────────────────────────────

export interface LoaderCtx { loading: boolean; showLoader: () => void; hideLoader: () => void }
export const LoaderContext = createContext<LoaderCtx>({ loading: false, showLoader: () => { }, hideLoader: () => { } })
export const useLoader = () => useContext(LoaderContext)

// ─── DATA CONTEXT ─────────────────────────────────────────────────────────────

export interface AppDataCtx {
  tasks: Task[]
  projects: Project[]
  customFields: CustomField[]
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, u: Partial<Task>) => void
  deleteTask: (id: string) => void
  addProject: (p: Omit<Project, 'id' | 'createdAt'>) => Project
  updateProject: (id: string, u: Partial<Project>) => void
  deleteProject: (id: string) => void
  addCustomField: (f: Omit<CustomField, 'id'>) => void
  updateCustomField: (id: string, u: Partial<Omit<CustomField, 'id'>>) => void
  deleteCustomField: (id: string) => void
  setProjectFields: (projectId: string, fieldIds: string[]) => void
}

export const AppDataContext = createContext<AppDataCtx>({
  tasks: [], projects: [], customFields: [],
  addTask: () => { }, updateTask: () => { }, deleteTask: () => { },
  addProject: () => ({} as Project), updateProject: () => { }, deleteProject: () => { },
  addCustomField: () => { }, updateCustomField: () => { }, deleteCustomField: () => { },
  setProjectFields: () => { },
})

export const useAppData = () => useContext(AppDataContext)

// ─── TASK EDIT CONTEXT ────────────────────────────────────────────────────────

export interface TaskEditCtx {
  openEditTask: (task: Task | null, defaultProjectId?: string) => void
}
export const TaskEditContext = createContext<TaskEditCtx>({ openEditTask: () => { } })
export const useTaskEdit = () => useContext(TaskEditContext)
