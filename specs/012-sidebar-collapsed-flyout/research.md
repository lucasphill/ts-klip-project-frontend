# Research & Architecture Decisions: Menu Flutuante (Flyout) e Ergonomia da Barra Lateral Recolhida

**Feature**: Menu Flutuante (Flyout) e Ergonomia da Barra Lateral Recolhida
**Branch**: `012-sidebar-collapsed-flyout`
**Date**: 2026-08-25

---

## 1. Escolha da Primitiva de UI para o Flyout

### Contexto
Quando a barra lateral é recolhida, os usuários precisam visualizar informações de pastas e projetos raiz ao passar o cursor (hover) e interagir com subitens (projetos e ações) sem que a barra inteira precise ser expandida.

### Decisão
Utilizar o componente `HoverCard` (`HoverCard`, `HoverCardTrigger`, `HoverCardContent`) do Radix UI já disponível em `@/components/ui/hover-card`.

### Justificativa
- **Zero novas dependências**: Evita a instalação do pacote pesado do Ant Design (`antd`), mantendo o bundle enxuto e sem conflitos de estilização CSS.
- **Tolerância de Mouse**: O Radix `HoverCard` suporta nativamente `openDelay` (150ms) e `closeDelay` (120ms), o que cria a "área de ponte invisível" permitindo que o usuário deslize o cursor do ícone para dentro do balão sem fechamento acidental.
- **Detecção de Colisão**: Suporta posicionamento automático inteligente (`side="right"`, `align="start"`, `collisionPadding=8`), evitando que o balão seja cortado nas bordas da janela.

### Alternativas Consideradas
- *Ant Design Menu / Sider*: Rejeitado por adicionar mais de 1MB ao bundle, criar duplicidade de design system e potencial incompatibilidade com React 19.
- *Radix Popover*: Rejeitado para o disparo principal porque o Popover requer clique para abrir, enquanto o requisito primário do usuário é a visualização rápida no hover (com fixação opcional).
- *CSS `:hover` puro*: Rejeitado por ter sérias limitações de posicionamento absoluto com overflow, sem detecção de colisão de tela e com fechamento instável ao mover o cursor.

---

## 2. Ergonomia dos Alvos de Toque na Barra Lateral Recolhida

### Contexto
Atualmente, no modo recolhido, projetos raiz são apenas pontinhos (`h-2 w-2`) e pastas são ícones sem container visual definido, o que dificulta o clique e a interação.

### Decisão
Padronizar todos os botões de itens no modo recolhido com dimensões `h-10 w-10` (`40x40px`), formato arredondado (`rounded-lg`) e centralizados:
- **Pastas**: Botão `h-10 w-10` com ícone centralizado `16x16px` na cor da pasta.
- **Projetos Raiz**: Botão `h-10 w-10` com ponto colorido centralizado `h-2.5 w-2.5`.
- **Estado Ativo**: `bg-[var(--bg-soft-strong)] text-[var(--text-primary)]`.
- **Estado Hover**: `hover:bg-[var(--bg-soft)]`.

---

## 3. Conteúdo e Layout do Balão Flutuante (Flyout)

### Estrutura do Flyout de Pasta (`ProjectGroup`)
1. **Cabeçalho**:
   - Ícone e Nome do Grupo em destaque.
   - Badge com a contagem de projetos.
   - Botões de ação rápida no cabeçalho: `+` Adicionar projeto nesta pasta, Editar pasta, Excluir pasta.
2. **Divisor**: Linha sutil de separação.
3. **Corpo / Lista de Projetos**:
   - Lista vertical de projetos com indicador de cor e nome legível.
   - Destaque no projeto atualmente ativo (`bg-[var(--bg-soft-strong)]`).
   - Rolagem interna suave (`max-h-56 overflow-y-auto`) quando houver muitos projetos.
   - Estado "Pasta vazia" com botão de criação quando não houver projetos.

### Estrutura do Flyout de Projeto Raiz (`rootProject`)
1. **Identificação**: Ponto colorido e Nome completo do projeto.
2. **Ações**: Botões de ação rápida (Editar projeto, Arquivar projeto, Excluir projeto).
3. **Navegação**: Clique direto no botão disparador ou no balão navega para a rota `/project/:id`.
