# Feature Specification: Organização, Agrupamento e Ciclo de Vida de Projetos

**Feature Branch**: `007-project-organization-lifecycle`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "a api está sendo executada localmente na porta 5145/scalar. foram adicionados novas features de organização de projetos por grupos além da exclusão dos projetos, arquivamento e eclusão das tarefas. verifique a especificação em D:\Dev\cs-project-klip-backend\specs\008-project-organization-lifecycle. crie uma specificação apra implementação do controle de projetos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Organização de Projetos em Grupos / Pastas (Priority: P1)

Como usuário com múltiplos projetos no Klip, quero organizar e agrupar meus projetos em pastas/grupos customizados (com nome, cor e ícone) na barra lateral de navegação, para manter meu espaço de trabalho organizado e encontrar rapidamente os projetos relevantes.

**Why this priority**: É a funcionalidade central de organização requerida para evitar sobrecarga visual quando o usuário acumula dezenas de projetos ativos.

**Independent Test**: Pode ser testado criando novos grupos, associando projetos novos ou existentes a esses grupos, colapsando/expandindo grupos na barra lateral e verificando a persistência e correta exibição dos projetos dentro de suas respectivas pastas.

**Acceptance Scenarios**:

1. **Given** que o usuário está na interface principal, **When** ele clica na opção para criar um novo grupo de projetos informando nome (obrigatório), cor e ícone (opcionais), **Then** o novo grupo é criado e passa a ser exibido na lista de grupos na barra lateral.
2. **Given** que o usuário possui grupos existentes, **When** ele cria um novo projeto ou edita um existente e seleciona um grupo de destino, **Then** o projeto é posicionado dentro daquele grupo na barra lateral.
3. **Given** que um projeto está associado a um grupo, **When** o usuário opta por remover o projeto do grupo (movendo para a raiz), **Then** o projeto volta a ser exibido no nível raiz da lista de projetos sem pertencer a nenhuma pasta.
4. **Given** que o usuário possui múltiplos grupos, **When** ele reordena a ordem dos grupos na navegação, **Then** a nova ordem é salva e preservada em sessões posteriores.
5. **Given** que um grupo contém projetos e o usuário solicita a exclusão do grupo, **When** a exclusão é confirmada, **Then** o grupo é excluído e todos os seus projetos são desvinculados com segurança para o nível raiz, sem perder nenhum projeto ou tarefa.

---

### User Story 2 - Arquivamento e Desarquivamento Reversível de Projetos (Priority: P2)

Como usuário que concluiu ou pausou um projeto, quero arquivá-lo para que ele não polua minha lista de projetos ativos e nem exiba suas tarefas na visualização diária da Home, mantendo a capacidade de consultar e desarquivar o projeto a qualquer momento.

**Why this priority**: Permite manter o histórico completo de projetos finalizados sem sobrecarregar a rotina operacional diária.

**Independent Test**: Pode ser testado arquivando um projeto com tarefas ativas, verificando se ele desaparece da navegação ativa e suas tarefas somem da Home, e em seguida acessando a seção de Projetos Arquivados para desarquivá-lo e confirmar que o projeto e tarefas retornam ao estado ativo original.

**Acceptance Scenarios**:

1. **Given** que o usuário visualiza um projeto ativo, **When** ele aciona a ação "Arquivar projeto" e confirma, **Then** o projeto é marcado como arquivado e removido imediatamente da lista ativa da barra lateral.
2. **Given** que um projeto foi arquivado, **When** o usuário acessa a visualização da Home ("Inbox / Todas as Tarefas"), **Then** as tarefas pertencentes ao projeto arquivado não são exibidas por padrão.
3. **Given** que o usuário acessa a área/seção de projetos arquivados, **When** ele visualiza a listagem, **Then** todos os projetos arquivados são exibidos com suas informações e data de arquivamento.
4. **Given** que o usuário localiza um projeto arquivado, **When** ele clica em "Desarquivar", **Then** o projeto retorna para a lista ativa da barra lateral (em sua pasta original ou na raiz) e suas tarefas voltam a ser exibidas na Home.

---

### User Story 3 - Exclusão Segura de Projetos com Escolha de Política de Tarefas (Priority: P3)

Como usuário que deseja remover definitivamente um projeto, quero escolher expressamente se as tarefas vinculadas a ele devem ser preservadas como tarefas avulsas ou excluídas definitivamente em cascata, para evitar perdas acidentais de dados.

**Why this priority**: Garante proteção de dados e dá controle total ao usuário sobre o destino das suas tarefas ao descartar um projeto.

**Independent Test**: Pode ser testado excluindo um projeto com a opção "Preservar tarefas" e verificando que as tarefas continuam existindo na Inbox/Home sem vínculo a projeto; e depois excluindo outro projeto com a opção "Excluir tarefas em cascata", verificando que tarefas e integrações associadas são excluídas definitivamente.

**Acceptance Scenarios**:

1. **Given** que o usuário solicita a exclusão de um projeto contendo tarefas, **When** o modal de confirmação é aberto, **Then** o sistema apresenta com clareza as duas opções: "Excluir apenas o projeto (manter tarefas)" e "Excluir projeto e todas as suas tarefas".
2. **Given** que o usuário seleciona "Excluir apenas o projeto (manter tarefas)" e confirma, **Then** o projeto é excluído permanentemente e suas tarefas permanecem disponíveis na lista geral como tarefas avulsas (sem projeto).
3. **Given** que o usuário seleciona "Excluir projeto e todas as suas tarefas" e confirma explicitamente a ação destrutiva, **Then** o projeto e todas as suas tarefas vinculadas são excluídos permanentemente.

