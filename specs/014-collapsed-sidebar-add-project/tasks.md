# Tasks: Botão de Criação de Projetos e Pastas na Barra Lateral Colapsada

**Input**: Design documents from `specs/014-collapsed-sidebar-add-project/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [contracts/sidebar-collapsed-add-project.contract.md](./contracts/sidebar-collapsed-add-project.contract.md), [quickstart.md](./quickstart.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files or independent slices)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in descriptions

---

## Phase 1: Setup & Foundational

**Purpose**: Verificação de componentes e importações necessárias em `src/components/Sidebar.tsx`

- [x] T001 Verificar e preparar importações de ícones (`Plus`, `FolderPlus`) e componente `HoverCard` em [src/components/Sidebar.tsx](file:///D:/Dev/ts-klip-project-frontend/src/components/Sidebar.tsx)

---

## Phase 2: User Story 1 - Criar Novo Projeto com a Barra Colapsada (Priority: P1) 🎯 MVP

**Goal**: Permitir a abertura do modal de criação de projeto através do botão compacto `+` na barra colapsada (tanto via clique direto quanto via opção "Novo projeto" no HoverCard).

**Independent Test**: Com a barra lateral colapsada, clicar no botão `+` ou passar o mouse e selecionar "Novo projeto" no HoverCard, verificando a abertura do modal `AddProjectModal`.

### Implementation for User Story 1

- [x] T002 [US1] Adicionar container e botão compacto `+` com acionamento do `AddProjectModal` posicionado no topo da seção de projetos quando `!isExpanded` em [src/components/Sidebar.tsx](file:///D:/Dev/ts-klip-project-frontend/src/components/Sidebar.tsx)
- [x] T003 [US1] Configurar `HoverCard` no botão compacto renderizando a opção interativa "Novo projeto" com ícone `Plus` em [src/components/Sidebar.tsx](file:///D:/Dev/ts-klip-project-frontend/src/components/Sidebar.tsx)

**Checkpoint**: User Story 1 funcional de forma autônoma (abertura rápida de novo projeto no modo colapsado).

---

## Phase 3: User Story 2 - Criar Nova Pasta/Grupo com a Barra Colapsada (Priority: P2)

**Goal**: Permitir a criação de nova pasta/grupo a partir da opção "Nova pasta" no HoverCard da barra colapsada.

**Independent Test**: Com a barra lateral colapsada, passar o cursor sobre o botão `+`, clicar em "Nova pasta" no HoverCard e verificar a abertura do modal `AddProjectGroupModal`.

### Implementation for User Story 2

- [x] T004 [US2] Adicionar o botão de ação "Nova pasta" (com ícone `FolderPlus` e acionamento de `setShowNewGroupModal(true)`) no conteúdo do `HoverCard` em [src/components/Sidebar.tsx](file:///D:/Dev/ts-klip-project-frontend/src/components/Sidebar.tsx)

**Checkpoint**: Usuário pode criar tanto projetos quanto pastas a partir do menu compacto sem expandir a barra.

---

## Phase 4: User Story 3 - Navegação e Acessibilidade no Modo Compacto (Priority: P3)

**Goal**: Assegurar suporte completo a foco de teclado, `aria-label`, contraste em temas claro/escuro e transição fluida ao alternar entre barra colapsada e expandida.

**Independent Test**: Navegar com a tecla `Tab` até o botão compacto, acionar via teclado, e verificar transição suave ao expandir e recolher a barra lateral.

### Implementation for User Story 3

- [x] T005 [US3] Incluir `aria-label="Adicionar projeto ou pasta"`, foco acessível e transição de visibilidade sincronizada com o estado `isExpanded` em [src/components/Sidebar.tsx](file:///D:/Dev/ts-klip-project-frontend/src/components/Sidebar.tsx)

---

## Phase 5: Polish & Quality Assurance

**Purpose**: Verificação de qualidade, linter, build e validação visual conforme os padrões do projeto.

- [x] T006 Executar validação de linter (`npm run lint`) e corrigir quaisquer erros ou avisos
- [x] T007 Executar validação de compilação/build (`npm run build`)
- [x] T008 Validar cenários descritos em [quickstart.md](file:///D:/Dev/ts-klip-project-frontend/specs/014-collapsed-sidebar-add-project/quickstart.md) nos modos desktop e mobile

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Foundational (Phase 1)**: Sem dependências prévias.
- **User Story 1 (Phase 2)**: Depende da Phase 1. (MVP).
- **User Story 2 (Phase 3)**: Depende da Phase 2 (estende o conteúdo do HoverCard criado na US1).
- **User Story 3 (Phase 4)**: Depende das fases de implementação (US1/US2).
- **Polish (Phase 5)**: Depende da conclusão de todas as histórias de usuário.

---

## Implementation Strategy

1. **MVP (Fase 1 e Fase 2)**: Implementação do botão `+` compacto no topo da lista com clique direto e HoverCard para "Novo projeto".
2. **Incremento (Fase 3)**: Adição da opção "Nova pasta" no HoverCard.
3. **Refinamento Acessível (Fase 4)**: Revisão de foco, rótulos ARIA e transição de expansão.
4. **Validação Final (Fase 5)**: `npm run lint` e `npm run build` mandatórios.
