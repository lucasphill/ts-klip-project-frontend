import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { projectGroupsApi, projectsApi } from '../services/api';
import type {
  CreateProjectGroupDto,
  GetProjectGroupDto,
  GetProjectsDto,
} from '../types/apiTypes';

interface ProjectsContextValue {
  // Estado de Carregamento
  isLoading: boolean;
  isLoadingProjects: boolean;
  isLoadingGroups: boolean;

  // Projetos Ativos
  projects: GetProjectsDto[];
  fetchProjects: (options?: { force?: boolean }) => Promise<GetProjectsDto[]>;
  updateProjectLocal: (projectId: string, updates: Partial<GetProjectsDto>) => void;
  removeProjectLocal: (projectId: string) => void;

  // Grupos de Projetos
  projectGroups: GetProjectGroupDto[];
  fetchProjectGroups: (options?: { force?: boolean }) => Promise<GetProjectGroupDto[]>;
  createProjectGroup: (data: CreateProjectGroupDto) => Promise<GetProjectGroupDto>;
  updateProjectGroup: (groupId: string, data: CreateProjectGroupDto) => Promise<GetProjectGroupDto>;
  deleteProjectGroup: (groupId: string) => Promise<void>;
  reorderProjectGroups: (groupIdsInOrder: string[]) => Promise<void>;

