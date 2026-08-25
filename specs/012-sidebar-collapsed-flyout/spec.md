# Feature Specification: Menu Flutuante (Flyout) e Ergonomia da Barra Lateral Recolhida

**Feature Branch**: `012-sidebar-collapsed-flyout`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "a sidebar quando recolhida está apresentando incosistencia visual. não é possivel saber quais projetos estão nem abrir a pasta de projetos, aleém de estar confusa e pouco usual. Penso em aumentar a ocupação vertical dos icones além de que quando houver hover do cursor abra um balão mostrando as opções necessárias. nao sei se esse balão tem nome, acredito que a biblioteca ant design ja tenha uma solução para esse layout de sidebar. anes de fazr a especify explique se o projeto possui ant design instalado e quais opções temos para solucionar esse problema." + Seleção da Opção A (Flyout Menu Flutuante no Hover com Radix UI / HoverCard).

## Clarifications

### Session 2026-08-25
- Q: Qual deve ser o comportamento ao clicar diretamente no ícone de uma pasta na barra lateral recolhida? → A: Option A (Manter o balão flutuante aberto/fixado para navegação e interação com os projetos e ações da pasta).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Menu Flutuante (Flyout) no Hover e Clique para Pastas/Grupos na Barra Lateral Recolhida (Priority: P1) 🎯 MVP

Como usuário utilizando a barra lateral recolhida (modo compacto de ícones), quero passar o cursor sobre o ícone de uma pasta/grupo de projetos ou clicar nele e ver um balão flutuante lateral (Flyout à direita) com o título da pasta, quantidade de projetos, ações rápidas e a lista completa de projetos pertencentes àquela pasta, para poder navegar diretamente para qualquer projeto ou gerenciá-los sem precisar expandir a barra lateral inteira.

**Why this priority**: É a principal deficiência de usabilidade da barra lateral recolhida, pois atualmente o usuário não consegue saber o conteúdo de uma pasta nem interagir com seus projetos.

**Independent Test**: Recolher a barra lateral com pastas e projetos cadastrados, passar o mouse sobre o ícone de uma pasta e verificar se o balão lateral surge suavemente à direita, exibindo o cabeçalho da pasta, os botões de ação e a lista clicável de projetos com navegação imediata. Clicar no ícone da pasta e confirmar que o balão permanece aberto para interação.

**Acceptance Scenarios**:

1. **Given** a barra lateral recolhida (`!isExpanded`), **When** o usuário posiciona o cursor sobre o ícone de uma pasta/grupo, **Then** um balão lateral flutuante (Flyout) é renderizado ancorado à direita do ícone com atraso suave (`openDelay`).
2. **Given** a barra lateral recolhida, **When** o usuário clica diretamente no ícone de uma pasta, **Then** o balão flutuante permanece aberto/fixado para navegação e interação.
3. **Given** o balão flutuante de uma pasta aberto, **When** o usuário visualiza o cabeçalho do balão, **Then** o nome da pasta, cor, ícone, contagem de projetos e botões de ação rápida ("Novo projeto na pasta", "Editar pasta", "Excluir pasta") são exibidos de forma organizada.
4. **Given** o balão flutuante de uma pasta com projetos, **When** o usuário clica em um dos projetos listados no balão, **Then** a aplicação navega imediatamente para a rota do projeto selecionado (`/project/:id`) e o balão fecha suavemente.
5. **Given** o balão flutuante de uma pasta sem projetos associados, **When** o balão é aberto, **Then** é exibida a mensagem amigável "Pasta vazia" juntamente com a opção de criar um novo projeto.
6. **Given** o balão flutuante aberto, **When** o cursor do mouse se move entre o ícone disparador e o corpo do balão flutuante, **Then** o balão permanece aberto sem fechar abruptamente (`closeDelay`).

---

### User Story 2 - Balão Informativo e Navegação Rápida para Projetos Raiz Recolhidos (Priority: P1)

Como usuário na barra lateral recolhida, quero passar o cursor sobre um projeto individual (raiz) e ver um balão lateral com o nome completo do projeto, cor e ações rápidas, além de poder clicar diretamente no ícone para acessar o projeto, para ter clareza sobre qual projeto estou selecionando.

**Why this priority**: Atualmente os projetos soltos na raiz exibem apenas uma bolinha pequena e sem texto, dificultando a identificação imediata do projeto na barra recolhida.

