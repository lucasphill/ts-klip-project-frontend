# Implementation Plan: Organização, Agrupamento e Ciclo de Vida de Projetos

**Branch**: `007-project-organization-lifecycle` | **Date**: 2026-08-23 | **Spec**: [specs/007-project-organization-lifecycle/spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/007-project-organization-lifecycle/spec.md)

**Input**: Feature specification from `specs/007-project-organization-lifecycle/spec.md`

## Summary

Implementar no frontend do Klip o suporte completo a grupos e pastas de projetos (`ProjectGroups`), ciclos de vida com arquivamento e desarquivamento reversível e exclusão com diálogo de confirmação da política de tarefas (`deleteTasks=true/false`). A barra lateral (`Sidebar.tsx`) passará a agrupar visualmente projetos em seções expansíveis e colapsáveis, o modal de criação/edição de projetos (`AddProjectModal.tsx`) permitirá selecionar a pasta de destino, e novos modais gerenciarão grupos (`AddProjectGroupModal.tsx`), projetos arquivados (`ArchivedProjectsModal.tsx`) e exclusão segura (`DeleteProjectModal.tsx`).

## Technical Context

**Language/Version**: TypeScript 5.x / React 19

**Primary Dependencies**: React Router v7, `@auth0/auth0-react`, TailwindCSS 4, shadcn/ui (`Dialog`, `Button`, `Input`, `Label`, `Textarea`, `HoverCard`, `Select`), `lucide-react`, `sonner`, `axios`.

**Storage**: Local state in React Context (`ProjectsContext`) com cache local e persistência de preferências de colapso de pastas no `localStorage`.

**Testing**: Validação com linter (`npm run lint`), compilação TypeScript (`npm run build`) e execução manual/automatizada de testes de fluxo via navegador.

**Target Platform**: Navegadores Web modernos (desktop e mobile responsivo).

**Project Type**: Aplicação Single-Page (SPA frontend).

**Performance Goals**: Renderização instantânea de grupos e projetos (< 50ms); transições suaves ao expandir/colapsar pastas; mutações com feedback visual imediato (< 200ms).

**Constraints**: Prevenir perda acidental de tarefas na exclusão; manter projetos intactos ao excluir pastas; garantir isolamento e sincronização do estado de tarefas arquivadas na Home.

**Scale/Scope**: 3 novos modais (`AddProjectGroupModal.tsx`, `DeleteProjectModal.tsx`, `ArchivedProjectsModal.tsx`), atualizações no `ProjectsContext.tsx`, `Sidebar.tsx`, `AddProjectModal.tsx`, `api.ts` e `apiTypes.ts`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Type-Safe, Maintainable Frontend)**: PASS — Tipagem estrita de DTOs (`CreateProjectGroupDto`, `GetProjectGroupDto`, `ReorderProjectGroupsDto`, etc.) em `apiTypes.ts` e interfaces explícitas no `ProjectsContext`.
- **Principle II (Accessible and Consistent User Experience)**: PASS — Todos os novos diálogos utilizam componentes Radix/shadcn com suporte completo a foco, navegação por teclado e temas claro/escuro.
- **Principle III (Reliable Authentication, Data Boundaries and Privacy)**: PASS — Requisições utilizam cliente Axios autenticado com Bearer Token centralizado em `api.ts`.
- **Principle IV (Verified Behavior Before Merge)**: PASS — Verificado rigorosamente via `npm run lint`, `npm run build` e validação com guia de testes.
- **Principle V (Simple, Performant State and UI)**: PASS — Gerenciamento unificado dentro do `ProjectsContext`, evitando acoplamento desnecessário e renderizações redundantes.

## Project Structure

### Documentation (this feature)

```text
specs/007-project-organization-lifecycle/
├── plan.md              # Este plano de implementação
├── research.md          # Pesquisa técnica e decisões de arquitetura
├── data-model.md        # Entidades, DTOs e diagrama de estados
├── quickstart.md        # Guia de validação ponta a ponta
├── contracts/           # Contratos de API
│   ├── project-groups-api.md
│   └── project-lifecycle-api.md
└── checklists/          # Checklists de qualidade
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── AddProjectGroupModal.tsx   # Modal de criação e edição de grupos/pastas de projetos
│   ├── AddProjectModal.tsx        # Atualizado com seletor de grupo/pasta (groupId)
│   ├── ArchivedProjectsModal.tsx  # Modal de visualização e desarquivamento de projetos
│   ├── DeleteProjectModal.tsx     # Modal de exclusão de projeto com escolha da política de tarefas
│   └── Sidebar.tsx                # Atualizado com renderização de grupos colapsáveis e ações de ciclo de vida
├── contexts/
│   └── ProjectsContext.tsx        # Expandido com estado e métodos de ProjectGroups e arquivamento
├── pages/
│   └── HomePage.tsx               # Atualizado para filtrar tarefas de projetos arquivados
├── services/
│   └── api.ts                     # Inclusão de projectGroupsApi e novos métodos de ciclo de vida em projectsApi
└── types/
    └── apiTypes.ts                # DTOs de grupos, arquivamento e parâmetros de exclusão
```

**Structure Decision**: Arquitetura padrão do repositório, estendendo o `ProjectsContext` e reutilizando a biblioteca de componentes UI existente.

## Complexity Tracking

*Nenhuma violação encontrada. O design adere rigorosamente aos princípios da constituição do projeto.*
