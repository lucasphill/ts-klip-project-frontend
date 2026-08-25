# Quickstart & Validation Guide: Indicador de Notas e Destaque de Tarefas Vencidas

**Feature**: `specs/010-task-notes-overdue-indicators`
**Date**: 2026-08-25

## Prerequisites

1. Frontend executando localmente (`npm run dev`) em `http://localhost:5173`.
2. Sessão autenticada ativa no Klip com usuário de testes (`teste@email.com`).
3. Tarefas de teste cadastradas contendo:
   - Tarefa com anotações preenchidas.
   - Tarefa sem anotações.
   - Tarefa com data de vencimento anterior à data de hoje (pendente).
   - Tarefa com data de vencimento anterior à data de hoje (concluída).
   - Tarefa com data futura ou sem data.

---

## Validation Scenarios

### Scenario 1: Balão de Nota em Tarefa com Anotações

1. Acesse o **Inbox** ou a página de um **Projeto**.
2. Localize uma tarefa que possui texto no campo `notes`.
3. Verifique se o balão/ícone de nota é exibido permanentemente ao lado do título da tarefa com destaque ativo (cor visível).
4. Passe o cursor sobre o balão e confirme a exibição da dica de ferramenta (*tooltip*) ou preview da nota.
5. Clique no balão para abrir o popover e confirme que o texto da anotação é exibido corretamente no campo de texto.

---

### Scenario 2: Criação e Edição Rápida de Nota via Popover

1. Passe o cursor sobre uma tarefa que NÃO possui notas.
2. Verifique se o botão de adicionar nota aparece suavemente na linha (*hover*).
3. Clique no botão para abrir o popover de anotações.
4. Digite uma nova anotação e clique em **Salvar** (ou pressione `Ctrl+Enter`).
5. Confirme que o popover se fecha, a nota é persistida na API e o balão ao lado do título agora aparece no estado ativo/preenchido.
6. Recarregue a página (`F5`) e confirme que a nova nota persiste normalmente.

---

### Scenario 3: Destaque de Tarefa com Prazo Vencido

1. Crie ou edite uma tarefa definindo uma data de vencimento anterior ao dia atual (ex.: ontem).
2. Verifique se o texto da data na coluna **Prazo** é imediatamente renderizado em tom avermelhado (`text-red-600 dark:text-red-400`).
3. Confirme que não há ícones extras de alerta, preservando o layout limpo.
4. Alterne o tema da aplicação (Claro <-> Escuro) e verifique se o contraste e a legibilidade da cor avermelhada estão preservados.

---

### Scenario 4: Conclusão de Tarefa Vencida

1. Localize a tarefa vencida identificada no Cenário 3.
2. Clique no checkbox para marcar a tarefa como concluída (`isCompleted: true`).
3. Verifique se o destaque avermelhado é desativado e o texto da linha assume o estilo padrão de conclusão (texto tachado/atenuado).
4. Desmarque a conclusão e confirme que o destaque avermelhado de vencimento reaparece.

---

### Scenario 5: Validação de Qualidade de Código

Execute os comandos de validação automatizada:

```powershell
npm run lint
npm run build
```

Ambos os comandos devem finalizar com código de saída 0 e sem erros de TypeScript ou linter.
