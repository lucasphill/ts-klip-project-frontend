# Implementation Plan: Menu Flutuante (Flyout) e Ergonomia da Barra Lateral Recolhida

**Branch**: `012-sidebar-collapsed-flyout` | **Date**: 2026-08-25 | **Spec**: [specs/012-sidebar-collapsed-flyout/spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/012-sidebar-collapsed-flyout/spec.md)

**Input**: Feature specification from `specs/012-sidebar-collapsed-flyout/spec.md`

## Summary

Implementar balões flutuantes laterais (Flyout Menus no hover/clique) utilizando as primitivas do `HoverCard` (Radix UI / shadcn/ui) para pastas/grupos de projetos e projetos raiz quando a barra lateral estiver recolhida. Padronizar a ocupação vertical e dimensões dos alvos de clique em `40x40px` (`h-10 w-10`), permitindo navegação rápida, visualização completa dos projetos e gerenciamento com ações rápidas sem precisar re-expandir a barra lateral.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19

**Primary Dependencies**: TailwindCSS, Radix UI (`HoverCard` via `@/components/ui/hover-card`), Lucide React, React Router DOM

**Storage**: N/A (Apresentação de UI / Estado local de interface)

**Testing**: Validação via Chrome DevTools MCP, `npm run lint`, `npm run build`

**Target Platform**: Navegador Web (Desktop e Mobile)

**Project Type**: Frontend Single-Page Application (SPA)

**Performance Goals**: Abertura de Flyout sem lag (<16ms frame rate) e tolerância suave de movimento do cursor (150ms open / 120ms close delay)

**Constraints**: Zero dependências de pacotes externos adicionais (sem Ant Design), suporte aos temas claro/escuro

**Scale/Scope**: Componente `Sidebar.tsx` e sub-componentes auxiliares de Flyout

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Type-Safe, Maintainable Frontend**: Tipagem TypeScript estrita para todas as props e estados dos balões contextuais.
- [x] **II. Accessible and Consistent User Experience**: Alvos de clique de 40x40px (acima dos 36x36px mínimos), suporte a foco por teclado, detecção de colisão de tela e compatibilidade com temas claro/escuro.
- [x] **III. Reliable Authentication, Data Boundaries and Privacy**: Zero impacto em autenticação ou contratos de backend.
- [x] **IV. Verified Behavior Before Merge**: Linter (`npm run lint`), build (`npm run build`) e validação via Chrome DevTools MCP.
- [x] **V. Simple, Performant State and UI**: Uso direto de Radix `HoverCard` já presente no projeto, sem redundância ou bibliotecas pesadas adicionais.

## Project Structure

### Documentation (this feature)

```text
specs/012-sidebar-collapsed-flyout/
├── plan.md              # Este plano de implementação
├── research.md          # Decisões de arquitetura e UI
├── data-model.md        # Modelos de entidades e estruturas de dados
├── quickstart.md        # Guia de validação passo a passo
├── contracts/           # Contratos de UI e layout
│   └── collapsed-flyout.contract.md
└── tasks.md             # Tarefas de implementação (gerado por speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Sidebar.tsx                # Implementação dos Flyouts no modo recolhido e padronização vertical
│   ├── NavItem.tsx                # Estilização compacta dos links principais
│   └── ui/
│       └── hover-card.tsx         # Primitiva Radix UI HoverCard reutilizada
└── types/
    └── apiTypes.ts                # DTOs de projetos e grupos
```

**Structure Decision**: A lógica e o JSX da barra lateral recolhida serão enriquecidos em `src/components/Sidebar.tsx` integrando `HoverCard`, `HoverCardTrigger` e `HoverCardContent`.

## Complexity Tracking

*Nenhuma violação aos princípios da Constituição.*
