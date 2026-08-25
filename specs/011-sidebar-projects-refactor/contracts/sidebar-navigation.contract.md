# UI Contract: Seção de Projetos na Barra Lateral (`Sidebar.tsx`)

**Feature**: Refatoração da Barra Lateral e Ajuste no Modal de Grupos de Projetos
**Branch**: `011-sidebar-projects-refactor`
**Date**: 2026-08-25

---

## 1. Contrato da Seção de Projetos

### 1.1 Cabeçalho da Seção
```tsx
<div className="flex items-center justify-between px-2 pb-1">
  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-faint)]">
    Projetos
  </p>
  <div className="flex items-center gap-0.5">
    {/* Botão Nova pasta/grupo */}
    {/* Botão Novo projeto */}
  </div>
</div>
```

### 1.2 Campo de Busca
```tsx
<div className="relative px-1 pb-1">
  <Search size={12} className="pointer-events-none absolute left-4 top-2.5 text-[var(--text-faint)]" />
  <input
    type="text"
    placeholder="Buscar projeto..."
    className="field h-8 w-full bg-[var(--field-bg)] pl-8 pr-3 text-xs"
    value={projectSearch}
    onChange={(event) => setProjectSearch(event.target.value)}
  />
</div>
```

### 1.3 Estrutura Hierárquica Vertical
```text
[Header: "PROJETOS"]
[Input: "Buscar projeto..."]
[Listagem de Projetos Raiz (sem agrupador / sem subtítulo "Sem pasta")]
   ├── Projeto Raiz 1
   ├── Projeto Raiz 2
   └── ...
[Listagem de Pastas/Grupos]
   ├── Pasta A
   │     ├── Projeto A.1
   │     └── Projeto A.2
   └── Pasta B
         └── Projeto B.1
```

### 1.4 Contrato de Estilo do Item de Projeto Ativo/Inativo

```tsx
<div
  className={`group flex items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors ${
    isActive
      ? "bg-[var(--bg-soft-strong)] text-[var(--text-primary)]"
      : "text-[var(--text-secondary)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
  }`}
>
  <div
    role="button"
    tabIndex={0}
    onClick={() => handleNavigate(`/project/${project.id}`)}
    className="flex flex-1 min-w-0 cursor-pointer items-center gap-2"
  >
    <span
      className={`h-2 w-2 shrink-0 rounded-full ${colorDot?.className ?? "bg-slate-400"}`}
      style={colorDot?.style}
    />
    {isExpanded && <span className="truncate text-sm font-medium">{project.name}</span>}
  </div>
  {/* Ações: Editar, Arquivar, Excluir */}
</div>
```
