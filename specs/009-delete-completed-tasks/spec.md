# Feature Specification: Exclusão em Lote de Tarefas Concluídas

**Feature Branch**: `009-delete-completed-tasks`

**Created**: 2026-08-25

**Status**: Ready for Planning

**Input**: User description: "atualizamos a API com um endpoint novo de exclusão de todas as tarefas completas e ela possui um parametro informando o projeto como opicional. precisamos implementar ela na interface. quero um botão nas configurações seguindo o mesmo padrão do botão de excluir conta e também quero um botão mais simples dentro de cada projeto que também solicite confirmação escrita/digitada. verifique na API em https://api.klip.app.br/scalar/#tag/tasks/DELETE/api/Tasks/completed"

## Clarifications

### Session 2026-08-25

- Q: Onde o botão de exclusão de tarefas concluídas do projeto deve ser posicionado na interface ao visualizar um projeto? → A: No cabeçalho superior do projeto (`TaskViewLayout`), alinhado ao lado do botão "Gerenciar campos" com ícone e estilo dedicados.
- Q: Qual palavra-chave digitada deve ser exigida para habilitar a confirmação nos modais (tanto nas Configurações quanto no Projeto)? → A: A palavra-chave `DELETAR` (em caixa alta) em ambos os modais, mantendo conformidade com o padrão já utilizado na exclusão de conta.
- Q: Como o botão de exclusão de tarefas concluídas no projeto deve se comportar quando o projeto não possuir nenhuma tarefa concluída? → A: O botão permanece habilitado; o modal informa a ação com clareza e, se executado, o sistema notifica amigavelmente caso 0 tarefas sejam removidas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exclusão Global de Tarefas Concluídas nas Configurações (Priority: P1) 🎯 MVP

Como usuário do Klip, quero ter uma opção na tela de Configurações (dentro da área de gerenciamento de dados/zona de risco) para excluir de uma só vez todas as tarefas concluídas da minha conta, mediante confirmação textual com a palavra `DELETAR`, para que eu possa limpar meu histórico e manter apenas as tarefas ativas e pendentes sem risco de exclusão acidental.

**Why this priority**: É o ponto central de controle para manutenção e limpeza de dados do usuário em toda a aplicação, permitindo liberar espaço e eliminar tarefas já finalizadas globalmente de forma segura.

**Independent Test**: Pode ser testado acessando as Configurações (`/settings/profile`), clicando no botão de excluir tarefas concluídas na seção de perigo, digitando a palavra `DELETAR` no modal e acionando a confirmação. O sistema deve remover todas as tarefas concluídas da conta, exibir mensagem de sucesso informando quantas tarefas foram excluídas e atualizar instantaneamente as listas (Inbox, Projetos, etc.).

**Acceptance Scenarios**:

1. **Given** que o usuário possui tarefas concluídas distribuídas entre múltiplos projetos e tarefas avulsas, **When** ele acessa a área de Zona de Perigo nas Configurações e clica em "Excluir Tarefas Concluídas", **Then** um modal de confirmação de alto impacto é exibido explicando as consequências irreversíveis e solicitando que o usuário digite `DELETAR`.
2. **Given** que o modal de exclusão global está aberto, **When** o usuário digita um texto diferente de `DELETAR`, **Then** o botão de ação destrutiva permanece desabilitado e não permite envio acidental.
3. **Given** que o usuário digitou `DELETAR` e clicou no botão de confirmação, **When** a solicitação é processada com sucesso, **Then** todas as tarefas concluídas da conta são removidas permanentemente, uma notificação de sucesso informa o número de tarefas excluídas e todas as visualizações ativas deixam de exibir essas tarefas.
4. **Given** que o usuário não possui nenhuma tarefa concluída na conta, **When** ele aciona a exclusão global e confirma com `DELETAR`, **Then** o sistema processa a operação com segurança e informa que 0 tarefas foram excluídas (ou que nenhuma tarefa concluída foi encontrada).

---

### User Story 2 - Exclusão de Tarefas Concluídas no Contexto de um Projeto (Priority: P2)

Como usuário visualizando um projeto específico, quero ter um botão de ação rápida no cabeçalho da página do projeto (ao lado de "Gerenciar campos") para excluir apenas as tarefas concluídas daquele projeto, com confirmação pela palavra `DELETAR`, para que eu possa organizar o projeto atual sem afetar as tarefas concluídas de outros projetos ou do Inbox geral.

