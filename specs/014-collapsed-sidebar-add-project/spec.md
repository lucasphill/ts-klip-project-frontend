# Feature Specification: Botão de Criação de Projetos e Pastas na Barra Lateral Colapsada

**Feature Branch**: `014-collapsed-sidebar-add-project`

**Created**: 2026-08-29

**Status**: Draft

**Input**: User description: "na barra colapsada a esquerda quero que adicione um botão + para adicionar projetos. Posicionamento acima dos projetos (entre o calendário e o primeiro projeto). Exibe um balão (HoverCard) com opções para adicionar um novo projeto ou uma nova pasta. Estilo com ícone de adição neutro alinhado ao padrão da barra. Ao selecionar a opção, abre o modal respectivo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar Novo Projeto com a Barra Colapsada (Priority: P1)

Como uma pessoa usuária com a barra lateral colapsada (modo compacto), quero conseguir criar um novo projeto rapidamente sem precisar expandir a barra inteira, para manter meu foco e fluxo de trabalho ágil.

**Why this priority**: É o objetivo principal da funcionalidade, permitindo que a ação fundamental de criar projetos esteja acessível mesmo no modo compacto da barra de navegação.

**Independent Test**: Com a barra lateral colapsada, posicionar o cursor sobre o botão de adição localizado entre os itens de navegação principal e a lista de projetos, selecionar a opção "Novo projeto" no balão flutuante e verificar a abertura do formulário de criação de projeto.

**Acceptance Scenarios**:

1. **Given** que a barra lateral está colapsada, **When** o usuário passa o cursor ou foca no botão de adição acima dos projetos, **Then** um balão suspenso flutuante (HoverCard) é exibido à direita contendo a opção "Novo projeto".
2. **Given** que o balão suspenso está visível, **When** o usuário clica na opção "Novo projeto", **Then** o modal de criação de projeto é aberto e o balão flutuante é fechado.
3. **Given** que a barra lateral está colapsada, **When** o usuário clica diretamente no botão de adição, **Then** o modal de criação de projeto é aberto como ação padrão direta.

---

### User Story 2 - Criar Nova Pasta/Grupo com a Barra Colapsada (Priority: P2)

Como uma pessoa usuária que organiza projetos em pastas, quero conseguir criar uma nova pasta/grupo diretamente a partir da barra lateral colapsada através do mesmo ponto de entrada.

**Why this priority**: Complementa a organização de projetos oferecendo paridade com os botões de cabeçalho disponíveis na barra lateral quando expandida.

**Independent Test**: Com a barra lateral colapsada, abrir o balão flutuante do botão de adição, clicar na opção "Nova pasta" e verificar se o modal de criação de grupo/pasta é exibido corretamente.

**Acceptance Scenarios**:

1. **Given** que a barra lateral está colapsada, **When** o usuário passa o cursor sobre o botão de adição de projetos, **Then** o balão exibe também a opção "Nova pasta" com seu respectivo ícone representativo.
2. **Given** que o balão está aberto, **When** o usuário clica em "Nova pasta", **Then** o modal de criação de pasta/grupo de projetos é acionado.

---

### User Story 3 - Navegação e Acessibilidade no Modo Compacto (Priority: P3)

Como uma pessoa usuária navegando por teclado ou leitor de tela, quero que o botão de adição na barra colapsada possua rótulo acessível compreensível e possa ser acionado sem depender exclusivamente do movimento do mouse.

**Why this priority**: Garante conformidade com as diretrizes de acessibilidade e consistência da experiência do produto.

**Independent Test**: Navegar usando a tecla `Tab` até o botão de adição na barra colapsada, verificar que o leitor de tela anuncia "Adicionar projeto ou pasta" e que as opções podem ser ativadas via teclado.

**Acceptance Scenarios**:

1. **Given** que a barra lateral está colapsada, **When** o foco via teclado atinge o botão de adição, **Then** um rótulo acessível claro (aria-label) é lido e o balão pode ser navegado.
2. **Given** que a barra lateral é expandida para o modo completo, **When** a interface atualiza, **Then** os botões tradicionais no cabeçalho "PROJETOS" são utilizados e o botão compacto específico da barra colapsada não polui visualmente o cabeçalho expandido.

---

### Edge Cases

- **Carregamento inicial**: Durante o carregamento assíncrono dos projetos e grupos, o botão de adição na barra colapsada permanece visível e funcional para permitir a criação imediata.
- **Fechamento ao clicar fora**: O balão flutuante deve se fechar suavemente quando o cursor se afasta ou quando o usuário clica fora dele ou tecla `Escape`.
- **Lista de projetos vazia**: Se o usuário não possuir nenhum projeto cadastrado e a barra estiver colapsada, o botão de adição deve permanecer posicionado logo abaixo do item de Calendário, servindo como convite para criar o primeiro projeto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir um botão de adição (`+`) na barra lateral colapsada posicionado verticalmente entre os itens principais de navegação (Inbox/Calendário) e o primeiro item da lista de projetos/pastas.
- **FR-002**: O botão DEVE utilizar estilo visual neutro e discreto, em harmonia com os demais botões da barra lateral.
- **FR-003**: Ao passar o cursor (hover) sobre o botão na barra colapsada, o sistema DEVE abrir um balão flutuante (HoverCard) posicionado à direita da barra lateral.
- **FR-004**: O balão flutuante DEVE conter as seguintes opções claramente identificáveis:
  - Opção "Novo projeto" com ícone indicador;
  - Opção "Nova pasta" com ícone indicador de pasta.
- **FR-005**: Ao clicar na opção "Novo projeto" do balão flutuante, o sistema DEVE abrir o modal de criação de projeto e fechar o balão.
- **FR-006**: Ao clicar na opção "Nova pasta" do balão flutuante, o sistema DEVE abrir o modal de criação de pasta/grupo e fechar o balão.
- **FR-007**: Ao clicar diretamente no botão principal de adição, o sistema DEVE abrir o modal de criação de projeto por padrão.
- **FR-008**: O botão e suas ações NÃO DEVEM duplicar visualmente ou conflitar com o cabeçalho da seção de projetos quando a barra lateral estiver no modo expandido.
- **FR-009**: O botão DEVE possuir atributos de acessibilidade adequados (`aria-label`, suporte a foco por teclado e tooltip).

### Key Entities

- **Projeto**: Entidade de agrupamento de tarefas existente, criada via modal de projeto.
- **Pasta / Grupo de Projetos**: Entidade de agrupamento de projetos existente, criada via modal de grupo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários conseguem abrir o modal de criação de projeto a partir da barra colapsada em 1 único clique ou em menos de 2 segundos.
- **SC-002**: Usuários conseguem acessar a criação de pastas a partir da barra colapsada sem necessidade de expandir e recolher a barra lateral.
- **SC-003**: 100% dos testes de lint, compilação TypeScript e renderização da barra lateral passam sem erros ou quebras de layout em temas claro e escuro.

## Assumptions

- Os modais de criação de projeto (`AddProjectModal`) e criação de pasta (`AddProjectGroupModal`) já existem e serão reutilizados sem necessidade de alteração de seus contratos internos.
- O componente `HoverCard` já configurado no projeto é a primitiva padrão para balões flutuantes da barra lateral colapsada.
