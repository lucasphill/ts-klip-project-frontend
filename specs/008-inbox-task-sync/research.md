# Technical Research: Sincronização Automática de Tarefas de Projetos no Inbox

**Feature**: `008-inbox-task-sync` | **Date**: 2026-08-23

## Executive Summary

Esta pesquisa diagnostica e define a solução técnica para garantir que tarefas criadas dentro de projetos (pela interface ou via agentes MCP externos) apareçam imediatamente e de forma consistente no Inbox ("Todas as Tarefas"), sem exigir recarregamento forçado da página pelo navegador (`F5`).

---

## Root Cause Analysis (Análise de Causa Raiz)

1. **Retenção de Cache Estático no `TasksContext.tsx`**:
   - O `fetchTasks` verificava `if (hasFetchedOnceRef.current && !shouldForce) return;`. Uma vez carregado no bootstrap do app, chamadas subsequentes de `fetchTasks()` em montagens de rota (como ao navegar para `HomePage`) retornavam imediatamente sem consultar a API.
2. **Desconexão de Estado em `ProjectsPage.tsx`**:
   - Ao salvar uma tarefa na tela de detalhes de um projeto (`handleSaveTask`), o componente atualizava apenas seu estado local `setTasks` e não notificava o `TasksContext` (`appendTask` ou `fetchTasks`), mantendo a lista global desatualizada.
3. **Mapeamento Tardio de Associações Projeto-Tarefa em `HomePage.tsx`**:
   - `loadProjectTaskAssignments` dependia de `projects` já carregados. Se novas tarefas ou projetos eram criados via MCP, a Home não forçava a busca fresca nem das tarefas (`GET /api/tasks/with-universal-custom-fields`) nem das associações (`GET /api/ProjectsTasks/project/{id}/tasks`).
4. **Ausência de Revalidação ao Focar a Janela (`window.onfocus`)**:
   - Como agentes MCP executam chamadas de API em segundo plano na mesma máquina, o frontend permanecia com dados antigos na tela até uma recarga manual completa.

---

## Key Decisions & Architecture

### 1. Invalidação e Atualização Ativa no `TasksContext`
- **Decision**: Permitir que montagens de páginas críticas (como `HomePage`) sempre busquem os dados mais recentes do servidor através de `fetchTasks({ force: true })`, mantendo a reatividade otimista para mutações locais.
- **Rationale**: Garante que qualquer tarefa criada fora do fluxo do componente atual (ex: MCP, outra aba ou tela de projeto) seja refletida imediatamente.

### 2. Integração Bidirecional em `ProjectsPage.tsx`
- **Decision**: No método `handleSaveTask` de `ProjectsPage.tsx`, invocar `appendTask` / `updateTaskLocal` ou `fetchTasks({ force: true })` do `TasksContext`, além de atualizar o estado local da página do projeto.
- **Rationale**: Garante sincronia instantânea entre o contexto global e a visão isolada do projeto.

### 3. Revalidação em Foco de Janela e Visibilidade
- **Decision**: Adicionar listener de `window.addEventListener('focus')` e `document.addEventListener('visibilitychange')` na `HomePage` com debounce para revalidar tarefas e projetos suavemente quando o usuário retorna à aplicação.
- **Rationale**: É o padrão adotado por bibliotecas modernas (como TanStack Query e SWR) para refletir mutações ocorridas externamente (ex: MCP tool executions).

---

## Alternatives Considered

- *Long Polling / WebSockets contínuos*: Rejeitado por adicionar complexidade desnecessária de infraestrutura no backend, visto que a revalidação inteligente em montagem de página e foco de janela resolve 100% do problema com consumo mínimo de recursos.
- *Remover todo o cache do `TasksContext`*: Rejeitado para evitar renderizações em branco durante navegação rápida; a busca em background com atualização de estado preserva a fluidez da UI.
