# Quickstart & Validation Guide: Organização, Agrupamento e Ciclo de Vida de Projetos

**Feature**: `007-project-organization-lifecycle` | **Date**: 2026-08-23

## Pré-requisitos e Configuração

1. Backend em execução local (ex: `http://localhost:5145` ou conforme variável `VITE_API_BASE_URL`).
2. Frontend em execução local:
   ```bash
   npm run dev
   ```
3. Credenciais de teste:
   - **E-mail**: `teste@email.com`
   - **Senha**: `o#mUN9WMKps7rtCGclNu`

---

## Cenários de Validação End-to-End

### Cenário 1: Criar e Gerenciar Grupos/Pastas de Projetos
1. Faça login na aplicação e visualize a barra lateral.
2. Clique no botão de criar grupo de projetos (+ ao lado de Grupos/Pastas).
3. Preencha o nome ("Trabalho"), escolha uma cor e um ícone, e clique em "Criar grupo".
4. Verifique que o novo grupo aparece na barra lateral como uma seção colapsável.
5. Clique no menu do grupo e selecione "Editar grupo", alterando o nome para "Trabalho & Clientes" e salvando.
6. Verifique a atualização imediata do nome na barra lateral.

### Cenário 2: Atribuir e Mover Projetos entre Grupos e Raiz
1. Clique em "Novo projeto", defina o nome "Projeto Alfa" e selecione o grupo "Trabalho & Clientes".
2. Verifique que o "Projeto Alfa" é listado dentro da pasta "Trabalho & Clientes" quando expandida.
3. Crie um segundo projeto "Projeto Beta" selecionando "Nenhum (Raiz)".
4. Verifique que "Projeto Beta" aparece na seção raiz (fora de qualquer pasta).
5. Edite o "Projeto Beta" e altere seu grupo para "Trabalho & Clientes".
6. Verifique que "Projeto Beta" agora aparece dentro do grupo.

### Cenário 3: Excluir Grupo com Segurança (Projetos Mantidos na Raiz)
1. Certifique-se de que o grupo "Trabalho & Clientes" contém os projetos "Projeto Alfa" e "Projeto Beta".
2. No menu do grupo, selecione "Excluir grupo".
3. Confirme o diálogo de confirmação informando que os projetos serão mantidos na raiz.
4. Verifique que o grupo é removido e os dois projetos ("Projeto Alfa" e "Projeto Beta") continuam existindo e são exibidos na raiz.

### Cenário 4: Arquivamento e Desarquivamento de Projeto
1. Crie tarefas dentro do "Projeto Alfa".
2. Acesse a Home ("Inbox / Todas as Tarefas") e verifique que as tarefas do "Projeto Alfa" estão visíveis.
3. No menu do "Projeto Alfa" na barra lateral, selecione "Arquivar projeto" e confirme.
4. Verifique que o "Projeto Alfa" desaparece da lista ativa da barra lateral e suas tarefas deixam de aparecer na Home.
5. Abra o modal/seção "Projetos arquivados" no rodapé da barra lateral.
6. Verifique que o "Projeto Alfa" está listado com sua data de arquivamento.
7. Clique em "Desarquivar" no "Projeto Alfa".
8. Verifique que o projeto reaparece imediatamente na barra lateral ativa e suas tarefas retornam à Home.

### Cenário 5: Exclusão Segura com Política de Tarefas
1. Crie um projeto "Projeto Descarte 1" com 2 tarefas.
2. Clique em "Excluir projeto", selecione **"Excluir apenas o projeto e manter tarefas"** (`deleteTasks=false`) e confirme.
3. Verifique que o projeto foi excluído, mas suas 2 tarefas continuam existindo na Inbox/Home como tarefas avulsas.
4. Crie outro projeto "Projeto Descarte 2" com 2 tarefas.
5. Clique em "Excluir projeto", selecione **"Excluir projeto e todas as suas tarefas"** (`deleteTasks=true`) e confirme.
6. Verifique que tanto o projeto quanto as 2 tarefas foram excluídos definitivamente.
