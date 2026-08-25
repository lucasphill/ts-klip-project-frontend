# Implementation Plan: Indicador de Notas e Destaque de Tarefas Vencidas

**Branch**: `010-task-notes-overdue-indicators` | **Date**: 2026-08-25 | **Spec**: [specs/010-task-notes-overdue-indicators/spec.md](file:///D:/Dev/ts-klip-project-frontend/specs/010-task-notes-overdue-indicators/spec.md)

**Input**: Feature specification from `specs/010-task-notes-overdue-indicators/spec.md`

## Summary

Implementar duas melhorias de layout e usabilidade na listagem de tarefas:
1. **Balão Indicador e Edição Rápida de Notas (`notes`)**: Adicionar componente interativo (`TaskNotePopover`) ao lado do título da tarefa na tabela (`TaskTable`), destacando tarefas com notas existentes e permitindo leitura, criação e edição rápida de notas via popover flutuante com sincronização na API.
2. **Destaque Visual de Tarefas Vencidas (`dueDate`)**: Destacar a data de vencimento com cor de texto avermelhada (`text-red-600 dark:text-red-400`) para tarefas não concluídas com prazo anterior ao dia atual, sem ícones de alerta adicionais.

## Technical Context

**Language/Version**: TypeScript 5.7+ / React 19

**Primary Dependencies**: React 19, Lucide React (`StickyNote`, `Calendar`), Radix UI / shadcn/ui (`Popover`, `Textarea`, `Button`), TailwindCSS, TanStack React Table

**Storage**: Estado de tarefas em memória (`TasksContext`, `useState`) persistido no backend via `tasksApi.update`

**Testing**: Lint (`npm run lint`), Build (`npm run build`), e validação funcional no navegador (Chrome DevTools / MCP)

**Target Platform**: Navegadores modernos desktop e mobile

**Project Type**: Aplicação Web Single-Page (Frontend SPA)

**Performance Goals**: Renderização sem impacto perceptível de performance; persistência otimista com atualização de estado < 100ms

**Constraints**: Conformidade com a Constituição do Klip Frontend, acessibilidade por teclado, suporte aos temas Claro e Escuro sem quebra de layout na célula de título

**Scale/Scope**: `src/components/TaskTable.tsx`, `src/components/TaskNotePopover.tsx`, `src/components/DatePickerField.tsx`, `src/lib/dateUtils.ts` (ou utilitário de data), `src/pages/HomePage.tsx`, `src/pages/ProjectsPage.tsx`, `src/pages/MonthViewPage.tsx`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Type-Safe, Maintainable Frontend**: Tipos explícitos para propriedades de notas, estados de vencimento e DTOs de tarefa (`GetTasksDto`, `CreateTaskDto`).
- [x] **II. Accessible and Consistent User Experience**: Acessibilidade total via teclado (`Tab`, `Enter`, `Escape`, `Ctrl+Enter`), rótulos ARIA descritivos e contraste em temas Claro e Escuro.
- [x] **III. Reliable Authentication and Data Boundaries**: Utilização dos serviços de API autenticados existentes (`tasksApi.update`), sem exposição indevida de dados.
- [x] **IV. Verified Behavior Before Merge**: Validação estrita de lint, compilação de TypeScript e teste de ponta a ponta no navegador.
- [x] **V. Simple, Performant State and UI**: Edição contextual via popover leve sem re-renderizações desnecessárias da tabela inteira e sem dependências externas desnecessárias.

## Project Structure

### Documentation (this feature)

```text
specs/010-task-notes-overdue-indicators/
├── plan.md              # Este arquivo ($speckit-plan)
├── research.md          # Pesquisa técnica e decisões de arquitetura ($speckit-plan)
├── data-model.md        # Modelagem de dados e interfaces ($speckit-plan)
├── quickstart.md        # Roteiro de validação funcional ($speckit-plan)
├── contracts/           # Contratos de UI e componentes ($speckit-plan)
│   ├── task-notes-ui.contract.md
│   └── task-overdue-ui.contract.md
├── checklists/
│   └── requirements.md  # Checklist de qualidade da especificação
└── tasks.md             # Tarefas de implementação ($speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── TaskNotePopover.tsx     # Componente de balão e popover rápido para notas da tarefa
│   ├── TaskTable.tsx           # Renderização do balão de notas e estilo de data vencida
│   └── DatePickerField.tsx     # Suporte a estilização condicional de texto/prazo
├── lib/
│   └── taskUtils.ts            # Função utilitária isTaskOverdue e normalização de datas
└── pages/
    ├── HomePage.tsx            # Propagação de updateTaskInline com campo de notas
    ├── ProjectsPage.tsx        # Propagação de updateTaskInline com campo de notas
    └── MonthViewPage.tsx       # Propagação de updateTaskInline com campo de notas
```

**Structure Decision**: Estrutura modular dentro dos componentes existentes, reutilizando o serviço de API centralizado e os componentes de UI shadcn já instalados.

## Complexity Tracking

*Nenhuma violação constitucional ou complexidade arquitetural desnecessária identificada.*
