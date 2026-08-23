# Tasks: Sincronização Automática de Tarefas de Projetos no Inbox

**Feature**: `008-inbox-task-sync` | **Branch**: `008-inbox-task-sync`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificação de tipos e infraestrutura de sincronização

- [X] T001 [P] Verificar tipagens e garantir compatibilidade de DTOs de tarefas e vínculos de projetos em `src/types/apiTypes.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura de gerenciamento de cache e reatividade global de tarefas

**⚠️ CRITICAL**: Concluir antes de implementar as User Stories

- [X] T002 Aprimorar o mecanismo de busca e invalidação de cache em `src/contexts/TasksContext.tsx` para permitir que `fetchTasks({ force: true })` sempre revalide dados frescos da API em segundo plano

**Checkpoint**: `TasksContext` preparado para fornecer dados atualizados sob demanda.

---

## Phase 3: User Story 1 - Sincronização Imediata e Reativa de Tarefas no Inbox (Priority: P1) 🎯 MVP

**Goal**: Garantir que tarefas criadas dentro de projetos (pela UI ou por agentes MCP) apareçam imediatamente no Inbox ("Todas as tarefas") sem recarga manual (`F5`).

**Independent Test**: Criar uma tarefa na tela de um projeto (ou via MCP) e navegar para a Home/Inbox, verificando que a nova tarefa é listada imediatamente.

### Implementation for User Story 1

- [X] T003 [US1] Atualizar `src/pages/HomePage.tsx` para forçar busca fresca de tarefas (`fetchTasks({ force: true })`) e projetos na montagem do componente
- [X] T004 [US1] Adicionar listener de foco de janela (`window.onfocus`) e visibilidade (`visibilitychange`) com debounce em `src/pages/HomePage.tsx` para revalidar tarefas criadas externamente via MCP
- [X] T005 [US1] Atualizar `handleSaveTask` em `src/pages/ProjectsPage.tsx` para notificar `TasksContext` (`appendTask` / `updateTaskLocal` / `fetchTasks`) ao criar ou editar tarefas no projeto

**Checkpoint**: User Story 1 funcional e testável de forma independente (MVP completo de sincronização).

---

## Phase 4: User Story 2 - Consistência de Vínculos de Projetos nas Tarefas do Inbox (Priority: P2)

**Goal**: Garantir que as badges e tags de projeto de cada tarefa no Inbox exibam com precisão as atribuições de projetos mais recentes.

**Independent Test**: Vincular uma tarefa a um projeto recém-criado e verificar no Inbox se a badge colorida do projeto é renderizada instantaneamente.

### Implementation for User Story 2

- [X] T006 [US2] Atualizar `loadProjectTaskAssignments` em `src/pages/HomePage.tsx` para executar paralelamente à sincronização de tarefas e projetos, mantendo a tabela de vínculos atualizada
- [X] T007 [US2] Atualizar o gerenciamento otimista de vínculos em `src/pages/HomePage.tsx` e `src/pages/ProjectsPage.tsx` para evitar discrepâncias temporárias ao associar tarefas a projetos

**Checkpoint**: User Stories 1 e 2 funcionais e integradas.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validação end-to-end, conformidade de padrões e testes via DevTools

- [X] T008 Validar cenários de teste ponta a ponta descritos em `specs/008-inbox-task-sync/quickstart.md` utilizando o Chrome DevTools MCP
- [X] T009 Executar validações de qualidade obrigatórias (`npm run lint` e `npm run build`), corrigindo quaisquer avisos ou erros

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — execução imediata.
- **Foundational (Phase 2)**: Depende da Phase 1 — BLOQUEIA a implementação das User Stories.
- **User Stories (Phase 3+)**: Dependem da conclusão da Phase 2:
  - **US1 (P1)**: Independente.
  - **US2 (P2)**: Depende do fluxo de dados unificado de US1.
- **Polish (Phase 5)**: Executada após conclusão das User Stories.

### Parallel Opportunities

- `T001` pode rodar em paralelo com a análise de `T002`.
- `T004` e `T005` podem ser desenvolvidos em paralelo após `T003`.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Setup (`T001`) e Fundação de Estado (`T002`).
2. Implementar User Story 1 (`T003`, `T004`, `T005`).
3. **Validar MVP**: Criar tarefa no projeto, navegar para o Inbox e confirmar exibição instantânea.

### Incremental Delivery

1. Setup + Foundation → Base de reatividade pronta.
2. Adicionar US1 → Tarefas sincronizadas entre projetos e Inbox (MVP).
3. Adicionar US2 → Badges e vínculos de projeto 100% atualizados.
4. Polish → Validação de build e testes via DevTools.
