# Feature Specification: Refatoração da Barra Lateral e Ajuste no Modal de Grupos de Projetos

**Feature Branch**: `011-sidebar-projects-refactor`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "precisamos refatorar o sidebar. o nome Projetos & Pastas deve se manter apenas Projetos. o campo de busca deve ser manter do jeito que está. as pastas criadas devem ficar abaixo das tarefas sem pasta. o titulo `Sem pasta` nao deve existir. no modal de criar um grupo de projetos deve verificar a lista de icones disponiveis pois estão sobrepostos. adicione ao spec que o destaque dos projetos na sidebar deve seguir o mesmo padrão dos itens inbox e calendário, apenas com preenchimento no fundo de bordars arredondadas e não modificando o texto para azul"

## Clarifications

### Session 2026-08-25
- Q: Como deve ser aplicado o destaque visual de item ativo quando o projeto selecionado estiver dentro de uma pasta (grupo) em comparação com um projeto solto na raiz? → A: Option A (Aplicar exatamente o mesmo preenchimento de fundo com bordas arredondadas `bg-[var(--bg-soft-strong)]` e cor de texto padrão `text-[var(--text-primary)]` para todos os projetos ativos, tanto na raiz quanto aninhados dentro de pastas, sem coloração azul no texto).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reorganização e Simplificação da Seção de Projetos na Barra Lateral (Priority: P1) 🎯 MVP

Como usuário do Klip, quero visualizar uma seção de "Projetos" simplificada na barra lateral, com os projetos individuais exibidos no topo e as pastas/grupos posicionados abaixo, sem rótulos intermediários desnecessários como "Sem pasta", para ter uma navegação mais direta e limpa.

**Why this priority**: Esta é a mudança estrutural primária solicitada para o layout de navegação da barra lateral, otimizando o fluxo diário de acesso a projetos e pastas.

**Independent Test**: Abrir a aplicação com projetos individuais (sem grupo) e grupos de projetos cadastrados; verificar que o título da seção exibe "Projetos", que o campo de busca permanece funcional e no mesmo local, que os projetos individuais aparecem logo abaixo da busca, que as pastas de projetos aparecem após os projetos individuais e que o texto "Sem pasta" não é renderizado.

**Acceptance Scenarios**:

1. **Given** um usuário logado com projetos sem pasta e pastas/grupos de projetos cadastrados, **When** a barra lateral expandida é renderizada, **Then** o cabeçalho da seção exibe apenas o texto "PROJETOS".
2. **Given** a barra lateral expandida, **When** o usuário visualiza a seção de projetos, **Then** o campo de busca de projetos é mantido com mesmo posicionamento, estilo e funcionalidade de filtro.
3. **Given** a listagem de projetos na barra lateral, **When** os itens são renderizados, **Then** os projetos sem pasta (raiz) aparecem primeiro, diretamente abaixo da busca, e as pastas/grupos aparecem ordenadamente abaixo dos projetos sem pasta.
4. **Given** a listagem de projetos sem pasta, **When** a seção é exibida, **Then** nenhum título, separador ou rótulo com o texto "Sem pasta" deve ser apresentado.

---

### User Story 2 - Padronização do Destaque do Projeto Ativo na Barra Lateral (Priority: P2)

Como usuário navegando entre projetos, quero que o projeto atualmente ativo na barra lateral seja destacado com preenchimento de fundo em tom suave e bordas arredondadas (idêntico ao padrão dos botões Inbox e Calendário), mantendo a cor de texto padrão legível sem modificar a tipografia para azul, tanto para projetos na raiz quanto para projetos dentro de pastas, para uma experiência visual coesa e elegante.

**Why this priority**: Harmoniza a consistência visual da navegação em toda a barra lateral, evitando discrepâncias onde alguns itens usavam texto colorido e outros usavam preenchimento de fundo.

**Independent Test**: Clicar em um projeto (seja ele raiz ou dentro de uma pasta) e verificar que o item selecionado recebe o preenchimento de fundo ativo com bordas arredondadas e texto na cor padrão de texto, sem coloração azul.

**Acceptance Scenarios**:

