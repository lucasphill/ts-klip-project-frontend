# Research & Architecture Decisions: Refatoração da Barra Lateral e Modal de Grupos de Projetos

**Feature**: Refatoração da Barra Lateral e Ajuste no Modal de Grupos de Projetos
**Branch**: `011-sidebar-projects-refactor`
**Date**: 2026-08-25

---

## 1. Reorganização Estrutural da Barra Lateral (`Sidebar.tsx`)

### Contexto
Atualmente, a seção de projetos na barra lateral (`Sidebar.tsx`) renderiza o título `"Projetos & Pastas"`, seguido do campo de busca, da listagem de grupos de projetos (`projectGroups`) e, por fim, dos projetos sem pasta (`rootProjects`) precedidos pelo cabeçalho textual `"Sem pasta"`.

### Decisão
1. **Título da Seção**: Alterar o texto de `"Projetos & Pastas"` para `"PROJETOS"` (preservando o estilo em caixa alta `uppercase tracking-widest text-[10px] font-semibold text-[var(--text-faint)]`).
2. **Campo de Busca**: Manter inalterado em posição (logo abaixo do título) e comportamento.
3. **Ordem de Renderização**:
   - `rootProjects` (projetos raiz / sem pasta) renderizados imediatamente abaixo do campo de busca.
   - `projectGroups` (pastas e seus respectivos projetos aninhados) renderizados abaixo de `rootProjects`.
4. **Remoção do Rótulo "Sem pasta"**: Excluir a condicional e o elemento `<p>Sem pasta</p>`.

### Alternativas Consideradas
- *Criar um acordeão expansível para os projetos raiz*: Rejeitado porque os projetos raiz devem ficar imediatamente acessíveis sem cliques adicionais.
- *Manter um divisor sutil entre projetos e pastas*: Rejeitado para atender ao requisito de interface mais limpa e minimalista; o próprio ícone de pasta e recuo de itens fornecem a hierarquia visual natural.

---

## 2. Padronização do Destaque do Projeto Ativo (`activeTab === project.id`)

### Contexto
Os itens de navegação principais (`Inbox` e `Calendário` via `NavItem.tsx`) usam `bg-[var(--bg-soft-strong)] text-[var(--text-primary)]` com bordas arredondadas (`rounded-lg`) quando ativos. Em contraste, os links de projetos em `Sidebar.tsx` alteravam a cor do texto para azul (`text-[var(--brand)] font-medium`) com fundo hover padrão.

### Decisão
Padronizar os projetos ativos (tanto raiz quanto dentro de pastas) para usarem:
- **Container Ativo**: `bg-[var(--bg-soft-strong)] text-[var(--text-primary)] rounded-lg`
- **Container Inativo**: `text-[var(--text-secondary)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)] rounded-lg`
- **Texto do Nome do Projeto**: Manter `text-[var(--text-primary)]` quando ativo (eliminar `text-[var(--brand)]`), garantindo que o destaque seja exclusivamente o preenchimento suave do container.

### Alternativas Consideradas
- *Adicionar barra lateral colorida (borda esquerda)*: Rejeitado para manter paridade exata com o padrão existente de `NavItem`.

---

## 3. Correção de Layout da Grade de Ícones no Modal (`AddProjectGroupModal.tsx`)

### Contexto
O componente `AddProjectGroupModal.tsx` utilizava `className="grid grid-cols-6 gap-2 sm:grid-cols-11"` para exibir os 11 ícones predefinidos (`PRESET_ICONS`). Com a largura do modal `w-[min(100%-1.5rem,36rem)]` e padding interno, a divisão em 11 colunas forçava os botões a encolherem abaixo de 36px ou sobreporem suas bordas/anéis de foco.

### Decisão
Utilizar um container flexível com quebra de linha `flex flex-wrap gap-2` ou grade com número moderado de colunas (`grid grid-cols-6 sm:grid-cols-8 gap-2`), garantindo botões de tamanho fixo `h-9 w-9 shrink-0` com `rounded-lg` e `flex items-center justify-center`.

### Alternativas Consideradas
- *Carrossel horizontal de ícones*: Rejeitado porque adicionaria complexidade desnecessária para apenas 11 ícones.
- *Select dropdown de ícones*: Rejeitado porque a grade visual permite visualização direta e rápida de todas as opções de uma vez.
