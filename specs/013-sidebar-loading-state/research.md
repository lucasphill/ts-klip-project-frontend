# Research & Architecture Decisions: Estado de Carregamento Animado, Sincronização e Transição Suave da Barra Lateral

**Feature**: Estado de Carregamento Animado, Sincronização e Transição Suave da Barra Lateral
**Branch**: `013-sidebar-loading-state`
**Date**: 2026-08-25

---

## 1. Indicador de Carregamento Animado (Animated Dots Loading)

### Contexto
O carregamento assíncrono dos projetos e pastas leva entre 100ms e 300ms. A ausência de feedback de carregamento gera a sensação de lentidão e pode induzir o usuário a achar que a lista está vazia.

### Decisão
Criar um indicador leve em CSS puro / Tailwind com 3 pontos animados pulsantes (*animated dots* com atrasos escalonados `animation-delay`):
- **Modo Expandido**: 3 pontos horizontais (`h-2 w-2 rounded-full bg-[var(--text-muted)] animate-bounce`) centralizados com espaçamento vertical confortável (`py-6`).
- **Modo Recolhido**: 3 pontos verticais compactos (`h-1.5 w-1.5 rounded-full bg-[var(--text-muted)] animate-bounce`) centralizados na barra de 56px (`py-4`).
- **Zero Dependências**: Não adiciona bibliotecas externas de GIFs ou SVGs pesados.

### Alternativas Consideradas
- *Skeleton shimmer*: Rejeitado para esta seção para manter o visual ultrarreduzido e sem falsa expectativa de quantidade fixa de itens.
- *Spinner circular (Lucide Loader)*: Menos sutil que os dots animados e destoa da linguagem visual minimalista adotada.

---

## 2. Eliminação da Condição de Corrida (Atomic Grouping)

### Contexto
Atualmente, quando `fetchProjects()` resolve antes de `fetchProjectGroups()`, projetos com `groupId` são jogados no array `rootProjects` temporariamente porque `knownGroupIds` ainda está vazio, causando um "salto" visual quando os grupos chegam.

### Decisão
1. **Regra Estrita de Raiz**: Um projeto só entra em `rootProjects` se `!proj.groupId && !proj.group_id`.
2. Se `proj.groupId` existir, ele é registrado no mapa de grupos (`groupMap`).
3. O estado `isLoading` no `ProjectsContext` e no `Sidebar` aguarda o término de ambas as requisições (`Promise.all([fetchProjects(), fetchProjectGroups()])`) antes de trocar o estado de loading para a lista renderizada com transição `transition-opacity duration-200`.

---

## 3. Transição Suave ao Abrir e Fechar a Barra Lateral (No Jitter / No Text Wrap)

### Contexto
Quando o usuário clica em "Recolher" ou "Expandir", o `<aside>` transiciona sua largura em `200ms` (`transition-all duration-200`), mas os textos internos e o campo de busca eram montados/desmontados instantaneamente via `{isExpanded && <span>...</span>}`, causando saltos bruscos (*pop-in/out*) e quebras de linha durante o redimensionamento.

### Decisão
Substituir o unmount abrupto por classes CSS de transição sincronizadas com a duração de 200ms:
- **Rótulos de Texto e Badges**:
  `overflow-hidden whitespace-nowrap transition-all duration-200 ${isExpanded ? "max-w-[12rem] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0 pointer-events-none"}`
- **Campo de Busca e Cabeçalho "Projetos"**:
  `overflow-hidden transition-all duration-200 ${isExpanded ? "max-h-12 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`
- **Botões de Ação**:
  Fade-out gradual durante o recolhimento, sem deslocamento abrupto dos ícones principais.