**Independent Test**: Na barra lateral recolhida, passar o mouse sobre o ícone de um projeto individual e verificar a exibição do balão lateral com nome completo, cor e atalhos de edição/arquivamento/exclusão, além de clicar no ícone para navegar para o projeto.

**Acceptance Scenarios**:

1. **Given** a barra lateral recolhida, **When** o usuário passa o cursor sobre o botão de um projeto individual, **Then** um balão lateral exibe o nome completo do projeto, sua cor e ações rápidas ("Editar", "Arquivar", "Excluir").
2. **Given** a barra lateral recolhida, **When** o usuário clica no botão do projeto individual, **Then** a aplicação navega diretamente para o projeto (`/project/:id`).
3. **Given** o projeto individual atualmente ativo/selecionado, **When** a barra lateral está recolhida, **Then** seu botão disparador exibe o preenchimento de fundo de item ativo (`bg-[var(--bg-soft-strong)]`) com bordas arredondadas.

---

### User Story 3 - Ergonomia Visual e Padronização da Ocupação Vertical (Priority: P2)

Como usuário, quero que todos os botões e ícones da barra lateral recolhida tenham dimensões confortáveis, alinhamento centralizado uniforme e espaçamento vertical agradável, para que a barra lateral pareça polida, moderna e fácil de clicar.

**Why this priority**: A interface atual possui elementos com alturas e paddings inconsistentes quando recolhida, gerando sensação de desorganização visual.

**Independent Test**: Inspecionar a barra lateral recolhida e verificar que Inbox, Calendário, Projetos Raiz, Pastas de Projetos, Botão Nova Tarefa e Configurações possuem largura e altura consistentes (`h-10 w-10` ou `h-9 w-9`), alinhamento centralizado e espaçamento vertical uniforme.

**Acceptance Scenarios**:

1. **Given** a barra lateral recolhida, **When** os itens de navegação são renderizados, **Then** cada botão de pasta e projeto possui dimensões fixas confortáveis (`h-10 w-10`), centralizado horizontalmente no menu.
2. **Given** o estado hover sobre qualquer ícone da barra recolhida, **When** o cursor passa sobre o elemento, **Then** o container do botão recebe transição suave com `hover:bg-[var(--bg-soft)]` e bordas arredondadas (`rounded-lg`).
3. **Given** transição entre o estado expandido e recolhido, **When** o usuário clica no botão "Recolher" / "Expandir", **Then** a barra lateral transiciona suavemente sem saltos visuais nos ícones.

---

### User Story 4 - Acessibilidade, Navegação por Teclado e Suporte a Temas (Priority: P3)

Como usuário que utiliza atalhos de teclado ou navegação por foco, quero que os menus flutuantes possam ser acionados via foco do teclado (`Tab`, `Enter`, `Space`, `Escape`) e respeitem os temas claro e escuro.

**Why this priority**: Garante conformidade com os princípios da Constituição do projeto de acessibilidade e consistência de temas.

**Independent Test**: Navegar com a tecla `Tab` pela barra lateral recolhida, verificar que o foco abre ou permite abrir o balão flutuante, pressionar `Escape` para fechar e alternar entre os temas claro e escuro.

**Acceptance Scenarios**:

1. **Given** navegação por teclado na barra lateral recolhida, **When** o foco (`Tab`) atinge um ícone de pasta ou projeto, **Then** o anel de foco visível é exibido e o balão flutuante pode ser acionado.
2. **Given** um balão flutuante aberto, **When** o usuário pressiona a tecla `Escape`, **Then** o balão é fechado imediatamente e o foco retorna ao botão disparador.
3. **Given** o modo escuro ou claro ativado, **When** o balão flutuante lateral é renderizado, **Then** suas cores de fundo (`bg-[var(--bg-card)]` / `bg-[var(--bg-elevated)]`), bordas (`border-[var(--border-subtle)]`) e textos respeitam as variáveis semânticas do tema.

---

### Edge Cases