**Why this priority**: Permite uma gestão pontual e cirúrgica do fluxo de trabalho por projeto, mantendo as ações de nível de projeto agrupadas visualmente no cabeçalho superior.

**Independent Test**: Pode ser testado abrindo um projeto específico que contenha tarefas pendentes e concluídas, clicando na ação de exclusão de tarefas concluídas no cabeçalho do projeto, digitando `DELETAR` no modal e verificando que apenas as tarefas concluídas daquele projeto específico foram apagadas, enquanto tarefas pendentes e tarefas de outros projetos permanecem intactas.

**Acceptance Scenarios**:

1. **Given** que o usuário está na página de um projeto (`/project/:projectId`), **When** ele visualiza o cabeçalho superior da página (`TaskViewLayout`), **Then** um botão de ação rápida para excluir/limpar tarefas concluídas do projeto está visível ao lado do botão "Gerenciar campos".
2. **Given** que o usuário aciona a ação de limpar tarefas concluídas no cabeçalho do projeto, **When** o modal de confirmação é exibido, **Then** o texto informativo especifica claramente o nome do projeto atual e solicita a digitação de `DELETAR` para liberar a exclusão.
3. **Given** que o usuário digita `DELETAR` e confirma no modal do projeto, **When** a exclusão é concluída, **Then** apenas as tarefas concluídas do projeto em questão são removidas da lista do projeto e do estado global, exibindo feedback de sucesso com o total de tarefas apagadas.
4. **Given** que o projeto possui tarefas com subtarefas ou campos customizados concluídos, **When** a exclusão é efetuada, **Then** o sistema remove integralmente essas tarefas e suas dependências associadas sem deixar resíduos órfãos na interface.
5. **Given** que o projeto não possui nenhuma tarefa concluída no momento, **When** o usuário aciona o botão e confirma, **Then** a requisição é processada com segurança e uma mensagem amigável informa que 0 tarefas foram removidas.

---

### User Story 3 - Feedback de Processamento, Acessibilidade e Prevenção de Erros (Priority: P3)

Como usuário executando operações destrutivas em lote, quero receber feedback visual imediato de carregamento, validação de teclado e mensagens de erro compreensíveis em caso de falha de conexão, para ter certeza absoluta do status da operação e evitar múltiplos cliques.

**Why this priority**: Garante robustez operacional, previne requisições duplicadas em lote e assegura a conformidade com as diretrizes de acessibilidade e consistência visual do Klip.

**Independent Test**: Pode ser testado disparando a confirmação com lentidão de rede simulada ou falha temporária e verificando o estado de carregamento do botão (spinner, bloqueio de inputs e botões de cancelar/fechar) e exibição do alerta de erro correspondente.

**Acceptance Scenarios**:

1. **Given** que a exclusão em lote está em processamento, **When** o usuário observa a interface, **Then** o botão exibe um indicador de carregamento (spinner), o campo de texto e o botão de cancelamento são desabilitados, e novos cliques são ignorados.
2. **Given** que o modal de confirmação está aberto com `DELETAR` digitado, **When** o usuário pressiona a tecla `Enter`, **Then** a confirmação é disparada automaticamente sem necessidade de clique com o mouse.
3. **Given** que ocorre uma falha de conexão ou erro do servidor durante a exclusão, **When** o erro é retornado, **Then** uma mensagem clara é apresentada ao usuário em forma de notificação toast, mantendo as tarefas inalteradas.

---

### Edge Cases

