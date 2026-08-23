# Tasks: Organização, Agrupamento e Ciclo de Vida de Projetos

**Feature**: `007-project-organization-lifecycle` | **Branch**: `007-project-organization-lifecycle`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição de modelos de dados, DTOs e serviços de integração da API

- [X] T001 [P] Definir DTOs e tipos TypeScript para Grupos de Projetos (`CreateProjectGroupDto`, `GetProjectGroupDto`, `ReorderProjectGroupsDto`) e atualizar `GetProjectsDto` / `CreateProjectDto` em `src/types/apiTypes.ts`
- [X] T002 [P] Implementar o serviço `projectGroupsApi` e estender `projectsApi` com métodos de arquivamento (`archive`, `unarchive`) e exclusão com `deleteTasks` em `src/services/api.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Gerenciamento de estado global e sincronização de dados de grupos e projetos

**⚠️ CRITICAL**: Concluir antes de implementar as interfaces de usuário das User Stories

- [X] T003 Expandir `src/contexts/ProjectsContext.tsx` com estado reativo de grupos (`projectGroups`), projetos arquivados (`archivedProjects`) e operações completas de CRUD, reordenação, arquivamento e exclusão

**Checkpoint**: Camada de estado e serviços pronta — implementação das User Stories pode iniciar

---

## Phase 3: User Story 1 - Organização de Projetos em Grupos / Pastas (Priority: P1) 🎯 MVP

**Goal**: Permitir ao usuário criar, editar e excluir grupos/pastas com cores e ícones, associar projetos a grupos na criação/edição e navegar na barra lateral hierárquica colapsável.

**Independent Test**: Criar um grupo na barra lateral, criar um projeto associado a esse grupo, editar o grupo, colapsar/expandir o grupo e excluir o grupo verificando que os projetos são mantidos na raiz com segurança.

### Implementation for User Story 1

- [X] T004 [P] [US1] Criar o componente modal `src/components/AddProjectGroupModal.tsx` para criação e edição de grupos/pastas com validação de nome, seleção de cor e ícone
- [X] T005 [P] [US1] Atualizar `src/components/AddProjectModal.tsx` para incluir o seletor de grupo de destino (`groupId`), permitindo alocar o projeto em uma pasta existente ou na raiz
- [X] T006 [US1] Atualizar `src/components/Sidebar.tsx` para renderizar grupos colapsáveis, contadores de projetos por pasta, menu de ações do grupo (novo projeto no grupo, editar, excluir) e busca unificada

**Checkpoint**: User Story 1 funcional e testável de forma independente (MVP completo de organização de projetos).

---

## Phase 4: User Story 2 - Arquivamento e Desarquivamento Reversível de Projetos (Priority: P2)

**Goal**: Permitir ao usuário arquivar projetos ativos, removendo-os da navegação ativa e ocultando suas tarefas da Home ("Inbox / Todas as Tarefas"), com visualização e recuperação instantânea na seção de projetos arquivados.

**Independent Test**: Arquivar um projeto ativo com tarefas, verificar que ele desaparece da navegação ativa e suas tarefas somem da Home; abrir o modal de projetos arquivados, desarquivar o projeto e verificar seu retorno imediato à navegação e à Home.

### Implementation for User Story 2

- [X] T007 [P] [US2] Criar o componente modal `src/components/ArchivedProjectsModal.tsx` para listar projetos arquivados com data de arquivamento e ações de desarquivar ou excluir
- [X] T008 [US2] Adicionar ação de "Arquivar projeto" nos menus de projeto e integrar o botão de acesso aos projetos arquivados na navegação de `src/components/Sidebar.tsx`
- [X] T009 [US2] Atualizar `src/pages/HomePage.tsx` e `src/pages/ProjectsPage.tsx` para garantir que tarefas de projetos arquivados sejam ocultadas das visualizações ativas da Home

**Checkpoint**: User Stories 1 e 2 funcionais e integradas de forma independente.

---

## Phase 5: User Story 3 - Exclusão Segura de Projetos com Escolha de Política de Tarefas (Priority: P3)

**Goal**: Prover diálogo seguro de confirmação de exclusão de projetos com escolha explícita entre desvincular tarefas (`deleteTasks=false`, padrão) ou excluir tarefas em cascata (`deleteTasks=true`).

**Independent Test**: Excluir um projeto escolhendo "Preservar tarefas" e verificar que as tarefas continuam na Home como tarefas avulsas; e excluir outro projeto escolhendo "Excluir tarefas em cascata" verificando remoção definitiva.

### Implementation for User Story 3

- [X] T010 [P] [US3] Criar o componente modal `src/components/DeleteProjectModal.tsx` com seleção visual entre desvincular tarefas (padrão) e exclusão em cascata
- [X] T011 [US3] Integrar `DeleteProjectModal.tsx` na barra lateral (`src/components/Sidebar.tsx`), no cabeçalho de `src/pages/ProjectsPage.tsx` e na listagem de `src/components/ArchivedProjectsModal.tsx`

**Checkpoint**: Todas as 3 User Stories funcionais com segurança e prevenção de perda de dados.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de consistência visual, testes end-to-end e validação de padrões

- [X] T012 [P] Validar acessibilidade por teclado (focus trap, Esc para fechar) e renderização nos temas claro e escuro em todos os novos modais
- [X] T013 Executar cenários de validação descritos em `specs/007-project-organization-lifecycle/quickstart.md` contra a API backend local
- [X] T014 Executar validações de qualidade obrigatórias (`npm run lint` e `npm run build`), corrigindo quaisquer avisos ou erros

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — execução imediata.
- **Foundational (Phase 2)**: Depende da Phase 1 — BLOQUEIA a implementação das User Stories.
- **User Stories (Phase 3+)**: Dependem da conclusão da Phase 2:
  - **US1 (P1)**: Independente.
  - **US2 (P2)**: Depende do `ProjectsContext` expandido.
  - **US3 (P3)**: Depende do `ProjectsContext` e dos modais de projeto.
- **Polish (Phase 6)**: Executada após conclusão das User Stories.

### Parallel Opportunities

- `T001` e `T002` podem ser executados em paralelo.
- `T004` (`AddProjectGroupModal.tsx`) e `T005` (`AddProjectModal.tsx`) podem ser desenvolvidos em paralelo antes da integração com `Sidebar.tsx` (`T006`).
- `T007` (`ArchivedProjectsModal.tsx`) e `T010` (`DeleteProjectModal.tsx`) são modais independentes que podem ser criados em paralelo.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Setup (`T001`, `T002`) e Fundação de Estado (`T003`).
2. Implementar User Story 1 (`T004`, `T005`, `T006`).
3. **Validar MVP**: Criar grupos, mover projetos para grupos, colapsar/expandir e excluir grupos com projetos movidos para a raiz.

### Incremental Delivery

1. Setup + Foundation → Base de tipos e estado pronta.
2. Adicionar US1 → Agrupamento e navegação de projetos operacionais (MVP).
3. Adicionar US2 → Arquivamento reversível e despoluição da Home.
4. Adicionar US3 → Exclusão segura com diálogo de escolha sobre tarefas.
5. Polish → Verificação de temas, acessibilidade e build limpo.