  // Projetos Arquivados e Ciclo de Vida
  archivedProjects: GetProjectsDto[];
  fetchArchivedProjects: (options?: { force?: boolean }) => Promise<GetProjectsDto[]>;
  archiveProject: (projectId: string) => Promise<void>;
  unarchiveProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string, options?: { deleteTasks?: boolean }) => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<GetProjectsDto[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<GetProjectsDto[]>([]);
  const [projectGroups, setProjectGroups] = useState<GetProjectGroupDto[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(true);

  const projectsRef = useRef<GetProjectsDto[]>([]);
  const archivedProjectsRef = useRef<GetProjectsDto[]>([]);
  const projectGroupsRef = useRef<GetProjectGroupDto[]>([]);

  const hasFetchedProjectsRef = useRef(false);
  const hasFetchedArchivedProjectsRef = useRef(false);
  const hasFetchedGroupsRef = useRef(false);

  const fetchProjectsPromiseRef = useRef<Promise<GetProjectsDto[]> | null>(null);
  const fetchArchivedPromiseRef = useRef<Promise<GetProjectsDto[]> | null>(null);
  const fetchGroupsPromiseRef = useRef<Promise<GetProjectGroupDto[]> | null>(null);

  // #region Projects
  const fetchProjects = useCallback(async (options?: { force?: boolean }): Promise<GetProjectsDto[]> => {
    const shouldForce = options?.force ?? false;

    if (fetchProjectsPromiseRef.current && !shouldForce) {
      return fetchProjectsPromiseRef.current;
    }

    if (hasFetchedProjectsRef.current && !shouldForce) {
      setIsLoadingProjects(false);
      return projectsRef.current;
    }

    setIsLoadingProjects(true);
    fetchProjectsPromiseRef.current = projectsApi
      .getAll({ archived: false })
      .then((response) => {
        const data = response.data ?? [];
        projectsRef.current = data;
        hasFetchedProjectsRef.current = true;
        setProjects(data);
        return data;
      })
      .finally(() => {
        fetchProjectsPromiseRef.current = null;
        setIsLoadingProjects(false);
      });

    return fetchProjectsPromiseRef.current;
  }, []);

  const updateProjectLocal = useCallback((projectId: string, updates: Partial<GetProjectsDto>) => {
    setProjects((prev) => {
      const nextProjects = prev.map((project) => (project.id === projectId ? { ...project, ...updates } : project));
      projectsRef.current = nextProjects;
      hasFetchedProjectsRef.current = true;
      return nextProjects;
    });
  }, []);

  const removeProjectLocal = useCallback((projectId: string) => {
    setProjects((prev) => {
      const nextProjects = prev.filter((project) => project.id !== projectId);
      projectsRef.current = nextProjects;
      hasFetchedProjectsRef.current = true;
      return nextProjects;
    });
    setArchivedProjects((prev) => {
      const nextArchived = prev.filter((project) => project.id !== projectId);
      archivedProjectsRef.current = nextArchived;
      return nextArchived;
    });
  }, []);
  // #endregion

  // #region Project Groups
  const fetchProjectGroups = useCallback(async (options?: { force?: boolean }): Promise<GetProjectGroupDto[]> => {
    const shouldForce = options?.force ?? false;

    if (fetchGroupsPromiseRef.current && !shouldForce) {
      return fetchGroupsPromiseRef.current;
    }

    if (hasFetchedGroupsRef.current && !shouldForce) {
      setIsLoadingGroups(false);
      return projectGroupsRef.current;
    }

    setIsLoadingGroups(true);
    fetchGroupsPromiseRef.current = projectGroupsApi
      .getAll()
      .then((response) => {
        const data = response.data ?? [];
        projectGroupsRef.current = data;
        hasFetchedGroupsRef.current = true;
        setProjectGroups(data);
        return data;
      })
      .finally(() => {
        fetchGroupsPromiseRef.current = null;
        setIsLoadingGroups(false);
      });

    return fetchGroupsPromiseRef.current;
  }, []);

  const createProjectGroup = useCallback(async (data: CreateProjectGroupDto): Promise<GetProjectGroupDto> => {
    const response = await projectGroupsApi.create(data);
    const createdGroup = response.data;
    await fetchProjectGroups({ force: true });
    return createdGroup;
  }, [fetchProjectGroups]);

  const updateProjectGroup = useCallback(async (groupId: string, data: CreateProjectGroupDto): Promise<GetProjectGroupDto> => {
    const response = await projectGroupsApi.update(groupId, data);
    const updatedGroup = response.data;
    setProjectGroups((prev) => {
      const next = prev.map((g) => (g.id === groupId ? { ...g, ...updatedGroup } : g));
      projectGroupsRef.current = next;
      return next;
    });
    return updatedGroup;
  }, []);

  const deleteProjectGroup = useCallback(async (groupId: string): Promise<void> => {
    await projectGroupsApi.remove(groupId);
    setProjectGroups((prev) => {
      const next = prev.filter((g) => g.id !== groupId);
      projectGroupsRef.current = next;
      return next;
    });
    // Desvincula localmente projetos que pertenciam a esse grupo
    setProjects((prev) => {
      const next = prev.map((p) => (p.groupId === groupId || (p as any).group_id === groupId ? { ...p, groupId: null, group_id: null } : p));
      projectsRef.current = next;
      return next;
    });
  }, []);

  const reorderProjectGroups = useCallback(async (groupIdsInOrder: string[]): Promise<void> => {
    await projectGroupsApi.reorder({ groupIdsInOrder });
    setProjectGroups((prev) => {
      const groupMap = new Map(prev.map((g) => [g.id, g]));
      const next: GetProjectGroupDto[] = [];
      groupIdsInOrder.forEach((id, idx) => {
        const group = groupMap.get(id);
        if (group) {
          next.push({ ...group, orderIndex: idx });
        }
      });
      // Adiciona eventuais grupos restantes
      prev.forEach((g) => {
        if (!groupIdsInOrder.includes(g.id)) {
          next.push(g);
        }
      });
      projectGroupsRef.current = next;
      return next;
    });
  }, []);
  // #endregion

  // #region Archived Projects & Lifecycle
  const fetchArchivedProjects = useCallback(async (options?: { force?: boolean }): Promise<GetProjectsDto[]> => {
    const shouldForce = options?.force ?? false;

    if (fetchArchivedPromiseRef.current && !shouldForce) {
      return fetchArchivedPromiseRef.current;
    }

    if (hasFetchedArchivedProjectsRef.current && !shouldForce) {
      return archivedProjectsRef.current;
    }

    fetchArchivedPromiseRef.current = projectsApi
      .getAll({ archived: true })
      .then((response) => {
        const data = response.data ?? [];
        archivedProjectsRef.current = data;
        hasFetchedArchivedProjectsRef.current = true;
        setArchivedProjects(data);
        return data;
      })
      .finally(() => {
        fetchArchivedPromiseRef.current = null;
      });

    return fetchArchivedPromiseRef.current;
  }, []);

  const archiveProject = useCallback(async (projectId: string): Promise<void> => {
    await projectsApi.archive(projectId);
    const targetProject = projectsRef.current.find((p) => p.id === projectId);
    if (targetProject) {
      const archived: GetProjectsDto = {
        ...targetProject,
        isArchived: true,
        is_archived: true,
        archivedAt: new Date().toISOString(),
        archived_at: new Date().toISOString(),
      };
      setProjects((prev) => {
        const next = prev.filter((p) => p.id !== projectId);
        projectsRef.current = next;
        return next;
      });
      setArchivedProjects((prev) => {
        const next = [archived, ...prev.filter((p) => p.id !== projectId)];
        archivedProjectsRef.current = next;
        return next;
      });
    } else {
      await Promise.all([fetchProjects({ force: true }), fetchArchivedProjects({ force: true })]);
    }
  }, [fetchArchivedProjects, fetchProjects]);

  const unarchiveProject = useCallback(async (projectId: string): Promise<void> => {
    await projectsApi.unarchive(projectId);
    const targetProject = archivedProjectsRef.current.find((p) => p.id === projectId);
    if (targetProject) {
      const active: GetProjectsDto = {
        ...targetProject,
        isArchived: false,
        is_archived: false,
        archivedAt: null,
        archived_at: null,
      };
      setArchivedProjects((prev) => {
        const next = prev.filter((p) => p.id !== projectId);
        archivedProjectsRef.current = next;
        return next;
      });
      setProjects((prev) => {
        const next = [...prev.filter((p) => p.id !== projectId), active];
        projectsRef.current = next;
        return next;
      });
    } else {
      await Promise.all([fetchProjects({ force: true }), fetchArchivedProjects({ force: true })]);
    }
  }, [fetchArchivedProjects, fetchProjects]);

  const deleteProject = useCallback(async (projectId: string, options?: { deleteTasks?: boolean }): Promise<void> => {
    await projectsApi.remove(projectId, options);
    removeProjectLocal(projectId);
  }, [removeProjectLocal]);
  // #endregion

  const isLoading = isLoadingProjects || isLoadingGroups;

  return (
    <ProjectsContext.Provider
      value={{
        isLoading,
        isLoadingProjects,
        isLoadingGroups,
        projects,
        fetchProjects,
        updateProjectLocal,
        removeProjectLocal,
        projectGroups,
        fetchProjectGroups,
        createProjectGroup,
        updateProjectGroup,
        deleteProjectGroup,
        reorderProjectGroups,
        archivedProjects,
        fetchArchivedProjects,
        archiveProject,
        unarchiveProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjectsContext = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjectsContext must be used within ProjectsProvider');
  return ctx;
};
