# Phase 0: Research & Technical Analysis

**Feature**: Botão de Criação de Projetos e Pastas na Barra Lateral Colapsada
**Branch**: `014-collapsed-sidebar-add-project`
**Date**: 2026-08-29

## 1. Technical Context & Decisions

### Decision 1: Componente de Flyout / Balão Flutuante
- **Decision**: Reutilizar o componente `HoverCard` (`@radix-ui/react-hover-card` configurado em `src/components/ui/hover-card.tsx`).
- **Rationale**: Já é o padrão estabelecido em toda a barra lateral colapsada para projetos e pastas, garantindo consistência visual de transição, atrasos padronizados (`openDelay={150}`, `closeDelay={120}`) e sem necessidade de novas dependências.
- **Alternatives Considered**:
  - `Popover`: Exige clique explícito para abrir o menu em vez de preview rápido ao passar o mouse.
  - Tooltip simples: Não permitiria renderizar múltiplos botões clicáveis interativos dentro do balão.

### Decision 2: Ação do Clique Principal vs. Opções no Balão
- **Decision**:
  - Clique direto no botão principal dispara `setShowNewProjectModal(true)` (ação mais comum e esperada).
  - HoverCard exibe 2 botões de ação verticalizados: "Novo projeto" (abre `AddProjectModal`) e "Nova pasta" (abre `AddProjectGroupModal`).
- **Rationale**: Permite máxima velocidade para o fluxo mais frequente (1 clique direto no ícone `+`), ao mesmo tempo em que oferece acesso direto à criação de pastas no modo colapsado via menu flutuante.
- **Alternatives Considered**:
  - Clique direto não fazer nada além de abrir o balão: Adiciona fricção e atraso desnecessário para o usuário.

### Decision 3: Posicionamento no DOM da Barra Lateral
- **Decision**: Inserir o botão imediatamente no topo da seção de projetos (`div className="space-y-1.5"` em `Sidebar.tsx`), condicional ou estilizado especificamente para a renderização compacta (`!isExpanded`), posicionado entre os links de navegação fixa (`/`, `/calendar`) e a lista de projetos raiz.
- **Rationale**: Atende exatamente ao alinhamento com o usuário (acima do primeiro projeto e abaixo do calendário), mantendo clara a separação de escopo entre navegação global e gerenciamento de projetos.
- **Alternatives Considered**:
  - Colocar ao final da barra: Rejeitado pelo usuário durante a fase de alinhamento.
