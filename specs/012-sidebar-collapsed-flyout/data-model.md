# Data Model: Menu Flutuante (Flyout) e Ergonomia da Barra Lateral Recolhida

**Feature**: Menu Flutuante (Flyout) e Ergonomia da Barra Lateral Recolhida
**Branch**: `012-sidebar-collapsed-flyout`
**Date**: 2026-08-25

---

## 1. Modelos de Apresentação (Frontend State)

Nenhum contrato de dados no backend ou schema de banco de dados é alterado. A feature opera com as entidades já existentes tipadas em `src/types/apiTypes.ts`:

### 1.1 `GetProjectGroupDto`
Representa uma pasta/grupo de projetos:
```typescript
interface GetProjectGroupDto {
  id: string;
  name: string;
  color: string;
  icon?: string;
  order?: number;
}
```

### 1.2 `GetProjectsDto`
Representa um projeto do usuário:
```typescript
interface GetProjectsDto {
  id: string;
  name: string;
  description?: string;
  color?: string;
  project_group_id?: string | null;
  is_archived?: boolean;
}
```

---

## 2. Estrutura do Estado do Flyout

```typescript
interface CollapsedGroupFlyoutProps {
  group: GetProjectGroupDto;
  projects: GetProjectsDto[];
  activeProjectId: string;
  onNavigate: (path: string) => void;
  onAddProject: (groupId: string) => void;
  onEditGroup: (group: GetProjectGroupDto) => void;
  onDeleteGroup: (group: GetProjectGroupDto) => void;
}

interface CollapsedRootProjectFlyoutProps {
  project: GetProjectsDto;
  isActive: boolean;
  onNavigate: (path: string) => void;
  onEditProject: (project: GetProjectsDto) => void;
  onArchiveProject: (project: GetProjectsDto) => void;
  onDeleteProject: (project: GetProjectsDto) => void;
}
```
