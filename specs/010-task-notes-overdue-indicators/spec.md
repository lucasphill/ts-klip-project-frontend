# Feature Specification: Indicador de Notas e Destaque de Tarefas Vencidas

**Feature Branch**: `010-task-notes-overdue-indicators`

**Created**: 2026-08-25

**Status**: Ready for Planning

**Input**: User description: "para o frontend quero fazer duas atualizações de layout. quero que na lista de tarefas exista um balão, visualmente simples, para mostra se uma tarefa tem ou não alguma nota/observação. esse balão deve ser pequeno ao lado do titulo e deve servir como botão, tanto para visualizar quando para atualizar ou criar uma nota, atualizando a tarefa atual. aproveitando essa mesma spec quero dar destaque para as tarefas com data de vencimento, vencidas. quando uma tarefa tiver data/prazo e essa data estiver vencida sem conclusão quero que haja algum destaque visualmente simples desse vencimento."

## Clarifications

### Session 2026-08-25

- Q: Como o botão/balão de notas deve se comportar visualmente na lista quando uma tarefa ainda não possui nenhuma nota cadastrada? → A: Ocultar o ícone em tarefas sem notas e revelá-lo suavemente ao passar o cursor sobre a linha (ou ao focar via teclado), mantendo o ícone permanentemente visível apenas nas tarefas com notas.
- Q: Como o destaque de tarefa vencida deve ser estilizado visualmente na coluna de Prazo? → A: Exibir o texto da data no campo de prazo em tom avermelhado contrastante (`text-red-600 dark:text-red-400`), sem ícones de alerta adicionais, preservando um visual limpo e minimalista.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Indicador e Edição Rápida de Notas/Observações na Tabela de Tarefas (Priority: P1) 🎯 MVP

Como usuário gerenciando tarefas nas visualizações de Inbox, Projetos ou Visão Mensal, quero visualizar um pequeno balão/ícone ao lado do título da tarefa indicando se ela possui notas cadastradas e poder clicar nesse balão para visualizar, adicionar ou editar a nota rapidamente sem precisar abrir a gaveta/modal completa de edição, para que eu possa consultar e atualizar detalhes contextuais com agilidade.

**Why this priority**: Permite acesso imediato ao conteúdo das anotações das tarefas diretamente na grade principal, reduzindo atrito de navegação e acelerando o fluxo de trabalho diário.

**Independent Test**: Pode ser testado abrindo a lista de tarefas, localizando tarefas com e sem notas, passando o mouse sobre tarefas sem notas para acionar o botão de adicionar ou clicando no balão destacado em tarefas com notas, abrindo o popover, modificando o texto e salvando. A nota deve ser salva no servidor, o balão deve refletir o novo estado e persistir após recarregamento.

**Acceptance Scenarios**:

1. **Given** uma tarefa que possui anotações preenchidas (`notes` com texto não vazio), **When** a tarefa é renderizada na lista, **Then** um balão/ícone de nota é exibido permanentemente ao lado do título com destaque visual ativo e tooltip indicando a presença de anotações.
2. **Given** uma tarefa que NÃO possui anotações (`notes` vazio ou nulo), **When** o usuário passa o cursor sobre a linha da tarefa ou navega nela com o teclado, **Then** o botão do balão de nota se torna visível em estilo discreto permitindo clique para adicionar nota.
3. **Given** que o usuário clica no balão de nota de qualquer tarefa, **When** o popover se abre, **Then** um campo de texto (`textarea`) exibe o conteúdo atual da nota (ou campo em branco caso não haja), acompanhado de ações claras para Salvar e Cancelar/Fechar.
4. **Given** que o usuário edita o texto no popover e aciona o salvamento, **When** a operação é processada, **Then** a tarefa é atualizada localmente e na API, o popover se fecha e o indicador de nota reflete imediatamente a presença ou ausência de conteúdo.
5. **Given** que o usuário apaga todo o texto da nota no popover e salva, **When** a alteração é confirmada, **Then** o campo de nota é limpo na API e o indicador retorna ao estado de tarefa sem notas (visível apenas no hover/foco).

---

### User Story 2 - Destaque Visual para Tarefas com Prazo Vencido (Priority: P2)

