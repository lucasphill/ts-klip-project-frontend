# Technical Research: Organização, Agrupamento e Ciclo de Vida de Projetos

**Feature**: `007-project-organization-lifecycle` | **Date**: 2026-08-23

## Executive Summary

Esta pesquisa estabelece a arquitetura e os padrões técnicos para o frontend do Klip implementar o agrupamento de projetos em pastas/grupos (`ProjectGroups`), o arquivamento/desarquivamento reversível de projetos e a exclusão segura com política configurável de tarefas (`deleteTasks=true/false`).

---

## Key Decisions & Technical Findings

### 1. Modelagem de Estado e Gerenciamento de Grupos (`ProjectsContext`)

- **Decision**: Centralizar o estado dos grupos de projetos (`projectGroups`), projetos ativos (`projects`) e projetos arquivados (`archivedProjects`) dentro do `ProjectsContext`, expondo métodos unificados para CRUD de grupos, reordenação, arquivamento e exclusão com políticas.
- **Rationale**:
  - A barra lateral (`Sidebar.tsx`), modais de criação/edição de projetos (`AddProjectModal.tsx`), páginas de projetos (`ProjectsPage.tsx`) e a Home compartilham e reagem diretamente às mudanças na árvore de projetos e grupos.
  - Manter `projectGroups` junto com `projects` no mesmo contexto evita estados inconsistentes (ex: excluir um grupo precisa atualizar instantaneamente a lista de projetos associados, desvinculando-os localmente para a raiz).
- **Alternatives Considered**:
  - *Criar um `ProjectGroupsContext` isolado*: Rejeitado porque a relação entre grupos e projetos é bidirecional na visualização (projetos pertencem a grupos) e causaria acoplamento desnecessário e renderizações redundantes entre múltiplos providers.

---

### 2. Interface da Barra Lateral e Navegação Hierárquica (`Sidebar.tsx`)

- **Decision**:
  - Estruturar a lista de projetos em:
    1. **Grupos Colapsáveis/Expansíveis**: Cada grupo possui ícone, cor identificadora, nome, contagem de projetos e menu de ações rápidas (Criar projeto dentro do grupo, Editar grupo, Excluir grupo). O estado de expansão/colapso é mantido localmente com persistência em `localStorage`.
    2. **Projetos Raiz (Sem Grupo)**: Projetos com `groupId == null` são renderizados em uma seção limpa diretamente abaixo dos grupos.
    3. **Ações de Projeto**: Cada item de projeto possui menu de ações rápidas (Editar, Arquivar, Excluir).
    4. **Acesso aos Arquivados**: Botão/link discreto no rodapé da seção de projetos ("Projetos arquivados") que abre a visualização/modal de projetos arquivados.
  - A barra de busca de projetos filtra tanto projetos em pastas quanto na raiz, expandindo automaticamente grupos com resultados correspondentes.
- **Rationale**:
  - Oferece ergonomia máxima e facilidade de localização visual mantendo o design minimalista do Klip.
- **Alternatives Considered**:
  - *Pastas multinível*: Rejeitado por estar fora de escopo (backend suporta 1 nível de agrupamento) e por adicionar complexidade visual desnecessária.

---

### 3. Modal de Exclusão Segura com Política de Tarefas (`DeleteProjectModal.tsx`)

- **Decision**: Criar um componente modal dedicado `DeleteProjectModal.tsx` espelhando o padrão já validado no `DeleteTaskModal.tsx`.
  - O modal apresenta duas opções claras:
    - `deleteTasks = false` (Padrão e Recomendado): **"Excluir apenas o projeto e manter tarefas"** (desvincula tarefas mantendo-as como avulsas na Inbox/Home).
    - `deleteTasks = true` (Ação Crítica/Cascata): **"Excluir projeto e todas as suas tarefas"** (remove projeto e todas as tarefas e integrações em cascata).
- **Rationale**:
  - Previne perdas acidentais de dados e atende rigorosamente ao critério de segurança e clareza da especificação.
- **Alternatives Considered**:
  - *Usar `window.confirm` nativo*: Rejeitado por não permitir escolha de estratégia nem fornecer acessibilidade e design consistentes com o sistema de design do Klip.

---

### 4. Ciclo de Vida de Arquivamento e Desarquivamento (`ArchivedProjectsModal.tsx`)

- **Decision**:
  - Fornecer um modal/painel acessível `ArchivedProjectsModal.tsx` listando todos os projetos retornados por `GET /api/projects?archived=true`.
  - Cada item exibe nome, cor, data de arquivamento (`archivedAt`), e botões de ação:
    - **Desarquivar** (`PATCH /api/projects/{id}/unarchive`): Restaura o projeto ao estado ativo instantaneamente na barra lateral e recarrega as listas locais.
    - **Excluir**: Aciona o `DeleteProjectModal` para permitir exclusão definitiva.
  - Quando um projeto ativo é arquivado através da barra lateral ou da página do projeto, ele é marcado como `isArchived = true`, removido da lista ativa local e suas tarefas deixam de ser listadas na Home.
- **Rationale**:
  - Mantém o histórico completo acessível sem poluir a navegação ativa.

---

### 5. Contratos de API Centralizados (`src/services/api.ts`)

- **Decision**:
  - Adicionar o objeto de serviço `projectGroupsApi`:
    - `getAll`: `GET /ProjectGroups`
    - `create`: `POST /ProjectGroups`
    - `update`: `PUT /ProjectGroups/${id}`
    - `remove`: `DELETE /ProjectGroups/${id}`
    - `reorder`: `PUT /ProjectGroups/reorder`
  - Atualizar `projectsApi`:
    - `getAll`: aceita parâmetro `{ archived?: boolean }`
    - `archive`: `PATCH /Projects/${projectId}/archive`
    - `unarchive`: `PATCH /Projects/${projectId}/unarchive`
    - `remove`: `DELETE /Projects/${projectId}` aceitando `{ deleteTasks?: boolean }`
- **Rationale**:
  - Total conformidade com a convenção do projeto de centralizar chamadas HTTP em `src/services/api.ts` com tipagem forte em `src/types/apiTypes.ts`.

---

## Best Practices & Patterns

1. **Acessibilidade & Feedback**: Todos os modais utilizam componentes Radix/shadcn (`Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`) com foco automático, navegação por teclado (`Escape` para fechar, `Tab` para ciclar) e estados visuais de carregamento (`Loader2` / `isSubmitting`).
2. **Atualização Otimista e Resiliente**: Atualizações locais do `ProjectsContext` refletem mutações instantaneamente, revertendo o estado em caso de falha de rede e notificando via `sonner` (`toast.error`).
3. **Consistência Visual**: Uso das variáveis CSS de tema (`var(--brand)`, `var(--bg-panel)`, `var(--border-subtle)`, `var(--text-primary)`, `var(--text-muted)`) garantindo suporte automático aos modos claro e escuro.
