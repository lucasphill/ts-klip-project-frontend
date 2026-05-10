import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { projectsApi } from '../services/api';
import type { GetProjectsDto } from '../types/apiTypes';

interface ProjectsContextValue {
  projects: GetProjectsDto[];
  fetchProjects: (options?: { force?: boolean }) => Promise<GetProjectsDto[]>;
  updateProjectLocal: (projectId: string, updates: Partial<GetProjectsDto>) => void;
  removeProjectLocal: (projectId: string) => void;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<GetProjectsDto[]>([]);
  const projectsRef = useRef<GetProjectsDto[]>([]);
  const hasFetchedOnceRef = useRef(false);
  const fetchPromiseRef = useRef<Promise<GetProjectsDto[]> | null>(null);

  const fetchProjects = useCallback(async (options?: { force?: boolean }): Promise<GetProjectsDto[]> => {
    const shouldForce = options?.force ?? false;

    if (fetchPromiseRef.current && !shouldForce) {
      return fetchPromiseRef.current;
    }

    if (hasFetchedOnceRef.current && !shouldForce) {
      return projectsRef.current;
    }

    fetchPromiseRef.current = projectsApi
      .getAll()
      .then((response) => {
        const data = response.data ?? [];
        projectsRef.current = data;
        hasFetchedOnceRef.current = true;
        setProjects(data);
        return data;
      })
      .finally(() => {
        fetchPromiseRef.current = null;
      });

    return fetchPromiseRef.current;
  }, []);

  const updateProjectLocal = useCallback((projectId: string, updates: Partial<GetProjectsDto>) => {
    setProjects((prev) => {
      const nextProjects = prev.map((project) => (project.id === projectId ? { ...project, ...updates } : project));
      projectsRef.current = nextProjects;
      hasFetchedOnceRef.current = true;
      return nextProjects;
    });
  }, []);

  const removeProjectLocal = useCallback((projectId: string) => {
    setProjects((prev) => {
      const nextProjects = prev.filter((project) => project.id !== projectId);
      projectsRef.current = nextProjects;
      hasFetchedOnceRef.current = true;
      return nextProjects;
    });
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
