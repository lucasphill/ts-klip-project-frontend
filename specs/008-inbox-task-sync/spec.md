# Feature Specification: Sincronização Automática de Tarefas de Projetos no Inbox

**Feature Branch**: `008-inbox-task-sync`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "quero verificar um bug que ocorre ao criar uma tarefa dentro de um projeto. digamos que via mcp voce criou um projeto e adicionou uma tarefa dentro desse projeto. essa tarefa nova desse projeto nao sera adicionada automaticamente a lista do inbox. verifique e crie a specify para correção"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sincronização Imediata e Reativa de Tarefas no Inbox (Priority: P1) 🎯 MVP

Como usuário do Klip, quero que qualquer tarefa criada dentro de um projeto (seja via interface na página do projeto, pelo modal de nova tarefa ou externamente por integrações e servidores MCP) apareça de forma imediata e consistente na lista geral do Inbox ("Todas as tarefas"), para que eu tenha visibilidade completa de todas as minhas entregas sem precisar forçar recarga manual do navegador.

**Why this priority**: É a expectativa fundamental de um gerenciador de tarefas unificado: o Inbox deve refletir com exatidão a totalidade das tarefas ativas da conta em tempo real ou ao navegar para a visualização principal.

**Independent Test**: Pode ser testado criando uma tarefa dentro de uma página de projeto (ou via MCP / API externa) e em seguida navegando até o Inbox ("Todas as Tarefas"), confirmando que a nova tarefa é listada imediatamente com sua associação ao projeto correspondente.

**Acceptance Scenarios**:

1. **Given** que o usuário está na página de visualização de um projeto específico, **When** ele cria uma nova tarefa vinculada a esse projeto, **Then** a tarefa é criada no projeto e sincronizada no estado global de tarefas da aplicação, passando a constar imediatamente no Inbox.
2. **Given** que uma tarefa é criada e associada a um projeto externamente (por ferramentas MCP ou outra sessão), **When** o usuário acessa ou retorna à tela do Inbox ("Todas as Tarefas"), **Then** o sistema atualiza as tarefas e exibe a nova tarefa com sua respectiva tag de projeto.
3. **Given** que o usuário está na tela do Inbox, **When** a janela do navegador recupera o foco após ações externas ou navegação entre abas, **Then** o sistema garante a sincronização e atualização da lista sem manter cache defasado.

---

### User Story 2 - Consistência de Vínculos de Projetos nas Tarefas do Inbox (Priority: P2)

Como usuário visualizando o Inbox, quero que as tags e seletores de projeto de cada tarefa reflitam instantaneamente qualquer vinculação ou desvinculação feita nas páginas de projetos ou modais, para que eu identifique facilmente a qual projeto cada tarefa pertence.

**Why this priority**: Evita que tarefas apareçam como "avulsas" ou sem projeto no Inbox quando na verdade pertencem a um projeto recém-criado.

**Independent Test**: Pode ser testado vinculando uma tarefa existente ou nova a um projeto e verificando se a coluna/badge de projeto no Inbox exibe a cor e nome corretos do projeto imediatamente.

**Acceptance Scenarios**:

1. **Given** uma tarefa recém-associada a um projeto, **When** o usuário abre o Inbox, **Then** a coluna de projetos da tabela exibe a badge com a cor e nome do projeto correspondente.
2. **Given** que um projeto ativo teve tarefas adicionadas, **When** o usuário edita a tarefa pelo Inbox, **Then** o modal de edição carrega as informações do projeto associado pré-selecionadas corretamente.

---

### Edge Cases

- O que acontece se a tarefa for criada em um projeto que está arquivado? Conforme a política de ciclo de vida de projetos, tarefas de projetos arquivados não devem ser exibidas no Inbox ativo por padrão.
- O que acontece se o usuário estiver offline no momento da navegação? O sistema mantém os dados locais disponíveis e exibe mensagem de alerta caso a atualização de rede falhe, sem apagar tarefas previamente carregadas.
- O que acontece quando múltiplas tarefas são criadas em lote externamente (ex: MCP criando várias tarefas em sequência)? Ao navegar para o Inbox, todas as tarefas criadas são consolidadas e renderizadas na listagem de uma só vez.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao criar uma tarefa dentro da página de detalhes de um projeto (`ProjectsPage`), o sistema DEVE atualizar o estado global de tarefas (`TasksContext`) de modo que a nova tarefa esteja disponível imediatamente no Inbox.
- **FR-002**: A tela do Inbox (`HomePage`) DEVE atualizar ativamente a lista de tarefas e os vínculos projeto-tarefa ao ser montada ou visitada, garantindo que tarefas criadas externamente (como via MCP ou API) apareçam sem necessidade de recarregar a página (`F5`).
- **FR-003**: O serviço/contexto de tarefas (`TasksContext`) DEVE invalidar seu cache ou fornecer mecanismo de recarga forçada (`force: true`) sempre que novas tarefas forem criadas em qualquer fluxo do aplicativo ou na entrada da página principal.
- **FR-004**: A associação entre projeto e tarefa (`projectsTasksApi`) DEVE ser sincronizada com a lista de projetos ativos do usuário para que as badges de projeto no Inbox sejam calculadas e exibidas corretamente para tarefas recém-criadas.
- **FR-005**: Ao editar ou remover uma tarefa a partir de qualquer visualização (seja no Inbox ou na página do projeto), a alteração DEVE refletir em todas as outras visualizações sem descompasso de dados.

---

### Key Entities *(include if feature involves data)*

- **Tarefa (Task)**: Representa a tarefa do usuário com título, prazo, status de conclusão, campos customizados e lista de identificadores de projetos vinculados.
- **Vínculo Projeto-Tarefa (ProjectTask Assignment)**: Mapeamento n-para-n entre o identificador do projeto e o identificador da tarefa, utilizado pelo Inbox para exibir a etiqueta colorida do projeto.
- **Estado Global de Tarefas (TasksContext State)**: Repositório em memória no frontend que fornece a lista de tarefas ativas para o Inbox e componentes agregadores.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das tarefas criadas dentro de páginas de projeto ou via MCP aparecem na listagem do Inbox no primeiro acesso à página, com 0% de necessidade de recarregar a aplicação via navegador (`F5`).
- **SC-002**: O tempo entre navegar para o Inbox e a exibição completa das tarefas atualizadas é inferior a 300ms.
- **SC-003**: 100% das tarefas vinculadas a projetos exibem a badge correta de identificação do projeto no Inbox.
- **SC-004**: Nenhuma duplicação de tarefas ocorre durante sincronizações sucessivas ou alternâncias de rotas.

---

## Assumptions

- O endpoint `GET /api/tasks` ou `GET /api/tasks/with-universal-custom-fields` retorna todas as tarefas ativas do usuário autenticado no backend.
- A criação de tarefas via MCP já persiste os dados corretamente no banco de dados do backend na rota `POST /api/tasks` e `POST /api/ProjectsTasks/assign`.
- O comportamento esperado do Inbox é exibir todas as tarefas ativas do usuário, independentemente de estarem vinculadas a projetos ou serem tarefas avulsas.