---

### Edge Cases

- O que acontece se o usuário tentar criar um grupo sem preencher o nome? O sistema valida o formulário no cliente, destacando o campo obrigatório e impedindo o envio com mensagem clara.
- O que acontece se um grupo excluído não possuir nenhum projeto? O grupo é excluído instantaneamente sem impacto na listagem de projetos.
- O que acontece quando o usuário pesquisa projetos na barra lateral enquanto há grupos colapsados? A busca filtra projetos correspondentes e expande automaticamente os grupos que contêm os projetos encontrados ou exibe os resultados com destaque de seu respectivo grupo.
- O que acontece se um projeto arquivado for excluído? O modal de confirmação de exclusão (com opção de tarefas) é exibido normalmente, permitindo a exclusão definitiva a partir da visualização de arquivados.
- O que acontece quando uma falha de rede ocorre durante o arquivamento, desarquivamento ou exclusão? O sistema exibe notificação de erro compreensível e reverte o estado visual da interface para evitar inconsistências locais.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir ao usuário criar, editar (nome, cor, ícone) e excluir grupos de projetos.
- **FR-002**: A exclusão de um grupo de projetos NUNCA deve apagar os projetos contidos nele; os projetos vinculados DEVEM ser automaticamente realocados para o nível raiz (sem grupo).
- **FR-003**: O sistema DEVE permitir ordenar/reordenar grupos de projetos na barra lateral de navegação.
- **FR-004**: O sistema DEVE permitir atribuir um projeto a um grupo específico ou mantê-lo na raiz durante a criação e edição do projeto.
- **FR-005**: A barra lateral DEVE exibir os grupos de projetos com capacidade de expandir/recolher seus itens, exibindo a contagem ou lista dos projetos de cada pasta.
- **FR-006**: O sistema DEVE disponibilizar ação de arquivamento para qualquer projeto ativo, alterando seu estado e removendo-o da listagem ativa.
- **FR-007**: O sistema DEVE fornecer uma visão/seção dedicada para acesso aos projetos arquivados, permitindo visualizar seus detalhes, desarquivá-los ou excluí-los.
- **FR-008**: As tarefas associadas a projetos arquivados NÃO DEVEM ser exibidas por padrão na visualização principal da Home (Inbox de tarefas), a menos que o usuário ative explicitamente um filtro de arquivados.
- **FR-009**: O sistema DEVE disponibilizar ação de desarquivamento que restaura imediatamente o projeto e a visibilidade de suas tarefas no estado ativo.
- **FR-010**: Ao solicitar a exclusão de um projeto, o sistema DEVE abrir um diálogo de confirmação obrigando o usuário a escolher entre:
  - (a) Manter tarefas (desvincular e torná-las avulsas);
  - (b) Excluir projeto juntamente com todas as tarefas associadas (exclusão em cascata).
- **FR-011**: O sistema DEVE atualizar em tempo real o estado local da aplicação e das listas ao concluir com sucesso qualquer operação de grupo, arquivamento ou exclusão.
- **FR-012**: O campo de busca de projetos na barra lateral DEVE permitir filtrar projetos tanto localizados na raiz quanto dentro de grupos.

---

### Key Entities *(include if feature involves data)*

- **Grupo de Projetos (Project Group)**: Representa uma pasta ou categoria organizadora de projetos pertencente ao usuário. Possui identificador único, nome, cor representativa, ícone opcional, índice de ordenação e a lista de projetos associados.
- **Projeto (Project)**: Representa a entidade de projeto no Klip. Além de nome, descrição e cor, agora possui referência opcional ao Grupo de Projetos (`groupId`), status booleano de arquivamento (`isArchived`) e data/hora do arquivamento (`archivedAt`).
- **Tarefa (Task)**: Unidade de trabalho que pode estar vinculada a projetos. Quando o projeto é arquivado, as tarefas são ocultadas das visões agregadas ativas; quando o projeto é excluído sem cascata, as tarefas são preservadas sem vínculo de projeto.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários conseguem criar uma pasta/grupo e organizar projetos dentro dela em menos de 15 segundos.
- **SC-002**: 100% das exclusões de projetos exigem confirmação explícita sobre o destino das tarefas, resultando em 0% de perda acidental involuntária de tarefas.
- **SC-003**: Projetos arquivados deixam de poluir a barra lateral ativa e reduzem o ruído visual das tarefas na Home para 0 tarefas arquivadas por padrão.
- **SC-004**: Desarquivar um projeto restaura o projeto e a visualização de suas tarefas na navegação com atualização instantânea na interface.
- **SC-005**: Todas as operações de grupos e projetos fornecem retorno visual imediato (feedback de carregamento e notificações de sucesso/erro).

---

## Assumptions

- A API backend já disponibiliza os endpoints de grupos de projetos (`/api/project-groups`), arquivamento/desarquivamento (`/api/projects/{id}/archive`, `/api/projects/{id}/unarchive`) e exclusão parametrizada (`/api/projects/{id}?deleteTasks=...`).
- Grupos de projetos possuem nível único de aninhamento (grupos contêm projetos; não há suporte para pastas dentro de pastas/sub-pastas aninhadas).
- Cada projeto pode pertencer a no máximo um grupo por vez ou permanecer na raiz (sem grupo).
- A interface segue a paleta de cores, componentes acessíveis e convenções de design existentes do Klip (Tailwind CSS, shadcn/ui, temas claro/escuro).
- O comportamento padrão de exclusão de projeto, caso o usuário não selecione a opção em cascata, é preservar todas as tarefas desvinculando-as.