Como usuário acompanhando meus prazos, quero que tarefas que possuam data de vencimento no passado e que ainda estejam pendentes (não concluídas) tenham um destaque visual claro e elegante na lista através da cor do texto de prazo, para que eu possa identificar imediatamente compromissos em atraso sem poluição visual.

**Why this priority**: Dá visibilidade imediata a pendências críticas em atraso, melhorando a gestão de tempo e prevenindo que tarefas importantes sejam esquecidas.

**Independent Test**: Pode ser testado criando ou visualizando tarefas com datas anteriores à data atual (ontem ou dias anteriores) e tarefas com datas futuras ou de hoje. As tarefas passadas e pendentes devem exibir a data em tom avermelhado no campo de prazo (sem ícone adicional). Ao marcar a tarefa como concluída, o destaque avermelhado de atraso deve ser removido.

**Acceptance Scenarios**:

1. **Given** uma tarefa não concluída (`isCompleted: false`) com data de vencimento anterior à data atual (`dueDate < today`), **When** a linha da tarefa é exibida na tabela, **Then** o texto da data no campo de prazo é renderizado em tom avermelhado (`text-red-600 dark:text-red-400`) sem ícones adicionais.
2. **Given** uma tarefa com data de vencimento para a data atual (hoje) ou para o futuro (`dueDate >= today`), **When** a tarefa é renderizada, **Then** a data é exibida com a cor neutra padrão de prazo.
3. **Given** uma tarefa vencida que o usuário marca como concluída (`isCompleted: true`), **When** o status é alterado, **Then** o destaque avermelhado é desativado e substituído pelo estilo padrão de tarefa concluída (texto tachado/atenuado).
4. **Given** uma tarefa vencida cuja data é atualizada para hoje ou uma data futura, **When** a nova data é salva, **Then** o destaque avermelhado é removido instantaneamente da interface.
5. **Given** uma tarefa sem prazo definido (`dueDate` nulo/vazio), **When** renderizada, **Then** exibe o indicador padrão "Sem prazo" na cor neutra padrão.

---

### User Story 3 - Acessibilidade, Responsividade e Suporte a Temas (Priority: P3)

Como usuário utilizando teclado, telas menores ou modo escuro, quero que o balão de notas e os destaques de vencimento sejam totalmente acessíveis, legíveis e não causem quebras de layout.

**Why this priority**: Garante que os novos elementos respeitem os padrões de acessibilidade (WCAG), a experiência visual limpa e as diretrizes de design do Klip.

**Independent Test**: Navegar pela tabela usando a tecla `Tab`, abrir o popover de notas via `Enter`/`Space`, fechar via `Escape`, alternar entre temas claro e escuro, e testar em larguras reduzidas de coluna.

**Acceptance Scenarios**:

1. **Given** que o usuário navega com o teclado, **When** foca no botão do balão de notas e pressiona `Enter` ou `Space`, **Then** o popover de notas é aberto e o foco é posicionado no campo de texto.
2. **Given** que o popover de notas está aberto, **When** o usuário pressiona `Escape`, **Then** o popover é fechado sem salvar alterações e o foco retorna ao botão de notas.
3. **Given** que o usuário alterna entre o tema Claro e Escuro, **When** observa o balão de notas e a cor de texto da data de vencimento, **Then** o contraste de cores atende aos requisitos de acessibilidade em ambos os temas.
4. **Given** um título de tarefa longo em uma coluna estreita, **When** os indicadores de nota e Google Calendar são exibidos, **Then** o layout mantém o alinhamento adequado sem quebra de linha indesejada ou sobreposição de texto.

---

### Edge Cases

