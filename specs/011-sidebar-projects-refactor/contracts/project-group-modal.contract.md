# UI Contract: Seletor de Ícones no Modal de Grupos de Projetos (`AddProjectGroupModal.tsx`)

**Feature**: Refatoração da Barra Lateral e Ajuste no Modal de Grupos de Projetos
**Branch**: `011-sidebar-projects-refactor`
**Date**: 2026-08-25

---

## 1. Contrato do Seletor de Ícones

### 1.1 Layout de Grade / Flexbox
- **Container**: `flex flex-wrap gap-2` ou `grid grid-cols-6 sm:grid-cols-8 gap-2`
- **Dimensão dos Botões**: `h-9 w-9 shrink-0` (mínimo de 36x36px para alvo de toque e clique acessível)
- **Estado Normal / Inativo**: `border border-[var(--border-subtle)] bg-[var(--bg-soft)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] rounded-lg`
- **Estado Selecionado**: `border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm ring-2 ring-[var(--brand-soft)] rounded-lg`

### 1.2 Estrutura JSX
```tsx
<div className="space-y-2">
  <Label className="text-xs font-semibold text-[var(--text-secondary)]">Ícone</Label>
  <div className="flex flex-wrap gap-2">
    {PRESET_ICONS.map((item) => {
      const IconComp = item.icon;
      const isSelected = icon === item.id;
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => setIcon(item.id)}
          title={item.label}
          aria-label={`Ícone: ${item.label}`}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all ${
            isSelected
              ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm ring-2 ring-[var(--brand-soft)]"
              : "border-[var(--border-subtle)] bg-[var(--bg-soft)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
          }`}
        >
          <IconComp className="h-4 w-4" />
        </button>
      );
    })}
  </div>
</div>
```
