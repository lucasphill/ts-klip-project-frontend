# Feature Specification: Estado de Carregamento Animado, Sincronização e Transição Suave da Barra Lateral

**Feature Branch**: `013-sidebar-loading-state`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "precisamos resolver esse problema de layout mas acho que não mostrar enquanto carrega é uma opção ruim para o ux/ui. penso em adicionar um layout simples de loading (ex https://icons8.com/icons/set/dots-loading--animated) a ser mostrado enquanto todas as tarefas ainda não foram carregadas." + "adicione a essa especificação uma animação suave ao abrir e fechar a sidebar para os itens internos evitando que ocorra um salto entre um estado e outro dos itens da sidebar. caso necessãrio valide o corrido via mcp do chrome."

## Clarifications

### Session 2026-08-25
- Q: Como o indicador de carregamento animado (dots loading) deve ser apresentado na seção de projetos da barra lateral expandida? → A: Option B (Apenas os 3 pontos animados pulsantes / dots loading puros, sem texto adicional).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Indicador Visual de Carregamento Animado (Dots Loading Puro) na Barra Lateral (Priority: P1) 🎯 MVP

Como usuário abrindo ou recarregando a aplicação, quero ver um indicador visual animado composto por 3 pontos pulsantes em sequência (*dots loading* puros, sem texto adicional) na seção de projetos da barra lateral enquanto os projetos e pastas estão sendo carregados, para saber que meus dados estão sendo sincronizados e evitar uma área vazia sem contexto.

**Why this priority**: Fornece feedback visual imediato de progresso (UX essencial) de forma limpa e minimalista.

**Independent Test**: Abrir a aplicação com uma conexão simulada ou throttling de rede, verificar que a seção de projetos exibe uma animação fluida de 3 pontos pulsantes (*dots loading*) até que os dados sejam completamente recebidos e renderizados.

**Acceptance Scenarios**:

1. **Given** a aplicação iniciando ou recarregando, **When** as requisições de projetos e grupos de projetos estiverem pendentes, **Then** a seção de projetos da barra lateral exibe um indicador animado de carregamento com 3 pontos pulsantes em sequência (*animated dots* puros, centralizados e sem texto complementar).
2. **Given** o estado de carregamento ativo, **When** a resposta dos dados é recebida com sucesso, **Then** o indicador animado dá lugar à lista final de projetos e pastas com uma transição suave (*fade-in*).
3. **Given** o usuário utilizando o tema escuro ou claro, **When** o indicador de carregamento é renderizado, **Then** as cores dos pontos respeitam as variáveis semânticas de tema (`var(--text-muted)` ou `var(--brand)`).

---

### User Story 2 - Renderização Atômica e Fim dos Pulos Visuais (Priority: P1)

Como usuário, quero que os projetos pertencentes a pastas apareçam diretamente dentro de suas respectivas pastas desde o primeiro instante de exibição, sem aparecerem soltos na raiz para depois pularem para dentro da pasta, para que a navegação seja previsível e estável.

**Why this priority**: Elimina a condição de corrida e a instabilidade visual causada pelo retorno assíncrono descoordenado entre as APIs de projetos e de grupos.

**Independent Test**: Observar o carregamento da lista de projetos e confirmar que nenhum projeto pertencente a uma pasta é listado na raiz em nenhum momento da inicialização.

**Acceptance Scenarios**:

1. **Given** projetos que possuem um grupo associado (`groupId != null`), **When** os dados são processados para exibição, **Then** eles nunca são classificados ou renderizados como projetos raiz soltos.
2. **Given** o término do carregamento inicial, **When** a lista de projetos e pastas é apresentada, **Then** os projetos agrupados surgem já posicionados dentro de suas pastas correspondentes sem movimentações ou saltos na tela.

---

### User Story 3 - Suporte aos Modos Expandido e Recolhido da Barra Lateral (Priority: P2)

Como usuário, quero que o indicador de carregamento se adapte perfeitamente tanto ao modo expandido quanto ao modo recolhido (compacto) da barra lateral, sem quebrar o layout nem desalinhar os itens fixos (Inbox, Calendário, Configurações).

**Why this priority**: Garante que o indicador seja ergonômico e responsivo em qualquer estado de visualização escolhido pelo usuário.

**Independent Test**: Recarregar a página com a barra lateral no modo expandido e verificar o layout de loading; em seguida, recolher a barra lateral, recarregar a página e verificar o indicador compacto centralizado.

**Acceptance Scenarios**:

1. **Given** a barra lateral no modo expandido (`isExpanded: true`), **When** os projetos estão carregando, **Then** o indicador de 3 pontos pulsantes é exibido centralizado com espaçamento vertical adequado na seção de projetos.
2. **Given** a barra lateral no modo recolhido (`isExpanded: false`), **When** os projetos estão carregando, **Then** o indicador exibe uma animação compacta de pontos centralizada dentro da largura de 56px da barra lateral.

---

### User Story 4 - Animação Suave e Transição Gradual dos Itens Internos da Barra Lateral (Priority: P2)

