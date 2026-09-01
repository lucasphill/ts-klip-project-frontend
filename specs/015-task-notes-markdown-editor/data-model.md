# Data Model: Task Notes Markdown Rich Editor

**Feature**: Task Notes Markdown Rich Editor  
**Branch**: `015-task-notes-markdown-editor`  
**Date**: 2026-08-31  

## Entities & Interfaces

### 1. Task Entity (Domain Contract)

The task entity represents the primary unit of work in Klip. The `notes` field contains the rich Markdown representation.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique task identifier |
| `title` | `string` | Task title |
| `notes` | `string \| null \| undefined` | Task notes content encoded as GitHub Flavored Markdown (GFM) |
| `isCompleted` | `boolean` | Completion status of the task |
| `dueDate` | `string \| null` | Due date string (ISO date or `YYYY-MM-DD`) |
| `parentTaskId` | `string \| null \| undefined` | Parent task ID for subtasks |
| `projectIds` | `string[]` | Associated project IDs |

### 2. Editor Node Hierarchy (Client State)

Within Plate/Slate, the document tree is structured as follows:

```text
EditorValue: PlateNode[]
├── ParagraphNode { type: 'p', children: TextNode[] }
├── HeadingNode { type: 'h1' | 'h2' | 'h3', children: TextNode[] }
├── BulletListNode { type: 'ul', children: ListItemNode[] }
├── NumberedListNode { type: 'ol', children: ListItemNode[] }
├── TodoListNode { type: 'action_item' | 'todo', checked: boolean, children: TextNode[] }
└── LinkNode { type: 'a', url: string, children: TextNode[] }

TextNode:
├── text: string
├── bold?: boolean
├── italic?: boolean
├── strikethrough?: boolean
└── code?: boolean
```

### 3. Markdown Serialization Mapping

| Editor Node / Mark | Markdown Syntax (GFM) | Notes / Parsing Rule |
|---|---|---|
| Paragraph | `Text\n\n` | Standard paragraph separated by blank line |
| Heading 1 | `# Heading 1` | Top-level header |
| Heading 2 | `## Heading 2` | Section header |
| Heading 3 | `### Heading 3` | Sub-section header |
| Bullet List Item | `- Item` or `* Item` | Unordered list |
| Numbered List Item | `1. Item` | Ordered list |
| Todo / Checkbox Item (unchecked) | `- [ ] Task item` | Interactive checkbox item |
| Todo / Checkbox Item (checked) | `- [x] Task item` | Completed task item |
| Bold Mark | `**text**` | Strong text |
| Italic Mark | `*text*` or `_text_` | Emphasized text |
| Strikethrough Mark | `~~text~~` | Strikethrough text |
| Link Node | `[label](url)` | Inline hyperlink |

## Validation & Business Rules

1. **Empty State Normalization**:
   - If the editor contains only empty paragraph nodes (`[{ type: 'p', children: [{ text: '' }] }]`) or whitespace, serialization yields `""` or `undefined`.
   - On the backend and API payloads, empty notes are stored as `null` or omitted to keep payloads minimal.
2. **Legacy Plain Text Handling**:
   - When deserializing a plain text string that does not contain Markdown tags, each line becomes a `<p>` paragraph node.
   - No characters or newlines are stripped or lost.
3. **URL Validation in Links**:
   - Hyperlinks must validate basic protocol formatting (`http://`, `https://`, `mailto:`, or relative path) before insertion.
4. **Max Length & Size Constraints**:
   - Standard task notes are expected to be under 20,000 characters.
   - The editor UI applies `max-h-[300px]` in popovers and `max-h-[450px]` in modals with `overflow-y-auto`.
