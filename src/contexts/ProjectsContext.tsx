import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { projectsApi } from '../services/api';
import type { GetProjectsDto } from '../types/apiTypes';

interface ProjectsContextValue {
  projects: GetProjectsDto[];
  fetchProjects: () => Promise<GetProjectsDto[]>;
  updateProjectLocal: (projectId: string, updates: Partial<GetProjectsDto>) => void;
  removeProjectLocal: (projectId: string) => void;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<GetProjectsDto[]>([]);

  const fetchProjects = useCallback(async (): Promise<GetProjectsDto[]> => {
    const response = await projectsApi.getAll();
    const data = response.data ?? [];
    setProjects(data);
    return data;
  }, []);

  const updateProjectLocal = useCallback((projectId: string, updates: Partial<GetProjectsDto>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
  }, []);

  const removeProjectLocal = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  }, []);

  return (
    <ProjectsContext.Provider value={{ projects, fetchProjects, updateProjectLocal, removeProjectLocal }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjectsContext = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjectsContext must be used within ProjectsProvider');
  return ctx;
};
