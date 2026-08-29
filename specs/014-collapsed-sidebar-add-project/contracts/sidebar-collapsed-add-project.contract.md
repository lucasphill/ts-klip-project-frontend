# UI Contract: Botão de Criação na Barra Colapsada (`Sidebar.tsx`)

**Feature**: Botão de Criação de Projetos e Pastas na Barra Lateral Colapsada
**Branch**: `014-collapsed-sidebar-add-project`
**Date**: 2026-08-29

## 1. Contrato da Seção Colapsada de Criação

Quando `isExpanded === false`, renderizar no topo da seção de projetos:

```tsx
{!isExpanded && (
  <div className="flex justify-center w-full pb-1">
    <HoverCard openDelay={150} closeDelay={120}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={() => {
            setTargetGroupIdForNewProject(null);
            setProjectToEdit(null);
            setShowNewProjectModal(true);
          }}
          aria-label="Adicionar projeto ou pasta"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
        >
          <Plus size={16} />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="center"
        sideOffset={8}
        className="w-44 p-1.5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] shadow-xl rounded-xl space-y-0.5"
      >
        <button
          type="button"
          onClick={() => {
            setTargetGroupIdForNewProject(null);
            setProjectToEdit(null);
            setShowNewProjectModal(true);
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)] transition-colors text-left"
        >
          <Plus size={14} className="shrink-0 text-[var(--text-muted)]" />
          <span className="font-medium">Novo projeto</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setGroupToEdit(null);
            setShowNewGroupModal(true);
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)] transition-colors text-left"
        >
          <FolderPlus size={14} className="shrink-0 text-[var(--text-muted)]" />
          <span className="font-medium">Nova pasta</span>
        </button>
      </HoverCardContent>
    </HoverCard>
  </div>
)}
```

## 2. Garantias e Invariantes de Acessibilidade e Layout

1. **Invariante de Visibilidade**: Quando `isExpanded === true`, este elemento não é renderizado ou permanece oculto, pois o cabeçalho expandido já contém os botões `FolderPlus` e `Plus`.
2. **Invariante de Responsividade**: Em mobile/sheet (onde a barra abre sempre expandida), a visualização expandida prevalece.
3. **Invariante de Cores**: O HoverCard utiliza as variáveis de tema (`--bg-panel`, `--border-subtle`, `--text-primary`, etc.), garantindo suporte instantâneo a dark/light mode.
