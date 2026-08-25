# Implementation Plan: Refatoração da Barra Lateral e Ajuste no Modal de Grupos de Projetos

**Branch**: `011-sidebar-projects-refactor` | **Date**: 2026-08-25 | **Spec**: [specs/011-sidebar-projects-refactor/spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/011-sidebar-projects-refactor/spec.md)

**Input**: Feature specification from `specs/011-sidebar-projects-refactor/spec.md`

## Summary

Refatorar a estrutura visual e de navegação da barra lateral (`Sidebar.tsx`) renomeando a seção para "PROJETOS", reposicionando os projetos raiz acima das pastas/grupos, eliminando o cabeçalho "Sem pasta", e padronizando o destaque de projeto ativo com preenchimento suave de bordas arredondadas e cor de texto padrão (idêntico a Inbox/Calendário, sem texto azul). Adicionalmente, corrigir o layout de grade/flexbox dos ícones predefinidos em `AddProjectGroupModal.tsx` para eliminar a sobreposição visual dos botões de seleção de ícone.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19

**Primary Dependencies**: Vite, React Router DOM, TailwindCSS, Lucide React, shadcn/ui (Dialog, HoverCard, Label, Input, Button)

**Storage**: N/A (Alterações de apresentação de UI)

**Testing**: Validação via Chrome DevTools MCP, `npm run lint`, `npm run build`

**Target Platform**: Navegador Web (Desktop e Mobile)

**Project Type**: Frontend Single-Page Application (SPA)

**Performance Goals**: Renderização instantânea sem recálculos ou repaints desnecessários (<16ms)

**Constraints**: Preservar o design system, suporte a temas claro/escuro, zero dependências externas adicionais

**Scale/Scope**: 2 componentes principais afetados (`Sidebar.tsx`, `AddProjectGroupModal.tsx`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Type-Safe, Maintainable Frontend**: Tipagem estrita preservada em todos os componentes e props.
- [x] **II. Accessible and Consistent User Experience**: Alvos de toque acessíveis (>=36px), navegação por teclado (`Tab`/`Enter`/`Space`), anéis de foco visíveis, consistência com o padrão `NavItem` (Inbox/Calendário) e suporte a temas claro/escuro.
- [x] **III. Reliable Authentication, Data Boundaries and Privacy**: Nenhuma alteração nas fronteiras de autenticação ou dados.
- [x] **IV. Verified Behavior Before Merge**: Linter (`npm run lint`), build (`npm run build`) e validação via Chrome DevTools MCP.
- [x] **V. Simple, Performant State and UI**: Modificações pontuais em JSX/Tailwind, sem estado redundante ou abstrações prematuras.

## Project Structure

### Documentation (this feature)

```text
specs/011-sidebar-projects-refactor/
├── plan.md              # Este plano de implementação
├── research.md          # Decisões de arquitetura e UI
├── data-model.md        # Modelos de entidades e estruturas de dados
├── quickstart.md        # Guia de validação passo a passo
├── contracts/           # Contratos de UI e layout
│   ├── sidebar-navigation.contract.md
│   └── project-group-modal.contract.md
└── tasks.md             # Tarefas de implementação (gerado por speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Sidebar.tsx                # Reorganização de seções, título "PROJETOS", projetos raiz acima de pastas, remoção de "Sem pasta", destaque ativo
│   ├── AddProjectGroupModal.tsx   # Correção da grade/flex dos ícones predefinidos sem sobreposição
│   └── NavItem.tsx                # Referência de estilo ativo/inativo
└── types/
    └── apiTypes.ts                # DTOs de projetos e grupos
```

**Structure Decision**: Apenas os componentes de apresentação `Sidebar.tsx` e `AddProjectGroupModal.tsx` necessitam de alterações de layout e classes Tailwind.

## Complexity Tracking

*Nenhuma violação aos princípios da Constituição.*