- **Múltiplos projetos dentro de uma pasta**: Se uma pasta contiver mais de 8 projetos, a lista de projetos dentro do balão flutuante deve ter rolagem vertical interna (`max-h-60 overflow-y-auto`) sem estourar a viewport.
- **Nomes de projetos/pastas muito longos**: Nomes longos exibidos dentro do balão flutuante devem ser truncados com `truncate` e tooltip auxiliar para evitar quebra de layout do balão.
- **Telas com altura reduzida (`height < 600px`)**: O balão flutuante deve se auto-posicionar verticalmente (collision detection via Radix UI) para não ficar cortado nas extremidades superior ou inferior da tela.
- **Transição rápida do mouse**: Se o usuário passar o cursor rapidamente sobre múltiplos ícones, apenas o balão do ícone onde o mouse repousar por mais de 150ms deve abrir, evitando poluição visual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE renderizar os ícones de pastas e projetos na barra lateral recolhida com tamanho de alvo de toque padronizado (`h-10 w-10`), centralizados e com cantos arredondados (`rounded-lg`).
- **FR-002**: O sistema DEVE abrir um balão lateral flutuante (Flyout à direita) ao passar o cursor ou focar em um ícone de pasta/grupo quando a barra lateral estiver recolhida.
- **FR-003**: O sistema DEVE manter o balão flutuante aberto/fixado ao clicar diretamente no ícone de uma pasta na barra lateral recolhida para facilitar a interação.
- **FR-004**: O balão flutuante de pasta DEVE exibir o nome da pasta, ícone correspondente, cor associada, contagem de projetos e botões de ação ("Novo projeto", "Editar pasta", "Excluir pasta").
- **FR-005**: O balão flutuante de pasta DEVE listar todos os projetos pertencentes àquela pasta, exibindo seus nomes, indicadores de cor e permitindo navegação imediata ao clicar em um projeto.
- **FR-006**: O balão flutuante de pasta DEVE destacar visualmente o projeto atualmente ativo na aplicação com fundo suave (`bg-[var(--bg-soft-strong)]`).
- **FR-007**: O sistema DEVE abrir um balão lateral flutuante com nome completo, cor e botões de ação ("Editar", "Arquivar", "Excluir") ao passar o cursor sobre um projeto raiz na barra lateral recolhida.
- **FR-008**: O sistema DEVE permitir a navegação direta para o projeto raiz ao clicar no seu botão/ícone disparador na barra lateral recolhida.
- **FR-009**: O sistema DEVE implementar tolerância de movimento do cursor (`openDelay: ~150ms`, `closeDelay: ~100ms`) para permitir que o usuário mova o mouse do ícone disparador para o conteúdo do balão flutuante sem que ele se feche.
- **FR-010**: O sistema DEVE limitar a altura máxima da lista de projetos no balão flutuante (`max-h-60`) com barra de rolagem estilizada caso existam muitos projetos na pasta.
- **FR-011**: O sistema DEVE fechar o balão flutuante ao clicar em qualquer link de navegação ou pressionar a tecla `Escape`.

### Key Entities

- **Pasta/Grupo de Projetos (`ProjectGroup`)**: Grupo organizador de projetos com `id`, `name`, `color`, `icon` e lista de projetos filhos.
- **Projeto (`Project`)**: Projeto individual com `id`, `name`, `color`, `project_group_id` e status de arquivamento.
- **Flyout / HoverCard**: Componente flutuante contextual posicionado à direita da barra lateral compacta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das pastas e projetos na barra lateral recolhida possuem balões flutuantes contextuais funcionais com informações completas e legíveis.
- **SC-002**: O tempo para um usuário acessar qualquer projeto dentro de uma pasta a partir da barra lateral recolhida é reduzido para 1 único hover + 1 clique (menos de 1 segundo).
- **SC-003**: Zero ocorrências de corte de balão fora dos limites visíveis da janela em viewports padrão (>=768px de largura).
- **SC-004**: 100% dos alvos de clique na barra recolhida atingem a dimensão mínima recomendada de acessibilidade de 36x36px (padronizados em 40x40px).
- **SC-005**: O atraso de abertura e fechamento garante 0% de fechamentos indesejados durante o trajeto natural do cursor entre o ícone e o balão.

## Assumptions

- O componente utilizará as primitivas do Radix UI (`HoverCard` ou `Popover`) já existentes no repositório em `src/components/ui/`, sem instalação de novas dependências de pacotes.
- Quando a barra lateral for re-expandida (`isExpanded: true`), a exibição volta ao modo normal inline/acordeão sem os balões flutuantes de hover.
- As permissões e chamadas de API para criar, editar, arquivar e excluir projetos ou pastas continuam exatamente as mesmas já implementadas nos modais correspondentes.
