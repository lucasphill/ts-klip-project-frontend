# Quickstart Validation Guide: Task Notes Markdown Rich Editor

**Feature**: Task Notes Markdown Rich Editor  
**Branch**: `015-task-notes-markdown-editor`  
**Date**: 2026-08-31  

## Overview

This guide outlines the end-to-end validation procedures for verifying the rich Markdown task notes editor across table popovers and the task creation/editing modal.

---

## Prerequisites & Environment

1. Ensure the development server is running:
   ```bash
   npm run dev
   ```
2. Log into the application using test credentials:
   - **Email**: `teste@email.com`
   - **Password**: `o#mUN9WMKps7rtCGclNu`

---

## Validation Scenarios

### Scenario 1: Quick Note Editing & Formatting via Table Popover
1. Navigate to the **Home** (`/`) or **Projects** (`/projects`) page.
2. In any task row, click on the **Sticky Note** icon button.
3. Verify the popover opens with a comfortable width (~400px), a header showing the task title, a toolbar, and an active editor.
4. Test live markdown shortcuts:
   - Type `- Bullet 1` and press `Enter` → verifies unordered list creation.
   - Type `1. Item 1` and press `Enter` → verifies numbered list creation.
   - Type `[] Check item` and press `Enter` → verifies interactive checklist creation.
   - Type `## Header 2` and press `Enter` → verifies heading creation.
5. Highlight a word and click the **Bold** (`B`) or **Italic** (`I`) button in the toolbar.
6. Press `Ctrl+Enter` (or click **Salvar**).
7. Verify the popover closes and the note icon shows an active indicator.
8. Re-open the popover to confirm the formatted content rendered identically.

### Scenario 2: Rich Note Authoring in AddTaskModal
1. Click the **Nova Tarefa** (+ button) in the top-bar or project list.
2. Fill in a title (e.g., "Implementar testes de Markdown").
3. In the **Notas** field, type a multi-line note with a checklist:
   ```text
   ### Checklist de entrega
   - [ ] Criar testes unitários
   - [x] Validar build
   ```
4. Click **Criar Tarefa** (or **Salvar**).
5. Open the newly created task in `AddTaskModal` or via the table popover and verify the formatted checklist is preserved.

### Scenario 3: Backward Compatibility with Legacy Plain Text Notes
1. Identify a task created prior to the update containing multi-line plain text.
2. Hover over the note icon on the task row: verify the tooltip text is readable and clean.
3. Click to open the popover: verify the plain text appears as clean editable paragraphs without missing lines or error messages.
4. Add a new checklist item at the end and save. Verify the combined note saves properly.

### Scenario 4: Keyboard Navigation & Shortcuts
1. Open the popover with focus on the editor.
2. Press `Escape` → verifies the popover closes without saving changes.
3. Open the popover again, modify text, and press `Ctrl+Enter` (or `Cmd+Enter` on Mac) → verifies immediate save.

---

## Code Quality & Verification Commands

Execute the following checks in the project root:

```bash
# 1. Lint check
npm run lint

# 2. Type-check & Build check
npm run build
```
