# UI Contract: Estado de Carregamento Animado e Transição da Barra Lateral

**Feature**: Estado de Carregamento Animado, Sincronização e Transição Suave da Barra Lateral
**Branch**: `013-sidebar-loading-state`
**Date**: 2026-08-25

---

## 1. Contrato do Componente de Loading Animado (Dots Loading)

```tsx
export function SidebarDotsLoading({ isExpanded }: { isExpanded: boolean }) {
  if (!isExpanded) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-1.5 py-4"
        aria-label="Carregando projetos"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center gap-1.5 py-6"
      aria-label="Carregando projetos"
    >
      <span className="h-2 w-2 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.3s]" />
      <span className="h-2 w-2 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.15s]" />
      <span className="h-2 w-2 rounded-full bg-[var(--text-muted)] animate-bounce" />
    </div>
  );
}
```

---

## 2. Contrato de Transição Suave para Textos e Rótulos na Barra Lateral

```tsx
// Texto/Rótulo com expansão/recolhimento suave (sem quebra de linha ou unmount abrupto):
<span
  className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
    isExpanded ? "max-w-[12rem] opacity-100" : "max-w-0 opacity-0 pointer-events-none"
  }`}
>
  {label}
</span>
```

---

## 3. Contrato de Agrupamento Atômico

```typescript
const { groupedProjects, rootProjects } = useMemo(() => {
  const groupMap = new Map<string, GetProjectsDto[]>();
  const root: GetProjectsDto[] = [];

  filteredProjects.forEach((proj) => {
    const gId = proj.groupId ?? (proj as any).group_id;
    if (gId) {
      const list = groupMap.get(gId) || [];
      list.push(proj);
      groupMap.set(gId, list);
    } else {
      root.push(proj);
    }
  });

  return { groupedProjects: groupMap, rootProjects: root };
}, [filteredProjects]);
```
