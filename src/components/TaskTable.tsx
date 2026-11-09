import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useLocation } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Columns3,
  CornerDownLeft,
  Maximize2,
  Pencil,
  Plus,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { getOptionTone, OPTION_TONE_CLASSES } from "../lib/optionTone";
import DatePickerField from "./DatePickerField";
import TaskNotePopover from "./TaskNotePopover";
import { getDueDateStatus, getRelativeDueDateLabel } from "../lib/taskUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
  type ExpandedState,
  type ColumnDef,
} from "@tanstack/react-table";
import type {
  CustomFieldValue,
  GetCustomFieldDefinitionDto,
  GetProjectsDto,
  GetTasksDto,
} from "../types/apiTypes";
import { normalizeParentTaskId } from "../lib/taskHierarchy";

export type TaskTableTask = GetTasksDto & {
  customFields?: Record<string, CustomFieldValue>;
};

export type TaskTableTreeNode = TaskTableTask & {
  subRows: TaskTableTreeNode[];
};

interface TaskTitleInputProps {
  task: TaskTableTask;
  saveTaskField: (taskId: string, updates: { title?: string }) => void;
  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;
}

const TaskTitleInput = ({ task, saveTaskField, editingTaskId, setEditingTaskId }: TaskTitleInputProps) => {
  const [value, setValue] = useState(task.title);
  const isEditing = editingTaskId === task.id;

  useEffect(() => {
    setValue(task.title);
  }, [task.title]);

  const handleSave = () => {
    if (value !== task.title) {
      saveTaskField(task.id, { title: value });
    }
    setEditingTaskId(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setValue(task.title);
      setEditingTaskId(null);
      e.currentTarget.blur();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <div className="w-full min-w-0 flex-1 flex items-center relative group">
      <input
        type="text"
        value={value}
        title={value}
        placeholder="Escreva uma tarefa..."
        onFocus={() => setEditingTaskId(task.id)}
        onBlur={handleSave}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`w-full rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[var(--bg-soft)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] focus:bg-[var(--bg-panel)] truncate ${
          task.isCompleted ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]"
        }`}
      />
      {isEditing && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="absolute right-1 inline-flex items-center justify-center shrink-0 rounded-md bg-[var(--brand)] px-2.5 py-1 text-xs font-medium text-white hover:bg-[var(--brand-strong)] transition-colors shadow-sm"
        >
          Salvar
        </button>
      )}
    </div>
  );
};

// Campos da tabela parecem texto comum e só mostram a borda ao passar o mouse ou focar.
const INLINE_FIELD_CLASS =
  "h-7 w-full rounded-md border border-transparent bg-transparent px-2 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-faint)] hover:border-[var(--border-subtle)] hover:bg-[var(--bg-soft)] focus:border-[var(--field-focus)] focus:bg-[var(--bg-panel)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const EMPTY_OPTION_VALUE = "__empty__";

const NARROW_SCREEN_QUERY = "(max-width: 767px)";
const ALWAYS_VISIBLE_ON_NARROW_SCREEN = new Set(["status", "task"]);

interface CustomFieldInputProps {
  task: TaskTableTask;
  field: GetCustomFieldDefinitionDto;
  initialValue: string;
  onSave: (taskId: string, fieldId: string, value: CustomFieldValue) => void;
}

const CustomFieldInput = ({ task, field, initialValue, onSave }: CustomFieldInputProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    if (value !== initialValue) {
      if (field.type === "number") {
        onSave(task.id, field.id, value === "" ? "" : Number(value));
      } else {
        onSave(task.id, field.id, value);
      }
    }
  };

  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className={INLINE_FIELD_CLASS}
      placeholder="—"
      aria-label={field.name}
    />
  );
};