- O que acontece se o usuário disparar a exclusão de tarefas concluídas de um projeto que não possui nenhuma tarefa concluída? O sistema envia a requisição normalmente e exibe uma notificação amigável informando que 0 tarefas foram excluídas.
- O que acontece se uma tarefa concluída possuir subtarefas pendentes ou concluídas associadas? A exclusão em lote no backend remove as tarefas concluídas e gerencia em cascata suas dependências conforme a regra do endpoint; a interface deve refletir a exclusão completa atualizando a árvore hierárquica e a contagem de tarefas.
- O que acontece se o projeto estiver arquivado? Se o usuário estiver visualizando um projeto arquivado, a ação de exclusão de tarefas concluídas no cabeçalho deve seguir o mesmo comportamento de segurança, exigindo confirmação digitada com `DELETAR` antes de disparar a exclusão scoped ao projeto.
- O que acontece se a conexão de internet cair durante o envio? O modal encerra o estado de carregamento, exibe mensagem amigável de erro de comunicação e não altera o estado local das tarefas.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar na página de Configurações de Perfil (`SettingsProfilePage`), dentro do bloco de Zona de Perigo, uma opção visualmente destacada para exclusão permanente de todas as tarefas concluídas da conta do usuário.
- **FR-002**: O sistema DEVE exibir um modal de confirmação de alto impacto ao acionar a exclusão global nas Configurações, exigindo a digitação exata da palavra de confirmação `DELETAR` antes de permitir a submissão.
- **FR-003**: O sistema DEVE disponibilizar no cabeçalho superior de visualização de cada projeto (`TaskViewLayout` / `ProjectsPage`), posicionado ao lado do botão "Gerenciar campos", uma ação dedicada para exclusão das tarefas concluídas pertencentes exclusivamente àquele projeto.
- **FR-004**: O sistema DEVE exibir um modal de confirmação ao acionar a exclusão no projeto, contextualizando o nome do projeto e exigindo a digitação de `DELETAR` para habilitar a execução.
- **FR-005**: Ao confirmar a exclusão global nas Configurações, o sistema DEVE invocar o endpoint de exclusão de tarefas concluídas sem especificar identificador de projeto.
- **FR-006**: Ao confirmar a exclusão a partir de um projeto, o sistema DEVE invocar o endpoint de exclusão de tarefas concluídas informando o identificador do projeto como parâmetro `projectId`.
- **FR-007**: Após a exclusão bem-sucedida, o sistema DEVE atualizar o estado global de tarefas (`TasksContext`) e as listagens locais para remover imediatamente as tarefas excluídas sem necessidade de recarga da página (`F5`).
- **FR-008**: O sistema DEVE exibir uma notificação (toast) de sucesso informando a quantidade de tarefas que foram removidas após a conclusão da operação.
- **FR-009**: O sistema DEVE exibir estados de carregamento claros com desabilitação de controles interativos durante a execução da exclusão para prevenir submissões duplicadas.
- **FR-010**: O sistema DEVE suportar atalhos de teclado acessíveis (fechar modal via `Esc`, confirmar via `Enter` quando o texto for válido) e manter foco apropriado no campo de texto de confirmação ao abrir os modais.

---

### Key Entities *(include if feature involves data)*

- **Tarefa Concluída (Completed Task)**: Registro de tarefa que possui o status de conclusão marcado como verdadeiro (`isCompleted: true`), passível de limpeza em lote.
- **Escopo de Exclusão (Deletion Scope)**:
  - *Global*: Abrange todas as tarefas concluídas da conta do usuário em todos os projetos e na caixa de entrada.
  - *Projeto*: Restringe a exclusão apenas às tarefas concluídas vinculadas a um determinado identificador de projeto.
- **Resultado da Exclusão em Lote (Delete Completed Tasks Result)**: Dados retornados pela operação contendo o total de registros excluídos (`deletedCount`) e a lista de identificadores das tarefas removidas (`deletedTaskIds`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das operações de exclusão de tarefas concluídas (globais ou por projeto) exigem confirmação digitada da palavra `DELETAR` antes de permitir a exclusão, eliminando exclusões acidentais por clique involuntário.
- **SC-002**: A interface atualiza a listagem de tarefas e remove os itens excluídos em menos de 300ms após o término da requisição com a API.
- **SC-003**: 100% das operações de exclusão bem-sucedidas apresentam mensagem de feedback com o número exato de tarefas removidas.
- **SC-004**: Ao executar a exclusão restrita a um projeto, 0% das tarefas concluídas de outros projetos são afetadas ou excluídas.

---

## Assumptions

- O endpoint `DELETE /api/Tasks/completed` está disponível e funcional no backend, aceitando o parâmetro de query opcional `projectId` e retornando a contagem de itens removidos e seus identificadores.
- O padrão visual da Zona de Perigo existente na página de Configurações (utilizado no fluxo de exclusão de conta) serve de referência de estilo, cores, alertas e tipografia para a ação de exclusão global de tarefas concluídas.
- A palavra-chave padrão para confirmação em caixa alta é `DELETAR`, consistente com os modais de exclusão destrutiva já existentes na aplicação.
- As tarefas pendentes (`isCompleted: false`) nunca são impactadas por este endpoint.