Como usuário alternando entre os estados expandido e recolhido da barra lateral, quero que os elementos internos (textos, títulos, botões de ação, badges e campo de busca) realizem uma transição suave e gradual de opacidade e largura sincronizada com a barra lateral, para evitar que os itens surjam ou desapareçam em saltos bruscos durante a animação de abertura e fechamento.

**Why this priority**: Evita quebras visuais e o efeito de "pop-in/pop-out" abrupto dos textos enquanto o container da barra lateral está deslizando em largura (`200ms`).

**Independent Test**: Clicar repetidamente no botão "Recolher" / "Expandir" e verificar via gravação ou inspeção visual que os textos e botões internos esmaecem suavemente (`transition-opacity`, `transition-all duration-200`) em sincronia com o redimensionamento da barra, sem quebra de linha ou salto instantâneo de layout.

**Acceptance Scenarios**:

1. **Given** a barra lateral no estado expandido, **When** o usuário clica em "Recolher", **Then** os rótulos de texto, badges e botões de ação realizam um esmaecimento suave e sincronizado com a redução da largura da barra (`duration-200`), mantendo os ícones perfeitamente centralizados.
2. **Given** a barra lateral no estado recolhido, **When** o usuário clica em "Expandir", **Then** a largura se expande suavemente e os rótulos de texto ressurgem com transição de opacidade limpa sem sobreposição ou estouro de layout.
3. **Given** a transição em andamento, **When** os itens estão redimensionando, **Then** não ocorre quebra de linha de texto (*no text wrapping*) ou tremor de ícones (*no jitter*).

---

### Edge Cases

- **Erro no carregamento de projetos ou grupos**: Se a requisição falhar (ex: queda de rede), o indicador de loading deve cessar e exibir um botão sutil de "Tentar novamente" ou mensagem discreta.
- **Usuário sem nenhum projeto ou grupo cadastrado**: Após o término do loading, se a lista for vazia, deve exibir a mensagem amigável "Nenhum projeto ou pasta" (apenas no modo expandido).
- **Conexão ultrarrápida (resposta < 50ms)**: A transição de loading deve ser imperceptível e sem flickers indesejados.
- **Cliques rápidos consecutivos no botão recolher/expandir**: As transições de CSS devem acompanhar a interpolação contínua sem quebrar o estado final do componente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar um estado de carregamento unificado (`isLoadingProjects` / `isLoadingGroups`) no contexto de projetos e na barra lateral.
- **FR-002**: O sistema DEVE renderizar um componente de loading animado (estilo *animated dots* com 3 pontos pulsantes em sequência, puros e sem texto auxiliar) na seção de projetos da barra lateral enquanto o carregamento inicial estiver ativo.
- **FR-003**: O sistema DEVE ocultar o indicador de carregamento e exibir a lista de projetos e pastas com transição suave (*fade-in*) assim que os dados estiverem disponíveis.
- **FR-004**: O sistema NUNCA DEVE renderizar projetos associados a grupos (`groupId` / `group_id` preenchidos) no bloco de projetos raiz (sem pasta).
- **FR-005**: O sistema DEVE manter os itens estáticos da barra lateral (Inbox, Calendário, Nova Tarefa, Configurações) sempre visíveis e acessíveis durante o carregamento dos projetos.
- **FR-006**: O indicador de carregamento DEVE se adaptar visualmente ao modo expandido e ao modo recolhido da barra lateral.
- **FR-007**: O sistema DEVE aplicar transições suaves de opacidade e largura (`transition-all duration-200`, `transition-opacity`, `whitespace-nowrap overflow-hidden`) para todos os textos, badges, campo de busca e botões de ação internos ao expandir e recolher a barra lateral.
- **FR-008**: O indicador de carregamento e as animações DEVEM utilizar animações em CSS puro / Tailwind sem dependências externas adicionais.

### Key Entities

- **Estado de Carregamento (`isLoading`)**: Indicador booleano que reflete se as requisições iniciais de projetos e grupos estão em andamento.
- **LoadingDots (`AnimatedDotsLoading`)**: Componente de apresentação visual com animação fluida de 3 pontos pulsantes.
- **Transição de Sidebar (`SidebarTransition`)**: Regras de transição suave aplicadas aos elementos filhos da barra lateral.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0% de ocorrência de projetos agrupados sendo exibidos temporariamente fora de suas pastas durante a inicialização da aplicação.
- **SC-002**: O indicador de carregamento surge em menos de 16ms após a inicialização da barra lateral e permanece ativo até a conclusão das requisições.
- **SC-003**: A transição do estado de loading para a lista carregada ocorre de forma fluida sem quebra de layout ou saltos bruscos de altura.
- **SC-004**: 100% dos elementos de texto e ações da barra lateral realizam transição suave de opacidade e largura durante a abertura/fechamento, com 0 saltos bruscos (*pop-in/out*).
- **SC-005**: 100% de compatibilidade visual do indicador de loading e das animações nos modos claro e escuro.

## Assumptions

- O componente de loading e as transições serão implementados com Tailwind CSS e CSS nativo, garantindo leveza e zero bibliotecas externas adicionais.
- A persistência do status da barra lateral já implementada (`"klip_sidebar_expanded"`) continuará sendo respeitada durante o loading e nas transições.
