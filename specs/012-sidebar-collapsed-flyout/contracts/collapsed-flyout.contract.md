# UI Contract: Balão Flutuante (Flyout) para Barra Lateral Recolhida

**Feature**: Menu Flutuante (Flyout) e Ergonomia da Barra Lateral Recolhida
**Branch**: `012-sidebar-collapsed-flyout`
**Date**: 2026-08-25

---

## 1. Contrato do Flyout de Pasta / Grupo de Projetos

### 1.1 Disparador (Trigger) na Barra Lateral Recolhida
```tsx
<HoverCard openDelay={150} closeDelay={120}>
  <HoverCardTrigger asChild>
    <button
      type="button"
      className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
      aria-label={`Pasta: ${group.name}`}
    >
      <IconComponent size={16} style={{ color: group.color || "var(--text-muted)" }} />
    </button>
  </HoverCardTrigger>
  <HoverCardContent
    side="right"
    align="start"
    sideOffset={8}
    className="w-64 p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-xl"
  >
    {/* Cabeçalho */}
    <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 min-w-0">
        <IconComponent size={14} style={{ color: group.color }} className="shrink-0" />
        <span className="font-semibold text-xs text-[var(--text-primary)] truncate">{group.name}</span>
        <span className="rounded-full bg-[var(--bg-soft-strong)] px-1.5 py-0.2 text-[10px] text-[var(--text-muted)]">
          {groupProjects.length}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {/* Ação: + Novo Projeto nesta pasta */}
        {/* Ação: Editar Pasta */}
        {/* Ação: Excluir Pasta */}
      </div>
    </div>

    {/* Lista de Projetos */}
    <div className="pt-2 max-h-56 overflow-y-auto space-y-1">
      {groupProjects.map((project) => (
        <button
          key={project.id}
          onClick={() => handleNavigate(`/project/${project.id}`)}
          className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors text-left ${
            activeTab === project.id
              ? "bg-[var(--bg-soft-strong)] text-[var(--text-primary)] font-medium"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
          }`}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
          <span className="truncate flex-1">{project.name}</span>
        </button>
      ))}
      {groupProjects.length === 0 && (
        <p className="py-2 text-center text-xs italic text-[var(--text-faint)]">Pasta vazia</p>
      )}
    </div>
  </HoverCardContent>
</HoverCard>
```

---

## 2. Contrato do Flyout de Projetos Raiz

```tsx
<HoverCard openDelay={150} closeDelay={120}>
  <HoverCardTrigger asChild>
    <button
      type="button"
      onClick={() => handleNavigate(`/project/${project.id}`)}
      className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
        isActive
          ? "bg-[var(--bg-soft-strong)] text-[var(--text-primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
      }`}
      aria-label={`Projeto: ${project.name}`}
    >
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${colorDot?.className ?? "bg-slate-400"}`}
        style={colorDot?.style}
      />
    </button>
  </HoverCardTrigger>
  <HoverCardContent
    side="right"
    align="center"
    sideOffset={8}
    className="w-56 p-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-xl"
  >
    <div className="flex items-center justify-between">
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleNavigate(`/project/${project.id}`)}
        className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${colorDot?.className ?? "bg-slate-400"}`}
          style={colorDot?.style}
        />
        <span className="font-medium text-xs text-[var(--text-primary)] truncate">{project.name}</span>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        {/* Ação: Editar */}
        {/* Ação: Arquivar */}
        {/* Ação: Excluir */}
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```
