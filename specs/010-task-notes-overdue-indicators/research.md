# Research: Indicador de Notas e Destaque de Tarefas Vencidas

**Feature**: `specs/010-task-notes-overdue-indicators`
**Date**: 2026-08-25

## Technical Context & Decisions

### 1. Componente de Balão de Notas e Editor em Popover (`TaskNotePopover`)

- **Decisão**: Criar o componente `TaskNotePopover` utilizando as primitivas de `Popover`, `PopoverTrigger` e `PopoverContent` do shadcn/ui (`@radix-ui/react-popover`) combinadas com `Textarea` e `Button`.
- **Racional**:
  - O popover flutuante permite leitura e edição imediata in-place da nota sem desviar o usuário da listagem, sem quebrar a altura das linhas da tabela e sem exigir a abertura da gaveta lateral pesada (`AddTaskModal`).
  - O botão de trigger exibe ícone estilizado (`StickyNote` / `FileText`) com `aria-label` e `title` acessíveis.
  - Oferece atalhos de teclado: `Escape` fecha sem salvar; `Ctrl+Enter` ou `Cmd+Enter` aciona o salvamento direto no campo de texto.
- **Alternativas Consideradas**:
  - *Modal de diálogo tradicional (`Dialog`)*: Considerado excessivamente intrusivo para anotações rápidas.
  - *Expansão inline na própria linha da tabela*: Quebra a uniformidade da grade de dados do TanStack Table.
  - *Edição apenas pela gaveta lateral (`AddTaskModal`)*: Inconveniente para consultas rápidas e notas curtas no dia a dia.

---

### 2. Visibilidade e Estados do Balão de Notas

- **Decisão**: 
  - Tarefas com notas cadastradas (`task.notes && task.notes.trim().length > 0`): Ícone de balão permanentemente visível com destaque ativo (ex.: `text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20`) e tooltip com preview/indicação de notas.
  - Tarefas sem notas: Ícone oculto por padrão (`opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity`), revelando-se suavemente ao passar o cursor sobre a linha da tarefa ou receber foco via teclado.
- **Racional**: Atende diretamente à clarificação do usuário, mantendo a tabela limpa e minimalista sem poluição visual por ícones vazios repetidos, sem perder a usabilidade e a descoberta de adicionar novas notas.
- **Alternativas Consideradas**:
  - *Ícone atenuado sempre visível em todas as tarefas*: Rejeitado por gerar ruído visual excessivo em tabelas com dezenas de tarefas vazias.

---

### 3. Cálculo de Vencimento e Destaque de Prazo (`isOverdue`)

- **Decisão**:
  - Implementar utilitário `isTaskOverdue(dueDate?: string, isCompleted?: boolean): boolean` comparando a data `dueDate` normalizada (`YYYY-MM-DD`) com a data local do cliente (`YYYY-MM-DD`).
  - Quando `!isCompleted && isOverdue === true`: Aplicar classe utilitária de cor avermelhada (`text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300`) no botão de seleção de data em `DatePickerField`.
  - Sem inclusão de ícones adicionais na coluna de prazo, preservando o layout minimalista solicitado na clarificação.
- **Racional**:
  - A comparação puramente baseada na string de data local `YYYY-MM-DD` evita problemas clássicos de conversão de fuso horário UTC (onde tarefas do dia atual poderiam parecer vencidas prematuramente).
  - O estilo focado na cor do texto destaca o atraso com elegância imediata, sem conflitar com o design system do Klip.
- **Alternativas Consideradas**:
  - *Badge/Pill com fundo vermelho e ícone de alerta*: Rejeitado durante a sessão de clarificação em favor do destaque focado na cor do texto.
  - *Cálculo no backend*: Desnecessário e introduziria latência em um cálculo puramente determinístico no cliente.

---

### 4. Propagação de Estado e Sincronização com a API

- **Decisão**:
  - Integrar a atualização de notas em `saveTaskField` de `TaskTable.tsx` e nas funções `updateTaskInline` / `persistTaskUpdate` de `HomePage.tsx`, `ProjectsPage.tsx` e `MonthViewPage.tsx`.
  - Ao salvar uma nota, atualiza o estado local imediatamente (optimistic update) e despacha `tasksApi.update(taskId, { ...task, notes: newNotes.trim() || undefined })`. Em caso de erro, reverte e exibe toast de erro.
- **Racional**: O backend já suporta o campo `notes` em `PUT /api/Tasks/{id}` e o pipeline de atualização com optimistic update já é o padrão estabelecido no repositório.