- **Tarefa com nota muito longa**: O popover deve possuir altura máxima (`max-h`) com barra de rolagem vertical suave para textos extensos, sem vazar para fora da tela.
- **Subtarefas na árvore hierárquica**: As linhas filhas (subtarefas) devem receber o mesmo balão de notas e destaque de vencimento com indentação compatível.
- **Fuso horário e virada de dia**: A determinação de "vencida" deve comparar a data local do cliente com base no padrão YYYY-MM-DD, evitando falsos positivos causados por discrepâncias de UTC.
- **Falha de rede ao salvar nota**: Se a requisição de atualização da nota falhar, o estado da nota deve ser revertido com exibição de notificação toast de erro amigável.
- **Edição concorrente**: Se o usuário abrir a gaveta principal de edição de tarefas enquanto o popover estiver aberto, o popover deve se fechar graciosamente.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir um botão/ícone de balão de notas ao lado do título de cada tarefa na listagem da tabela de tarefas (`TaskTable`), tanto em tarefas raiz quanto em subtarefas.
- **FR-002**: O sistema DEVE manter o balão de nota permanentemente visível e destacado quando a tarefa possuir anotações cadastradas (`notes`), e ocultá-lo por padrão quando a tarefa não possuir notas, revelando-o suavemente sob hover do cursor na linha ou ao focar via navegação por teclado.
- **FR-003**: Ao clicar no balão de notas, o sistema DEVE abrir um popover flutuante rápido contendo um campo de texto (`Textarea`) com a nota atual da tarefa e botões para "Salvar" e "Cancelar".
- **FR-004**: Ao salvar no popover de notas, o sistema DEVE atualizar imediatamente os dados da tarefa localmente e persistir a alteração via API (`tasksApi.update`), refletindo o novo status visual do balão.
- **FR-005**: O sistema DEVE calcular dinamicamente se uma tarefa está vencida com base na data de vencimento (`dueDate`), status de conclusão (`isCompleted: false`) e data atual local (`dueDate < today`).
- **FR-006**: O sistema DEVE aplicar destaque visual limpo em tarefas pendentes vencidas estilizando o texto da data de vencimento em tom avermelhado (`text-red-600 dark:text-red-400`), sem adicionar ícones de alerta na coluna de prazo.
- **FR-007**: O sistema DEVE desativar o destaque avermelhado de vencimento imediatamente caso a tarefa seja marcada como concluída (`isCompleted: true`) ou caso a data seja alterada para hoje ou data futura.
- **FR-008**: O sistema DEVE garantir suporte a navegação por teclado (abertura via `Enter`/`Space`, fechamento via `Escape`, atalho `Ctrl+Enter` para salvar no textarea) e rótulos descritivos de acessibilidade (`aria-label`).
- **FR-009**: Todos os elementos visuais adicionados DEVEM respeitar o esquema de cores e contraste dos temas Claro e Escuro da aplicação.

---

### Key Entities *(include if feature involves data)*

- **Tarefa (Task / GetTasksDto)**: Registro de tarefa contendo `id`, `title`, `notes` (conteúdo textual livre da observação), `dueDate` (data limite no formato YYYY-MM-DD), `isCompleted` (status de conclusão), `parentTaskId`, `googleCalendarEventId` e campos customizados.
- **Estado de Vencimento (Overdue State)**: Propriedade visual calculada dinamicamente:
  - `isOverdue`: `true` quando `!isCompleted && Boolean(dueDate) && dueDate < todayString`, `false` nos demais casos.
- **Indicador de Notas (Task Note Indicator)**: Componente interativo associado ao campo `notes` da tarefa que controla a exibição do estado de anotação e o acionamento do popover de edição rápida.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários conseguem identificar tarefas com anotações e tarefas vencidas em menos de 1 segundo ao escanear a tabela de tarefas.
- **SC-002**: Usuários conseguem ler, adicionar ou alterar a anotação de uma tarefa em no máximo 2 cliques (abrir popover + salvar), sem abrir telas secundárias.
- **SC-003**: 100% das tarefas pendentes com data anterior à data de hoje exibem o texto em tom avermelhado em todas as visualizações com `TaskTable` (Inbox, Projetos, Visão Mensal).
- **SC-004**: 0% de sobreposição ou quebra de layout na célula de título com múltiplos badges (subtarefa, Google Calendar, balão de notas).

---

## Assumptions

- O campo `notes` já é aceito pela API no DTO de atualização de tarefas (`tasksApi.update`), não necessitando de alterações estruturais no backend.
- A comparação de data de vencimento considera a data local do navegador no formato `YYYY-MM-DD`, onde qualquer data estritamente anterior à data local atual é considerada vencida.
- O balão de notas na listagem substitui a necessidade de abrir o formulário completo de edição para simples anotações rápidas, complementando as opções de edição já existentes.
- O componente visual de edição de nota utilizará o componente padrão de Popover do shadcn/ui já instalado no projeto.
