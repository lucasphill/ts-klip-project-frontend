# Quickstart & Validation Guide: Sincronização de Tarefas de Projetos no Inbox

**Feature**: `008-inbox-task-sync` | **Date**: 2026-08-23

## Pré-requisitos e Configuração

1. Backend em execução local na porta 5145 (`http://localhost:5145`).
2. Frontend em execução local na porta 5173 (`http://localhost:5173`).
3. Credenciais de teste:
   - **E-mail**: `teste@email.com`
   - **Senha**: `o#mUN9WMKps7rtCGclNu`

---

## Cenários de Teste Ponta a Ponta

### Cenário 1: Criar Tarefa em um Projeto via UI e Verificar no Inbox
1. Abra a aplicação no navegador e faça login.
2. Crie ou selecione um projeto existente na barra lateral (ex: "Projeto Comercial").
3. Dentro da página do projeto, clique em "Adicionar tarefa" e crie uma tarefa com título "Elaborar Proposta Comercial".
4. Verifique que a tarefa aparece na tabela do projeto.
5. Clique em "Inbox" na barra lateral para navegar para a Home.
6. Verifique que a tarefa "Elaborar Proposta Comercial" aparece imediatamente na lista do Inbox com a badge do "Projeto Comercial", sem necessidade de recarregar a página (`F5`).

### Cenário 2: Criar Projeto e Tarefa via MCP / API e Verificar no Inbox
1. Com a tela do Inbox aberta no navegador, use o MCP para criar um projeto "Projeto MCP Test" e em seguida criar uma tarefa "Tarefa criada via MCP" vinculada a esse projeto.
2. Alterne de volta para a aba do navegador ou clique em "Inbox".
3. Verifique que o Inbox revalida e exibe a "Tarefa criada via MCP" com a badge "Projeto MCP Test" automaticamente.

### Cenário 3: Exclusão / Edição de Tarefa em Projeto Refletida no Inbox
1. Acesse o projeto, edite o título da tarefa ou conclua-a.
2. Navegue até o Inbox e confirme que a alteração está 100% sincronizada.
