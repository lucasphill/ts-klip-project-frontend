# Phase 1: Data Model & State

**Feature**: Botão de Criação de Projetos e Pastas na Barra Lateral Colapsada
**Branch**: `014-collapsed-sidebar-add-project`
**Date**: 2026-08-29

## Entities & Local Component State

A funcionalidade reutiliza integralmente o modelo de dados e os contextos existentes sem modificação nos esquemas de API.

### 1. Existing Entities Referenced
- **`GetProjectsDto`**: Projeto existente retornado pelo backend.
- **`CreateProjectDto`**: Payload para criação de projeto via `AddProjectModal`.
- **`GetProjectGroupDto`**: Pasta/grupo retornado pelo backend.
- **`CreateProjectGroupDto`**: Payload para criação de pasta via `AddProjectGroupModal`.

### 2. Component State in `Sidebar.tsx`
- **`showNewProjectModal`** (`boolean`): Controla a visibilidade do modal de novo projeto.
- **`showNewGroupModal`** (`boolean`): Controla a visibilidade do modal de nova pasta.
- **`targetGroupIdForNewProject`** (`string | null`): `null` quando o projeto for criado na raiz a partir do botão colapsado.
- **`isExpanded`** (`boolean`): Estado derivado que determina se a barra está no modo completo ou colapsado.