1. **Given** um usuário navegando na rota de um projeto (`/project/:id`), **When** o item correspondente do projeto é renderizado na barra lateral (seja ele raiz ou dentro de uma pasta/grupo), **Then** o container do projeto recebe preenchimento de fundo de item ativo com bordas arredondadas (`bg-[var(--bg-soft-strong)]`).
2. **Given** um projeto ativo na barra lateral, **When** seu nome e ícone/cor são exibidos, **Then** a cor do texto permanece na cor padrão do tema (`text-[var(--text-primary)]`), sem mudar para azul/brand.
3. **Given** a barra lateral em tema claro ou escuro, **When** um projeto é selecionado, **Then** o fundo ativo e a cor do texto respeitam as variáveis semânticas do tema para manter contraste e legibilidade ideais.

---

### User Story 3 - Correção da Grade de Ícones no Modal de Grupo de Projetos (Priority: P2)

Como usuário ao criar ou editar um grupo de projetos, quero que a lista de ícones predefinidos seja exibida de forma organizada, alinhada e sem sobreposição visual entre os botões de seleção, para que eu possa escolher o ícone desejado com clareza em qualquer tamanho de tela.

**Why this priority**: A sobreposição de ícones no modal prejudica a usabilidade e a estética da interface durante o fluxo de organização de grupos de projetos.

**Independent Test**: Abrir o modal "Novo grupo de projetos" ou "Editar grupo de projetos", inspecionar a seção de seleção de ícones em diferentes resoluções (incluindo telas menores e desktop) e verificar que cada botão de ícone possui espaçamento adequado, tamanho fixo proporcional e nenhuma sobreposição ou corte de bordas.

**Acceptance Scenarios**:

1. **Given** que o usuário clica no botão para criar ou editar um grupo de projetos, **When** o modal é aberto, **Then** todos os ícones disponíveis são exibidos em uma grade/flexbox organizada sem sobreposição de botões ou bordas cortadas.
2. **Given** a lista de ícones no modal, **When** o usuário clica ou navega via teclado em um ícone, **Then** o estado selecionado é exibido com destaque claro (borda e fundo ativos) sem desalinhar os ícones adjacentes.
3. **Given** diferentes larguras de viewport ou tamanhos de modal, **When** o modal é redimensionado, **Then** os itens de ícone quebram linhas de forma fluida mantendo o espaçamento uniforme.

---

### User Story 4 - Acessibilidade, Responsividade e Suporte a Temas (Priority: P3)

Como usuário que utiliza atalhos de teclado ou temas visuais (claro/escuro), quero que a barra lateral reorganizada e o seletor de ícones corrigido mantenham suporte completo a foco acessível, contraste legível e truncamento correto de textos longos.

**Why this priority**: Garante que as melhorias visuais respeitem os padrões de acessibilidade e consistência visual do projeto.

**Independent Test**: Navegar por teclado na barra lateral e no modal de grupos de projetos, alternar entre os temas claro e escuro, e testar com nomes longos de projetos/pastas para confirmar truncamento adequado sem quebra de layout.

**Acceptance Scenarios**:

1. **Given** navegação por teclado (`Tab`, `Shift+Tab`, `Enter`, `Space`), **When** o usuário percorre os projetos, pastas e seletor de ícones, **Then** todos os elementos interativos recebem anel de foco visível.
2. **Given** alternância entre modo claro e escuro, **When** a interface é renderizada, **Then** as cores de texto, fundos, bordas de pastas e botões de ícones mantêm contraste e legibilidade adequados.
3. **Given** projetos ou grupos com nomes muito longos, **When** renderizados na barra lateral, **Then** o texto é truncado com reticências (`truncate`) sem empurrar botões de ação para fora da tela.

---

### Edge Cases

