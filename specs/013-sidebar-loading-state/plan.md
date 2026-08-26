# Implementation Plan: Estado de Carregamento Animado, Sincronização e Transição Suave da Barra Lateral

**Branch**: `013-sidebar-loading-state` | **Date**: 2026-08-25 | **Spec**: [specs/013-sidebar-loading-state/spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/013-sidebar-loading-state/spec.md)

**Input**: Feature specification from `specs/013-sidebar-loading-state/spec.md`

## Summary

Implementar indicador de carregamento animado com 3 pontos pulsantes (*animated dots loading*) em CSS/Tailwind na seção de projetos da barra lateral, eliminar a condição de corrida entre projetos e pastas por meio de regras de agrupamento atômico (garantindo que projetos em pastas nunca apareçam soltos na raiz) e aplicar transições visuais suaves (`transition-all duration-200`, `transition-opacity`, `whitespace-nowrap overflow-hidden`) para todos os textos e botões internos ao expandir ou recolher a barra lateral.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19

**Primary Dependencies**: TailwindCSS, Lucide React, Radix UI

**Storage**: N/A (Apresentação de UI / Estado local e Contexto React)

**Testing**: Validação via Chrome DevTools MCP, `npm run lint`, `npm run build`

**Target Platform**: Navegador Web (Desktop e Mobile)

**Project Type**: Frontend Single-Page Application (SPA)

**Performance Goals**: Animações a 60fps com CSS puro e zero pulos visuais de layout

**Constraints**: Zero novas dependências externas de pacotes

**Scale/Scope**: `ProjectsContext.tsx`, `Sidebar.tsx`, `NavItem.tsx`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Type-Safe, Maintainable Frontend**: Tipos explícitos para estados de loading e DTOs no `ProjectsContext`.
- [x] **II. Accessible and Consistent User Experience**: `aria-label="Carregando projetos"`, transições a 60fps sem quebra de texto e compatibilidade total de tema.
- [x] **III. Reliable Authentication, Data Boundaries and Privacy**: Zero modificações em backend ou contratos de rede.
- [x] **IV. Verified Behavior Before Merge**: Linter (`npm run lint`), build (`npm run build`) e validação via Chrome DevTools MCP.
- [x] **V. Simple, Performant State and UI**: Animações nativas de CSS e Tailwind sem bibliotecas extras.

## Project Structure

### Documentation (this feature)

```text
specs/013-sidebar-loading-state/
├── plan.md              # Este plano de implementação
├── research.md          # Decisões de arquitetura e UI
├── data-model.md        # Modelos de entidades e estados
├── quickstart.md        # Guia de validação passo a passo
├── contracts/           # Contratos de UI e layout
│   └── sidebar-loading-transition.contract.md
└── tasks.md             # Tarefas de implementação (gerado por speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── contexts/
│   └── ProjectsContext.tsx        # Inclusão de isLoadingProjects e isLoadingGroups
└── components/
    ├── Sidebar.tsx                # Implementação do AnimatedDotsLoading, agrupamento atômico e transições suaves
    └── NavItem.tsx                # Transição suave para rótulos e badges
```

## Complexity Tracking

*Nenhuma violação aos princípios da Constituição.*