interface TaskTableProps {
  activeView: string;
  visibleTasks: TaskTableTask[];
  activeCustomFields?: GetCustomFieldDefinitionDto[];
  projects: GetProjectsDto[];
  getFieldValue?: (taskId: string, fieldId: string) => CustomFieldValue;
  updateCustomValue?: (taskId: string, fieldId: string, value: CustomFieldValue) => void;
  toggleTaskCompletion: (taskId: string) => void;
  /** Abre o formulário completo de tarefa, opcionalmente com um título já preenchido. */
  addTask: (initialTitle?: string) => void;
  /** Cria uma tarefa só com o título (adição rápida). Sem ele, o campo de adição rápida não aparece. */
  onQuickAdd?: (title: string) => Promise<unknown> | void;
  getTaskProjects: (taskId: string) => GetProjectsDto[];
  addProjectToTask: (taskId: string, projectId: string) => void;
  removeProjectFromTask: (taskId: string, projectId: string) => void;
  updateTaskTitle: (taskId: string, title: string) => void;
  updateTaskDueDate: (taskId: string, dueDate: string) => void;
  updateTaskNotes?: (taskId: string, notes: string) => void;
  /** May resolve to a command result; `{ ok: false }` keeps the notes popover open. */
  updateTaskInline?: (
    taskId: string,
    updates: { title?: string; dueDate?: string; notes?: string }
  ) => void | Promise<unknown>;
  onEditTask?: (task: TaskTableTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddSubtask?: (task: TaskTableTask) => void;
  hideAddTaskButton?: boolean;
}

type TaskStatusFilter = "all" | "completed" | "pending";

type StoredTaskTableState = {
  version?: number;
  statusFilter?: TaskStatusFilter;
  sorting?: SortingState;
  expanded?: ExpandedState;
  hiddenColumns?: string[];
};

const TASK_TABLE_STORAGE_PREFIX = "klip:task-table-state";
const TASK_TABLE_STORAGE_VERSION = 3;

const DEFAULT_STATUS_FILTER: TaskStatusFilter = "all";

const isStatusFilter = (value: unknown): value is TaskStatusFilter =>
  value === "all" || value === "completed" || value === "pending";

const parseStoredTaskTableState = (rawValue: string | null) => {
  if (!rawValue) {
    return {
      statusFilter: DEFAULT_STATUS_FILTER,
      sorting: [{ id: "dueDate", desc: false }] as SortingState,
      expanded: {} as ExpandedState,
      hiddenColumns: [] as string[],
    };
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredTaskTableState;
    const statusFilter = isStatusFilter(parsed.statusFilter) ? parsed.statusFilter : DEFAULT_STATUS_FILTER;
    const sorting = Array.isArray(parsed.sorting) ? parsed.sorting : [{ id: "dueDate", desc: false }];
    const expanded = typeof parsed.expanded === "object" && parsed.expanded !== null ? parsed.expanded : {};
    const hiddenColumns = Array.isArray(parsed.hiddenColumns)
      ? parsed.hiddenColumns.filter((id): id is string => typeof id === "string")
      : [];

    return { statusFilter, sorting, expanded, hiddenColumns };
  } catch {
    return {
      statusFilter: DEFAULT_STATUS_FILTER,
      sorting: [{ id: "dueDate", desc: false }] as SortingState,
      expanded: {} as ExpandedState,
      hiddenColumns: [] as string[],
    };
  }
};

const getProjectTagColorProps = (color?: string): { className: string; style?: CSSProperties } => {
  if (!color) {
    return { className: "border-slate-200 bg-slate-50 text-slate-700" };
  }

  if (color.startsWith("bg-")) {
    return { className: `border-transparent ${color} text-white` };
  }

  return {
    className: "border-transparent text-white",
    style: { backgroundColor: color },
  };
};

const isFailedResult = (result: unknown) =>
  typeof result === "object" && result !== null && (result as { ok?: unknown }).ok === false;

const normalizeDate = (value?: string | null) => {
  if (!value) return "";
  return String(value).split("T")[0];
};

const COMPLETION_SORT_COLUMN_ID = "__completion";
const COMPLETION_SORT = { id: COMPLETION_SORT_COLUMN_ID, desc: false };

const formatDueDate = (value?: string | null) => {
  const [year, month, day] = normalizeDate(value).split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
};

const buildTree = (tasks: TaskTableTask[]): TaskTableTreeNode[] => {
  const taskMap = new Map<string, TaskTableTreeNode>();
  const roots: TaskTableTreeNode[] = [];

  tasks.forEach((task) => {
    taskMap.set(task.id, { ...task, subRows: [] });
  });

  tasks.forEach((task) => {
    const parentId = normalizeParentTaskId(task.parentTaskId);
    const node = taskMap.get(task.id)!;
    if (parentId && parentId !== task.id && taskMap.has(parentId)) {
      taskMap.get(parentId)!.subRows.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const TaskTable = ({
  activeView,
  visibleTasks,
  activeCustomFields,
  projects,
  getFieldValue,
  updateCustomValue,
  toggleTaskCompletion,
  addTask,
  getTaskProjects,
  addProjectToTask,
  removeProjectFromTask,
  updateTaskTitle,
  updateTaskDueDate,
  updateTaskNotes,
  updateTaskInline,
  onEditTask,
  onDeleteTask,
  onAddSubtask,
  hideAddTaskButton = false,
  onQuickAdd,
}: TaskTableProps) => {
  const location = useLocation();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>(DEFAULT_STATUS_FILTER);
  const [projectSelectVersion, setProjectSelectVersion] = useState<Record<string, number>>({});

  // TanStack Table State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [quickAddTitle, setQuickAddTitle] = useState("");
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  const skipNextTableStatePersist = useRef(false);

  const tableStateStorageKey = useMemo(
    () => `${TASK_TABLE_STORAGE_PREFIX}:v${TASK_TABLE_STORAGE_VERSION}:${location.pathname}:${activeView}`,
    [location.pathname, activeView]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    skipNextTableStatePersist.current = true;
    const stored = window.localStorage.getItem(tableStateStorageKey);
    const parsedState = parseStoredTaskTableState(stored);
    setStatusFilter(parsedState.statusFilter);
    setSorting(parsedState.sorting);
    setExpanded(parsedState.expanded);
    setHiddenColumns(parsedState.hiddenColumns);
  }, [tableStateStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (skipNextTableStatePersist.current) {
      skipNextTableStatePersist.current = false;
      return;
    }

    const payload: StoredTaskTableState = {
      version: TASK_TABLE_STORAGE_VERSION,
      statusFilter,
      sorting,
      expanded,
      hiddenColumns,
    };

    window.localStorage.setItem(tableStateStorageKey, JSON.stringify(payload));
  }, [statusFilter, sorting, expanded, hiddenColumns, tableStateStorageKey]);

  const safeCustomFields = Array.isArray(activeCustomFields) ? activeCustomFields : [];

  const filteredTasks = useMemo(() => {
    return visibleTasks.filter(task => {
      if (statusFilter === "completed" && !task.isCompleted) return false;
      if (statusFilter === "pending" && task.isCompleted) return false;
      return true;
    });
  }, [visibleTasks, statusFilter]);

  const data = useMemo(() => buildTree(filteredTasks), [filteredTasks]);

  const getResolvedFieldValue = (task: TaskTableTask, field: GetCustomFieldDefinitionDto): CustomFieldValue => {
    if (getFieldValue) {
      return getFieldValue(task.id, field.id);
    }
    return task.customFields?.[field.id] ?? task.customFields?.[field.name] ?? "";
  };

  const getCustomFieldValueLabel = (task: TaskTableTask, field: GetCustomFieldDefinitionDto) => {
    const value = getResolvedFieldValue(task, field);
    if (field.type === "boolean") {
      return value ? "sim" : "não";
    }
    return String(value ?? "");
  };

  const resetProjectSelect = (taskId: string) => {
    setProjectSelectVersion((previous) => ({
      ...previous,
      [taskId]: (previous[taskId] ?? 0) + 1,
    }));
  };

  const saveTaskField = (
    taskId: string,
    updates: { title?: string; dueDate?: string; notes?: string }
  ): void | Promise<unknown> => {
    if (updateTaskInline) {
      return updateTaskInline(taskId, updates);
    }

    if (updates.title !== undefined) {
      updateTaskTitle(taskId, updates.title);
    }

    if (updates.dueDate !== undefined) {
      updateTaskDueDate(taskId, updates.dueDate);
    }

    if (updates.notes !== undefined && updateTaskNotes) {
      updateTaskNotes(taskId, updates.notes);
    }
  };

  const getFieldOptions = (field: GetCustomFieldDefinitionDto) => {
    if (Array.isArray(field.options)) {
      return field.options;
    }
    return String(field.options ?? "")
      .split(",")
      .map((option) => option.trim())
      .filter(Boolean);
  };

  const renderReadOnlyFieldValue = (field: GetCustomFieldDefinitionDto, value: CustomFieldValue) => {
    if (field.type === "boolean") {
      return (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${value ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}
        >
          {value ? "Sim" : "Não"}
        </span>
      );
    }
    if (field.type === "enum" && value) {
      const option = String(value);
      return (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            OPTION_TONE_CLASSES[getOptionTone(option, getFieldOptions(field).indexOf(option))]
          }`}
        >
          {option}
        </span>
      );
    }
    return <span className="text-sm text-[var(--text-primary)]">{value === "" || value == null ? "—" : String(value)}</span>;
  };

  const renderCustomFieldEditor = (task: TaskTableTask, field: GetCustomFieldDefinitionDto) => {
    const fieldValue = getResolvedFieldValue(task, field);
    const fieldOptions = getFieldOptions(field);
    if (!updateCustomValue) {
      return renderReadOnlyFieldValue(field, fieldValue);
    }

    if (field.type === "enum") {
      const currentValue = String(fieldValue ?? "");
      const currentIndex = fieldOptions.indexOf(currentValue);
      return (
        <Select
          value={currentValue || EMPTY_OPTION_VALUE}
          onValueChange={(nextValue) =>
            updateCustomValue(task.id, field.id, nextValue === EMPTY_OPTION_VALUE ? "" : nextValue)
          }
        >
          <SelectTrigger
            size="sm"
            aria-label={field.name}
            className="h-7 w-full justify-start gap-1 border-transparent bg-transparent px-1.5 shadow-none hover:border-[var(--border-subtle)] hover:bg-[var(--bg-soft)] dark:bg-transparent [&>svg]:ml-auto [&>svg]:opacity-0 hover:[&>svg]:opacity-100 focus-visible:[&>svg]:opacity-100"
          >
            {currentValue ? (
              <span
                className={`inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-xs font-medium ${
                  OPTION_TONE_CLASSES[getOptionTone(currentValue, currentIndex)]
                }`}
              >
                {currentValue}
              </span>
            ) : (
              <span className="px-0.5 text-sm text-[var(--text-faint)]">—</span>
            )}
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            <SelectItem value={EMPTY_OPTION_VALUE}>
              <span className="text-[var(--text-muted)]">Sem valor</span>
            </SelectItem>
            {fieldOptions.map((option, index) => (
              <SelectItem key={option} value={option}>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${OPTION_TONE_CLASSES[getOptionTone(option, index)]}`}
                >
                  {option}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "boolean") {
      return (
        <label className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)]">
          <input
            type="checkbox"
            checked={Boolean(fieldValue)}
            onChange={(event) => updateCustomValue(task.id, field.id, event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#2f6fb2]"
          />
          {fieldValue ? "Sim" : "Não"}
        </label>
      );
    }

    if (field.type === "date") {
      return (
        <DatePickerField
          value={String(fieldValue ?? "")}
          onChange={(nextDate) => updateCustomValue(task.id, field.id, nextDate)}
          className="w-full"
          buttonClassName="h-7 flex-1 bg-transparent dark:bg-transparent hover:bg-[var(--bg-soft)] dark:hover:bg-[var(--bg-soft)] hover:border-[var(--border-subtle)] dark:border-transparent dark:hover:border-[var(--border-subtle)] text-sm text-[var(--text-primary)] border-transparent shadow-none focus:bg-[var(--bg-soft-strong)] focus:border-[var(--border-subtle)] px-2 rounded-md transition-colors text-left"
          clearButtonClassName="opacity-0 group-hover/task-row:opacity-100 focus-visible:opacity-100"
          placeholder="—"
        />
      );
    }

    return (
      <CustomFieldInput
        task={task}
        field={field}
        initialValue={String(fieldValue ?? "")}
        onSave={updateCustomValue}
      />
    );
  };

  const columnHelper = createColumnHelper<TaskTableTreeNode>();

  const columns = useMemo(() => {
    const cols: ColumnDef<TaskTableTreeNode, any>[] = [
      columnHelper.accessor("isCompleted", {
        id: "status",
        header: () => <span className="sr-only">Status</span>,
        size: 48,
        enableHiding: false,
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info) => {
          const task = info.row.original;
          return (
            <div className="flex h-full items-center px-3">
              <button
                onClick={() => toggleTaskCompletion(task.id)}
                className="text-slate-400 transition-colors hover:text-emerald-600"
                aria-label={task.isCompleted ? "Marcar como pendente" : "Marcar como concluída"}
                title={task.isCompleted ? "Marcar como pendente" : "Marcar como concluída"}
              >
                {task.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
            </div>
          );
        },
      }),
      columnHelper.accessor("title", {
        id: "task",
        header: "Tarefa",
        enableHiding: false,
        size: 280,
        filterFn: 'includesString',
        cell: (info) => {
          const task = info.row.original;
          const depth = info.row.depth;
          const hasChildren = info.row.getCanExpand();
          const isExpanded = info.row.getIsExpanded();

          return (
            <div className="flex h-full w-full items-center gap-2 px-3" style={{ paddingLeft: `${Math.max(12, depth * 24 + 12)}px` }}>
              <div className="flex shrink-0 items-center justify-center h-8 w-6">
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={info.row.getToggleExpandedHandler()}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                ) : null}
              </div>

              <div className="min-w-0 flex-1 flex flex-col justify-center overflow-hidden w-full">
                <div className="flex items-center gap-2 min-w-0 w-full">
                  <TaskTitleInput
                    task={task}
                    saveTaskField={saveTaskField}
                    editingTaskId={editingTaskId}
                    setEditingTaskId={setEditingTaskId}
                  />
                  <TaskNotePopover
                    taskId={task.id}
                    taskTitle={task.title}
                    notes={task.notes}
                    onSave={async (nextNotes) => {
                      const result = await saveTaskField(task.id, { notes: nextNotes });
                      // A failed save rejects so the popover stays open with the text.
                      if (isFailedResult(result)) throw new Error("notes not saved");
                    }}
                  />
                  {(task.googleCalendarEventId || task.google_calendar_event_id) && (
                    <span
                      title="Sincronizado com o Google Calendar"
                      aria-label="Sincronizado com o Google Calendar"
                      className="shrink-0 inline-flex items-center justify-center p-1 rounded-md text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {depth > 0 && (
                    <span className="shrink-0 inline-flex rounded-full bg-[var(--bg-soft-strong)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)] whitespace-nowrap">
                      Subtarefa
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      }),
    ];

    if (activeView === "all") {
      cols.push(
        columnHelper.accessor(
          (row) => {
            const taskProjects = getTaskProjects(row.id);
            return taskProjects.map((p) => p.name).sort().join(", ");
          },
          {
            id: "projects",
            header: "Projetos",
            size: 220,
            sortingFn: "alphanumeric",
            cell: (info) => {
              const task = info.row.original;
              const taskProjects = getTaskProjects(task.id);
              const availableProjects = projects.filter(
                (project) => !taskProjects.find((taskProject) => taskProject.id === project.id)
              );

              return (
                <div className="flex h-full items-center gap-1.5 px-3 flex-wrap py-1">
                  {taskProjects.map((project) => {
                    const tagColor = getProjectTagColorProps(project.color);
                    return (
                      <span
                        key={project.id}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium ${tagColor.className}`}
                        style={tagColor.style}
                      >
                        {project.name}
                        <button
                          onClick={() => removeProjectFromTask(task.id, project.id)}
                          className="text-white/75 transition-colors hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                  <div className="inline-flex items-center gap-1">
                    <Select
                      key={`${task.id}-${projectSelectVersion[task.id] ?? 0}`}
                      onValueChange={(projectId) => {
                        addProjectToTask(task.id, projectId);
                        resetProjectSelect(task.id);
                      }}
                    >
                      <SelectTrigger
                        size="sm"
                        className="h-7 w-7 justify-center border-dashed border-[var(--border-subtle)] bg-transparent hover:bg-[var(--bg-soft)] p-0 text-[var(--text-primary)] [&_svg.pointer-events-none]:hidden"
                        disabled={availableProjects.length === 0}
                      >
                        <Plus className="h-3.5 w-3.5 ml-1.5 text-[var(--text-muted)]" />
                        <SelectValue className="hidden" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            },
          }
        )
      );
    }

    cols.push(
      columnHelper.accessor("dueDate", {
        id: "dueDate",
        header: "Prazo",
        size: 170,
        filterFn: 'includesString',
        cell: (info) => {
          const task = info.row.original;
          const dueStatus = getDueDateStatus(task.dueDate, task.isCompleted);
          const isOverdue = dueStatus === "overdue";
          const isDueToday = dueStatus === "today" && !task.isCompleted;
          const relativeLabel = getRelativeDueDateLabel(task.dueDate);
          const fullDateLabel = formatDueDate(task.dueDate);
          const dueTitle = !fullDateLabel
            ? "Definir prazo"
            : isOverdue
              ? `Prazo vencido em ${fullDateLabel}`
              : isDueToday
                ? `Vence hoje (${fullDateLabel})`
                : `Prazo: ${fullDateLabel}`;

          return (
            <div className="flex h-full items-center px-3">
              <DatePickerField
                value={normalizeDate(task.dueDate)}
                onChange={(nextDate) => saveTaskField(task.id, { dueDate: nextDate })}
                className="w-full"
                title={dueTitle}
                clearButtonClassName="opacity-0 group-hover/task-row:opacity-100 focus-visible:opacity-100"
                formatLabel={() => relativeLabel ?? fullDateLabel}
                icon={
                  isOverdue ? (
                    <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
                  ) : undefined
                }
                buttonClassName={`h-7 flex-1 bg-transparent dark:bg-transparent hover:bg-[var(--bg-soft)] dark:hover:bg-[var(--bg-soft)] hover:border-[var(--border-subtle)] shadow-none text-sm border-transparent dark:border-transparent dark:hover:border-[var(--border-subtle)] focus:bg-[var(--bg-soft-strong)] focus:border-[var(--border-subtle)] px-2 rounded transition-colors text-left ${
                  isOverdue
                    ? "!text-red-600 dark:!text-red-400 font-medium hover:!text-red-700 dark:hover:!text-red-300"
                    : isDueToday
                      ? "!text-amber-600 dark:!text-amber-400 font-medium"
                      : "text-[var(--text-primary)]"
                }`}
                placeholder="Sem prazo"
              />
            </div>
          );
        },
      })
    );

    safeCustomFields.forEach((field) => {
      cols.push(
        columnHelper.accessor((row) => getCustomFieldValueLabel(row, field), {
          id: `cf-${field.id}`,
          header: field.name,
          size: 160,
          filterFn: 'includesString',
          cell: (info) => {
            const task = info.row.original;
            return (
              <div className="flex h-full items-center px-3">
                {renderCustomFieldEditor(task, field)}
              </div>
            );
          },
        })
      );
    });

    cols.push(
      columnHelper.display({
        id: "actions",
        header: "Ações",
        size: 120,
        enableColumnFilter: false,
        enableHiding: false,
        cell: (info) => {
          const task = info.row.original;

          return (
            <div className="flex h-full items-center justify-center gap-1 px-3">
              {onAddSubtask && (
                <button
                  onClick={() => onAddSubtask(task)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-sky-100 hover:text-sky-700"
                  title="Adicionar subtarefa"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
              {onEditTask && (
                <button
                  onClick={() => onEditTask(task)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                  title="Editar tarefa"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              {onDeleteTask && (
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-100 hover:text-rose-700"
                  title="Excluir tarefa"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        },
      })
    );

    // Coluna oculta usada apenas para manter tarefas concluídas no fim da lista,
    // independentemente da ordenação escolhida pelo usuário.
    cols.push(
      columnHelper.accessor((row) => (row.isCompleted ? 1 : 0), {
        id: COMPLETION_SORT_COLUMN_ID,
        header: "",
        enableHiding: false,
        enableColumnFilter: false,
        sortingFn: "basic",
      })
    );

    return cols;
    // Every prop and state the cells read: a missing one makes cells keep stale closures.
  }, [
    activeView,
    projects,
    safeCustomFields,
    getTaskProjects,
    toggleTaskCompletion,
    projectSelectVersion,
    editingTaskId,
    updateTaskInline,
    updateTaskTitle,
    updateTaskDueDate,
    updateTaskNotes,
    getFieldValue,
    updateCustomValue,
    addProjectToTask,
    removeProjectFromTask,
    onEditTask,
    onDeleteTask,
    onAddSubtask,
  ]);

  const effectiveSorting = useMemo<SortingState>(
    () => [COMPLETION_SORT, ...sorting.filter((sort) => sort.id !== COMPLETION_SORT_COLUMN_ID)],
    [sorting]
  );

  // No celular a tabela mostra só status e título; as demais colunas ficariam cortadas.
  const [isNarrowScreen, setIsNarrowScreen] = useState(
    () => typeof window !== "undefined" && window.matchMedia(NARROW_SCREEN_QUERY).matches
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia(NARROW_SCREEN_QUERY);
    const handleChange = () => setIsNarrowScreen(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const columnVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = { [COMPLETION_SORT_COLUMN_ID]: false };
    hiddenColumns.forEach((columnId) => {
      visibility[columnId] = false;
    });
    if (isNarrowScreen) {
      columns.forEach((column) => {
        if (column.id && !ALWAYS_VISIBLE_ON_NARROW_SCREEN.has(column.id)) {
          visibility[column.id] = false;
        }
      });
    }
    return visibility;
  }, [hiddenColumns, isNarrowScreen, columns]);

  const toggleColumnHidden = (columnId: string, isVisible: boolean) => {
    setHiddenColumns((previous) =>
      isVisible ? previous.filter((id) => id !== columnId) : Array.from(new Set([...previous, columnId]))
    );
  };

  const hasActiveFilters = statusFilter !== DEFAULT_STATUS_FILTER || columnFilters.length > 0;

  const clearFilters = () => {
    setStatusFilter(DEFAULT_STATUS_FILTER);
    setColumnFilters([]);
  };

  const submitQuickAdd = async () => {
    const title = quickAddTitle.trim();
    if (!title || !onQuickAdd || isQuickAdding) return;
    setIsQuickAdding(true);
    try {
      const result = await onQuickAdd(title);
      if (!isFailedResult(result)) setQuickAddTitle("");
    } catch {
      // A página já mostra o erro; mantemos o texto para a pessoa tentar de novo.
    } finally {
      setIsQuickAdding(false);
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: effectiveSorting,
      columnFilters,
      expanded,
      columnVisibility,
    },
    onSortingChange: (updater) => {
      setSorting((previous) => {
        const next =
          typeof updater === "function"
            ? updater([COMPLETION_SORT, ...previous])
            : updater;
        return next.filter((sort) => sort.id !== COMPLETION_SORT_COLUMN_ID);
      });
    },
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.subRows,
    columnResizeMode: "onChange",
  });


  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white/90 p-2.5 md:px-4 md:py-3 backdrop-blur [@media(max-height:600px)]:p-1.5">
        <div className="flex w-full flex-wrap items-center justify-between gap-2 md:gap-3">
          {!hideAddTaskButton && onQuickAdd ? (
            <form
              className="hidden min-w-0 flex-1 items-center gap-1.5 md:flex md:max-w-md [@media(max-height:600px)]:hidden"
              onSubmit={(event) => {
                event.preventDefault();
                void submitQuickAdd();
              }}
            >
              <div className="relative min-w-0 flex-1">
                <Plus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand)]" />
                <input
                  type="text"
                  value={quickAddTitle}
                  onChange={(event) => setQuickAddTitle(event.target.value)}
                  placeholder="Adicionar tarefa…"
                  aria-label="Adicionar tarefa rapidamente"
                  disabled={isQuickAdding}
                  className="field h-9 w-full pl-9 pr-9 text-sm placeholder:text-[var(--text-faint)] disabled:opacity-60"
                />
                {quickAddTitle.trim() && (
                  <kbd className="pointer-events-none absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center text-[var(--text-faint)]" title="Enter para adicionar">
                    <CornerDownLeft className="h-3.5 w-3.5" />
                  </kbd>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  addTask(quickAddTitle.trim() || undefined);
                  setQuickAddTitle("");
                }}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
                title="Abrir formulário completo"
                aria-label="Abrir formulário completo de tarefa"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </form>
          ) : (
            !hideAddTaskButton && (
              <button
                onClick={() => addTask()}
                className="hidden h-9 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--brand-strong)] md:inline-flex [@media(max-height:600px)]:hidden"
              >
                <Plus className="h-4 w-4" />
                Adicionar tarefa
              </button>
            )
          )}

          <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-end">
            <div
              role="radiogroup"
              aria-label="Filtrar por status"
              className="inline-flex h-9 flex-1 items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] p-0.5 md:flex-none [@media(max-height:600px)]:h-8"
            >
              {(
                [
                  ["all", "Todas"],
                  ["pending", "Pendentes"],
                  ["completed", "Concluídas"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={statusFilter === value}
                  onClick={() => setStatusFilter(value)}
                  className={`h-full flex-1 rounded-lg px-3 text-sm font-medium transition-colors md:flex-none ${
                    statusFilter === value
                      ? "bg-[var(--bg-panel)] text-[var(--text-primary)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="hidden h-9 items-center justify-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] px-3 text-sm font-medium text-[var(--text-secondary)] shadow-sm transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)] md:inline-flex"
                  title="Escolher colunas visíveis"
                >
                  <Columns3 className="h-4 w-4" />
                  Colunas
                  {hiddenColumns.length > 0 && (
                    <span className="rounded-full bg-[var(--bg-soft-strong)] px-1.5 text-xs text-[var(--text-muted)]">
                      {hiddenColumns.length} oculta{hiddenColumns.length > 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-60 p-2">
                <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Colunas visíveis
                </p>
                <div className="flex flex-col">
                  {table
                    .getAllLeafColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      const header = column.columnDef.header;
                      const label = typeof header === "string" ? header : column.id;
                      const isVisible = !hiddenColumns.includes(column.id);
                      return (
                        <label
                          key={column.id}
                          className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-soft)]"
                        >
                          <Checkbox
                            checked={isVisible}
                            onCheckedChange={(checked) => toggleColumnHidden(column.id, checked === true)}
                          />
                          <span className="truncate">{label}</span>
                        </label>
                      );
                    })}
                </div>
              </PopoverContent>
            </Popover>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)] [@media(max-height:600px)]:h-8"
                title="Limpar filtros"
              >
                <XCircle className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Limpar filtros</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={`min-h-0 flex-1 overflow-auto bg-white ${hideAddTaskButton ? "" : "pb-20 md:pb-0 [@media(max-height:600px)]:pb-20"}`}>
        <div className="flex flex-col min-w-full">
          <div className="flex border-b border-slate-200 bg-slate-100/95 backdrop-blur sticky top-0 z-10" style={{ minWidth: table.getTotalSize(), width: '100%' }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <div key={headerGroup.id} className="flex w-full">
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  return (
                    <div
                      key={header.id}
                      className={`relative flex items-center px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 group shrink-0 overflow-hidden ${header.column.id === 'task' ? 'flex-1' : ''}`}
                      style={{ width: header.column.id === 'task' ? undefined : header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-1 ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-slate-900" : ""}`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <ArrowUpDown className={`h-3.5 w-3.5 ${isSorted ? "text-slate-800" : "text-slate-400 opacity-0 group-hover:opacity-100"}`} />
                          )}
                        </div>
                      )}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none bg-slate-300 opacity-0 hover:opacity-100 ${header.column.getIsResizing() ? "bg-blue-500 opacity-100" : ""
                            }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex flex-col" style={{ minWidth: table.getTotalSize(), width: '100%' }}>
            {table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className={`flex border-b border-slate-100 transition-colors group group/task-row hover:bg-slate-50`}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className={`flex items-center shrink-0 overflow-hidden ${cell.column.id === 'task' ? 'flex-1' : ''}`}
                    style={{ width: cell.column.id === 'task' ? undefined : cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {table.getRowModel().rows.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-slate-500">
              Nenhuma tarefa para os filtros atuais.
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-soft)] px-4 py-2 md:py-3 flex items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-[var(--text-muted)]">
            Total: <span className="font-semibold text-[var(--text-primary)]">{table.getRowModel().rows.length}</span> {table.getRowModel().rows.length === 1 ? 'tarefa' : 'tarefas'}
          </span>
        </div>
      </div>
      {!hideAddTaskButton && (
        <button
          onClick={() => addTask()}
          className="fixed bottom-20 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand)] text-white shadow-lg shadow-black/20 hover:bg-[var(--brand-strong)] active:scale-95 transition-all duration-150 focus:outline-none md:hidden [@media(max-height:600px)]:flex"
          title="Adicionar tarefa"
          aria-label="Adicionar tarefa"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default TaskTable;
