# Implementation Plan: Sincronização Automática de Tarefas de Projetos no Inbox

**Branch**: `008-inbox-task-sync` | **Date**: 2026-08-23 | **Spec**: [specs/008-inbox-task-sync/spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/008-inbox-task-sync/spec.md)

**Input**: Feature specification from `specs/008-inbox-task-sync/spec.md`

## Summary

Corrigir a sincronização de tarefas criadas ou modificadas em projetos ou externamente (via MCP/API) para que apareçam imediatamente no Inbox (`HomePage.tsx`). A solução inclui:
1. Invalidação e recarga forçada (`fetchTasks({ force: true })`) e recarga de vínculos projeto-tarefa na montagem e no foco de janela na `HomePage`.
2. Notificação e atualização do estado global do `TasksContext` (`appendTask` / `updateTaskLocal`) dentro de `ProjectsPage.tsx` ao salvar tarefas.
3. Sincronização de projetos e tarefas sem bloqueio de cache estático.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19

**Primary Dependencies**: React Router v7, `@auth0/auth0-react`, TailwindCSS 4, `lucide-react`, `sonner`, `axios`.

**Storage**: React Context State (`TasksContext`, `ProjectsContext`) em memória.

**Testing**: Validação com linter (`npm run lint`), compilação TypeScript (`npm run build`) e validação via Chrome MCP.

**Target Platform**: Navegadores Web modernos (Desktop e Mobile).

**Project Type**: Aplicação Single-Page (SPA frontend).

**Performance Goals**: Tempo de sincronização e exibição < 200ms; sem renderizações em branco; sem requisições em loop.

**Constraints**: Preservar o isolamento de projetos arquivados; não duplicar tarefas em sincronizações concorrentes.

**Scale/Scope**: Ajustes em `src/contexts/TasksContext.tsx`, `src/pages/HomePage.tsx` e `src/pages/ProjectsPage.tsx`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Type-Safe, Maintainable Frontend)**: PASS — Tipagem estrita de tarefas, DTOs e assinaturas de callbacks.
- **Principle II (Accessible and Consistent User Experience)**: PASS — Atualizações transparentes sem piscar a tela ou perder o foco do usuário.
- **Principle III (Reliable Authentication, Data Boundaries and Privacy)**: PASS — Mantém autenticação Bearer JWT e isolamento de usuário.
- **Principle IV (Verified Behavior Before Merge)**: PASS — Validação com `npm run lint`, `npm run build` e teste via MCP DevTools.
- **Principle V (Simple, Performant State and UI)**: PASS — Reutiliza os contextos existentes sem introduzir bibliotecas pesadas de cache ou polling contínuo.

## Project Structure

### Documentation (this feature)

```text
specs/008-inbox-task-sync/
├── plan.md              # Este plano de implementação
├── research.md          # Diagnóstico e decisões técnicas
├── data-model.md        # Fluxo de sincronização e DTOs
├── quickstart.md        # Cenários de validação
├── contracts/
│   └── inbox-sync-contract.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── contexts/
│   └── TasksContext.tsx    # Aprimoramento da estratégia de invalidação de cache do fetchTasks
├── pages/
│   ├── HomePage.tsx        # Forçar busca fresca de tarefas e vínculos na montagem e foco
│   └── ProjectsPage.tsx    # Sincronizar TasksContext no handleSaveTask de projetos
```

**Structure Decision**: Ajustes cirúrgicos no fluxo de dados dos contextos e páginas existentes.

## Complexity Tracking

*Nenhuma violação encontrada. O design adere integralmente à constituição do projeto.*