- **Sem projetos cadastrados**: A seção "PROJETOS" continua exibindo os botões de ação ("Novo grupo", "Novo projeto") e a busca, exibindo estado vazio amigável quando nenhum projeto existir.
- **Apenas pastas cadastradas (sem projetos soltos)**: A barra lateral exibe diretamente as pastas cadastradas, sem espaços em branco ou divisores vazios no topo.
- **Apenas projetos soltos cadastrados (sem pastas)**: A barra lateral exibe os projetos diretamente, sem renderizar a seção de pastas.
- **Filtragem ativa na busca**: Quando o usuário digita no campo "Buscar projeto...", os projetos soltos e projetos dentro de pastas correspondentes continuam sendo filtrados e destacados em tempo real.
- **Telas com altura reduzida (`max-height: 600px`) ou barra lateral recolhida**: A barra lateral recolhida preserva os ícones e interações sem sobreposições ou quebras.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE renomear o título da seção na barra lateral expandida de "PROJETOS & PASTAS" para "PROJETOS".
- **FR-002**: O sistema DEVE manter o campo de busca de projetos ("Buscar projeto...") posicionado na seção de projetos com o mesmo estilo, ícone e comportamento de filtragem em tempo real.
- **FR-003**: O sistema DEVE renderizar os projetos raiz/individuais (projetos que não pertencem a nenhuma pasta/grupo) no topo da listagem de projetos, logo abaixo do campo de busca.
- **FR-004**: O sistema DEVE renderizar as pastas/grupos de projetos abaixo da lista de projetos raiz.
- **FR-005**: O sistema NÃO DEVE exibir nenhum cabeçalho, subtítulo ou rótulo com o texto "Sem pasta" para os projetos raiz.
- **FR-006**: O sistema DEVE exibir a lista de seleção de ícones no modal de grupo de projetos com disposição visual limpa e responsiva, eliminando sobreposições entre botões e garantindo espaçamento consistente (`gap`) e dimensões fixas uniformes.
- **FR-007**: O sistema DEVE permitir a seleção de qualquer ícone disponível com feedback visual claro de estado ativo/selecionado no modal de grupo de projetos.
- **FR-008**: O sistema DEVE manter todas as ações existentes de projetos e pastas (criar, editar, arquivar, excluir, expandir/recolher pastas) plenamente funcionais.
- **FR-009**: O sistema DEVE estilizar o destaque do projeto ativo na barra lateral seguindo o mesmo padrão dos itens principais de navegação (Inbox e Calendário), aplicando preenchimento de fundo com bordas arredondadas (`bg-[var(--bg-soft-strong)]`) e cor de texto padrão (`text-[var(--text-primary)]`), sem modificar a cor do texto para azul, tanto para projetos na raiz quanto para projetos aninhados em pastas.

### Key Entities

- **Projeto (`Project`)**: Entidade que representa um projeto de trabalho, podendo estar associado a um grupo de projetos (`project_group_id`) ou estar solto na raiz (`project_group_id: null`).
- **Grupo de Projetos (`ProjectGroup`)**: Entidade que agrupa múltiplos projetos relacionados em uma pasta nomeada com cor e ícone dedicados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O título da seção exibe "PROJETOS" em 100% dos estados da barra lateral expandida.
- **SC-002**: 100% dos projetos sem pasta aparecem visualmente antes das pastas de projetos na hierarquia vertical do sidebar.
- **SC-003**: O rótulo textual "Sem pasta" é 0% visível na interface do sidebar.
- **SC-004**: O projeto ativo na barra lateral utiliza preenchimento de fundo com bordas arredondadas e texto padrão, com 0% de ocorrência de texto azul/brand no título do projeto ativo (tanto para projetos raiz quanto para projetos dentro de pastas).
- **SC-005**: 100% dos ícones no modal de grupo de projetos são renderizados com zero sobreposição e targets de clique acessíveis (mínimo de 32x32px).
- **SC-006**: O tempo de resposta da busca e das interações de navegação permanece instantâneo (menos de 50ms).

## Assumptions

- O comportamento do backend e dos endpoints da API de projetos e grupos permanece inalterado.
- A ordenação relativa interna dos grupos e projetos (por ordem definida ou alfabética) é mantida.
- O campo de busca continuará pesquisando tanto em projetos raiz quanto em projetos pertencentes a pastas.
- O modal de criação de projeto (`AddProjectModal.tsx`) continua permitindo associar o projeto a uma pasta existente ou deixá-lo na raiz.
