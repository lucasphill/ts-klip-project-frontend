import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Filter,
  Pencil,
  Plus,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import DatePickerField from "./DatePickerField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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
      className="field h-7 w-full bg-transparent px-1 text-sm text-[var(--text-primary)] outline-none hover:bg-[var(--bg-soft)] focus:bg-[var(--bg-soft-strong)] focus:ring-1 focus:ring-slate-200 rounded transition-colors"
      placeholder="-"
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
  addTask: () => void;
  getTaskProjects: (taskId: string) => GetProjectsDto[];
  addProjectToTask: (taskId: string, projectId: string) => void;
  removeProjectFromTask: (taskId: string, projectId: string) => void;
  updateTaskTitle: (taskId: string, title: string) => void;
  updateTaskDueDate: (taskId: string, dueDate: string) => void;
  updateTaskInline?: (taskId: string, updates: { title?: string; dueDate?: string }) => void;
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
  paginationStep?: number;
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
      paginationStep: 25,
    };
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredTaskTableState;
    const statusFilter = isStatusFilter(parsed.statusFilter) ? parsed.statusFilter : DEFAULT_STATUS_FILTER;
    const sorting = Array.isArray(parsed.sorting) ? parsed.sorting : [{ id: "dueDate", desc: false }];
    const expanded = typeof parsed.expanded === "object" && parsed.expanded !== null ? parsed.expanded : {};
    const paginationStep = typeof parsed.paginationStep === "number" ? parsed.paginationStep : 25;

    return { statusFilter, sorting, expanded, paginationStep };
  } catch {
    return {
      statusFilter: DEFAULT_STATUS_FILTER,
      sorting: [{ id: "dueDate", desc: false }] as SortingState,
      expanded: {} as ExpandedState,
      paginationStep: 25,
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

const normalizeDate = (value?: string | null) => {
  if (!value) return "";
  return String(value).split("T")[0];
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
  updateTaskInline,
  onEditTask,
  onDeleteTask,
  onAddSubtask,
  hideAddTaskButton = false,
}: TaskTableProps) => {
  const location = useLocation();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>(DEFAULT_STATUS_FILTER);
  const [projectSelectVersion, setProjectSelectVersion] = useState<Record<string, number>>({});

  // TanStack Table State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pageSize, setPageSize] = useState(25);
  const [paginationStep, setPaginationStep] = useState(25);

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
    setPaginationStep(parsedState.paginationStep);
    setPageSize(parsedState.paginationStep);
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
      paginationStep,
    };

    window.localStorage.setItem(tableStateStorageKey, JSON.stringify(payload));
  }, [statusFilter, sorting, expanded, paginationStep, tableStateStorageKey]);

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
      return value ? "sim" : "nao";
    }
    return String(value ?? "");
  };

  const resetProjectSelect = (taskId: string) => {
    setProjectSelectVersion((previous) => ({
      ...previous,
      [taskId]: (previous[taskId] ?? 0) + 1,
    }));
  };

  const saveTaskField = (taskId: string, updates: { title?: string; dueDate?: string }) => {
    if (updateTaskInline) {
      updateTaskInline(taskId, updates);
      return;
    }

    if (updates.title !== undefined) {
      updateTaskTitle(taskId, updates.title);
    }

    if (updates.dueDate !== undefined) {
      updateTaskDueDate(taskId, updates.dueDate);
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
          {value ? "Sim" : "Nao"}
        </span>
      );
    }
    return <span className="text-sm text-slate-700">{String(value ?? "-")}</span>;
  };

  const renderCustomFieldEditor = (task: TaskTableTask, field: GetCustomFieldDefinitionDto) => {
    const fieldValue = getResolvedFieldValue(task, field);
    const fieldOptions = getFieldOptions(field);
    if (!updateCustomValue) {
      return renderReadOnlyFieldValue(field, fieldValue);
    }

    if (field.type === "enum") {
      return (
        <select
          className="field h-7 w-full bg-transparent px-1 text-sm text-[var(--text-primary)] outline-none hover:bg-[var(--bg-soft)] focus:bg-[var(--bg-soft-strong)] focus:ring-1 focus:ring-slate-200 rounded transition-colors"
          value={String(fieldValue ?? "")}
          onChange={(event) => updateCustomValue(task.id, field.id, event.target.value)}
        >
          <option value="">-</option>
          {fieldOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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
          {fieldValue ? "Sim" : "Nao"}
        </label>
      );
    }

    if (field.type === "date") {
      return (
        <DatePickerField
          value={String(fieldValue ?? "")}
          onChange={(nextDate) => updateCustomValue(task.id, field.id, nextDate)}
          className="w-full"
          buttonClassName="field h-7 flex-1 bg-transparent hover:bg-[var(--bg-soft)] text-sm text-[var(--text-primary)] border-transparent focus:bg-[var(--bg-soft-strong)] focus:border-[var(--border-subtle)] px-2 rounded transition-colors text-left"
          placeholder="Sem data"
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
        header: "Status",
        size: 80,
        enableColumnFilter: false,
        cell: (info) => {
          const task = info.row.original;
          return (
            <div className="flex h-full items-center px-3">
              <button
                onClick={() => toggleTaskCompletion(task.id)}
                className="text-slate-400 transition-colors hover:text-emerald-600"
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
        size: 350,
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
            size: 280,
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
        size: 150,
        filterFn: 'includesString',
        cell: (info) => {
          const task = info.row.original;
          return (
            <div className="flex h-full items-center px-3">
              <DatePickerField
                value={normalizeDate(task.dueDate)}
                onChange={(nextDate) => saveTaskField(task.id, { dueDate: nextDate })}
                className="w-full"
                buttonClassName="field h-7 flex-1 bg-transparent hover:bg-[var(--bg-soft)] text-sm text-[var(--text-primary)] border-transparent focus:bg-[var(--bg-soft-strong)] focus:border-[var(--border-subtle)] px-2 rounded transition-colors text-left"
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
          size: 200,
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
        size: 140,
        enableColumnFilter: false,
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

    return cols;
  }, [activeView, projects, safeCustomFields, getTaskProjects, toggleTaskCompletion, projectSelectVersion]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      expanded,
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.subRows,
    columnResizeMode: "onChange",
  });

  const handleLoadMore = () => {
    setPageSize((prev) => prev + paginationStep);
  };

  const handlePaginationStepChange = (value: string) => {
    const step = Number(value);
    setPaginationStep(step);
    setPageSize(step); // reseta para mostrar apenas o step inicial
  };


  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white/90 p-2.5 md:p-4 backdrop-blur [@media(max-height:600px)]:p-1.5">
        <div className="flex items-center justify-between gap-3 w-full flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-4">
            {!hideAddTaskButton && (
              <button
                onClick={addTask}
                className="h-9 hidden md:inline-flex [@media(max-height:600px)]:hidden items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Adicionar tarefa
              </button>
            )}
            <p className="text-sm text-slate-500 hidden sm:block [@media(max-height:600px)]:hidden">
              Mostrando <span className="font-semibold text-slate-700">{table.getPrePaginationRowModel().rows.length}</span> tarefas
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="h-9 [@media(max-height:600px)]:h-8 flex-1 sm:flex-none inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm hover:border-slate-300 transition-colors">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                className="bg-transparent text-sm text-slate-600 outline-none cursor-pointer pr-1 font-medium hover:text-slate-900 transition-colors w-full"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as TaskStatusFilter)}
              >
                <option value="all">Todas</option>
                <option value="completed">Concluídas</option>
                <option value="pending">Pendentes</option>
              </select>
            </div>

            <button
              onClick={() => {
                setStatusFilter(DEFAULT_STATUS_FILTER);
                setColumnFilters([]);
                setSorting([]);
              }}
              className="h-9 [@media(max-height:600px)]:h-8 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 shadow-sm whitespace-nowrap"
              title="Limpar filtros"
            >
              <XCircle className="h-4 w-4 shrink-0" />
              <span className="hidden xs:inline">Limpar</span>
              <span className="hidden sm:inline"> filtros</span>
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-white">
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
                className={`flex border-b border-slate-100 transition-colors group hover:bg-slate-50`}
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
        {/* Lado esquerdo: Controle de itens por página */}
        <div className="hidden md:flex [@media(max-height:600px)]:hidden flex-1 justify-start items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)]">Itens por página:</span>
            <select
              value={paginationStep}
              onChange={(e) => handlePaginationStepChange(e.target.value)}
              className="h-7 px-2 text-xs font-semibold rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-soft-strong)] hover:border-[var(--border-muted)] outline-none cursor-pointer transition-all focus:ring-1 focus:ring-[var(--brand)]"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Centro: Botão "Mostrar mais" */}
        <div className="flex-1 flex justify-center">
          {table.getCanNextPage() ? (
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center justify-center gap-1.5 h-7 px-4 text-xs font-semibold rounded-lg bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)] shadow-sm transition-all active:scale-95 duration-150 focus:outline-none focus:ring-1 focus:ring-[var(--brand)] focus:ring-offset-1"
            >
              <span>Mostrar mais tarefas</span>
              <ChevronDown className="h-3.5 w-3.5 text-white/90" />
            </button>
          ) : (
            <button
              disabled
              className="inline-flex items-center justify-center gap-1 h-7 px-3 text-xs font-semibold rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-muted)] opacity-50 cursor-not-allowed shadow-none transition-none focus:outline-none whitespace-nowrap truncate"
            >
              <span>
                {table.getPrePaginationRowModel().rows.length === 0
                  ? "Sem tarefas"
                  : "Todas as tarefas exibidas"}
              </span>
            </button>
          )}
        </div>

        {/* Lado direito: Label fixa de contagem */}
        <div className="hidden md:flex [@media(max-height:600px)]:hidden flex-1 justify-end items-center">
          <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">
            Exibindo {table.getRowModel().rows.length} de {table.getPrePaginationRowModel().rows.length}
          </span>
        </div>
      </div>
      {!hideAddTaskButton && (
        <button
          onClick={addTask}
          className="fixed bottom-20 right-6 z-45 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all duration-150 focus:outline-none md:hidden [@media(max-height:600px)]:flex"
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
