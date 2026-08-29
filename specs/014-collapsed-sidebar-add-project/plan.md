# Implementation Plan: Botão de Criação de Projetos e Pastas na Barra Lateral Colapsada

**Branch**: `014-collapsed-sidebar-add-project` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/014-collapsed-sidebar-add-project/spec.md`

## Summary

Adicionar um botão de adição (`+`) neutro e acessível na barra lateral colapsada, posicionado entre a navegação primária (Calendário) e a listagem de projetos/pastas. O botão conta com ação direta de criação de projeto ao clicar e um balão flutuante (`HoverCard`) com ações para "Novo projeto" e "Nova pasta", preservando o layout da barra quando expandida.

## Technical Context

**Language/Version**: TypeScript 5.8 / React 19
**Primary Dependencies**: `@radix-ui/react-hover-card`, `lucide-react`, `tailwindcss`
**Storage**: N/A (usa estado local e Contextos existentes)
**Testing**: Linter (`npm run lint`), TypeScript compile check & build (`npm run build`), validação visual via DevTools/browser.
**Target Platform**: Web (Desktop e Mobile)
**Project Type**: Single Page Application (Vite + React)
**Performance Goals**: Abertura instantânea do HoverCard (<150ms delay padrão) e acionamento de modal sem re-renderizações desnecessárias da árvore.
**Constraints**: Sem novas dependências de terceiros; aderência estrita aos temas claro e escuro.
**Scale/Scope**: 1 componente central (`src/components/Sidebar.tsx`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I (Type-Safe, Maintainable)**: Uso estrito de TypeScript sem tipos `any` nos novos handlers.
- [x] **Principle II (Accessible & Consistent UX)**: `aria-label`, foco acessível, temas claro e escuro suportados via variáveis CSS.
- [x] **Principle III (Reliable Auth & Data)**: Não altera lógica de autenticação nem expõe dados sensíveis.
- [x] **Principle IV (Verified Behavior)**: Verificação obrigatória com `npm run lint`, `npm run build` e teste visual.
- [x] **Principle V (Simple, Performant State/UI)**: Sem abstrações prematuras ou dependências adicionais; reutilização do componente `HoverCard` já existente.

## Project Structure

### Documentation (this feature)

```text
specs/014-collapsed-sidebar-add-project/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── sidebar-collapsed-add-project.contract.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code Layout

```text
src/
├── components/
│   ├── Sidebar.tsx                # Target file for collapsed add button & HoverCard
│   ├── AddProjectModal.tsx        # Reused modal for project creation
│   ├── AddProjectGroupModal.tsx   # Reused modal for folder/group creation
│   └── ui/
│       └── hover-card.tsx         # Reused Radix HoverCard UI component
```

## Complexity Tracking

*No violations to justify. Implementation uses minimal code changes and standard patterns.*
