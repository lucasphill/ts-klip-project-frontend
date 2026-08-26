# Data Model: Estado de Carregamento Animado e Sincronização da Barra Lateral

**Feature**: Estado de Carregamento Animado, Sincronização e Transição Suave da Barra Lateral
**Branch**: `013-sidebar-loading-state`
**Date**: 2026-08-25

---

## 1. Extensão do Estado no `ProjectsContext`

```typescript
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

  // Projetos Arquivados
  archivedProjects: GetProjectsDto[];
  fetchArchivedProjects: (options?: { force?: boolean }) => Promise<GetProjectsDto[]>;
  archiveProject: (projectId: string) => Promise<void>;
  unarchiveProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string, options?: { deleteTasks?: boolean }) => Promise<void>;
}
```

---

## 2. Estado de Carregamento Local na Barra Lateral

```typescript
interface SidebarLoadingState {
  isInitialLoading: boolean;
}
```
