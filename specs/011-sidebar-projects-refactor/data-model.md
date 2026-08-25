# Data Model: Refatoração da Barra Lateral e Modal de Grupos de Projetos

**Feature**: Refatoração da Barra Lateral e Ajuste no Modal de Grupos de Projetos
**Branch**: `011-sidebar-projects-refactor`
**Date**: 2026-08-25

---

## 1. Entidades Existentes Utilizadas (Frontend Domain)

A presente funcionalidade não altera esquemas de banco de dados nem introduz novos campos no backend. Ela utiliza os modelos de domínio existentes tipados em `src/types/apiTypes.ts`:

### 1.1 `GetProjectsDto`
Representa um projeto do usuário no Klip:

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Identificador único do projeto (UUID) |
| `name` | `string` | Nome exibido do projeto |
| `description` | `string?` | Descrição opcional do projeto |
| `color` | `string?` | Cor associada ao projeto (hex ou classe) |
| `project_group_id` | `string?` | ID da pasta/grupo ao qual o projeto pertence (`null`/`undefined` para projetos raiz) |
| `is_archived` | `boolean?` | Flag indicando se o projeto está arquivado |

### 1.2 `GetProjectGroupDto`
Representa uma pasta/grupo de organização de projetos:

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | Identificador único do grupo (UUID) |
| `name` | `string` | Nome da pasta |
| `color` | `string` | Cor associada ao grupo |
| `icon` | `string?` | Identificador do ícone (ex: `"folder"`, `"briefcase"`, `"star"`, etc.) |
| `order` | `number?` | Ordem de exibição |

---

## 2. Estrutura de Ícones Predefinidos (`PRESET_ICONS`)

Modelo local de opções de ícones em `src/components/AddProjectGroupModal.tsx`:

```typescript
interface PresetIconOption {
  id: string; // "folder" | "briefcase" | "users" | "star" | "sparkles" | "heart" | "tag" | "bookmark" | "code" | "layout" | "box"
  label: string; // Nome legível para acessibilidade e tooltip
  icon: LucideIcon; // Componente de ícone Lucide
}
```

---

## 3. Estados de Exibição na Barra Lateral

```typescript
type ProjectDisplaySection = {
  rootProjects: GetProjectsDto[]; // Projetos com project_group_id == null / undefined
  projectGroups: {
    group: GetProjectGroupDto;
    projects: GetProjectsDto[]; // Projetos com project_group_id == group.id
    isCollapsed: boolean;
  }[];
};
```
