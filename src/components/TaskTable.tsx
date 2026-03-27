import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowUpDown,
  CircleHelp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import DatePickerField from "./DatePickerField";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  Cell,
  Column,
  Row,
  TableHeader,
  type SortDescriptor,
} from "react-aria-components";
import type {
  CustomFieldValue,
  GetCustomFieldDefinitionDto,
  GetProjectsDto,
  GetTasksDto,
} from "../types/apiTypes";

type TaskTableTask = GetTasksDto & {
  customFields?: Record<string, CustomFieldValue>;
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
  hideAddTaskButton?: boolean;
}

type TaskStatusFilter = "all" | "completed" | "pending";

type StoredTaskTableState = {
  version?: number;
  statusFilter?: TaskStatusFilter;
  sortColumn?: string;
  sortDirection?: SortDescriptor["direction"];
};

const TASK_TABLE_STORAGE_PREFIX = "klip:task-table-state";
const TASK_TABLE_STORAGE_VERSION = 1;

const DEFAULT_STATUS_FILTER: TaskStatusFilter = "all";
const DEFAULT_SORT_DESCRIPTOR: SortDescriptor = {
  column: "dueDate",
  direction: "ascending",
};

const isStatusFilter = (value: unknown): value is TaskStatusFilter =>
  value === "all" || value === "completed" || value === "pending";

const isSortDirection = (value: unknown): value is SortDescriptor["direction"] =>
  value === "ascending" || value === "descending";

const parseStoredTaskTableState = (rawValue: string | null) => {
  if (!rawValue) {
    return {
      statusFilter: DEFAULT_STATUS_FILTER,
      sortDescriptor: DEFAULT_SORT_DESCRIPTOR,
    };
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredTaskTableState;

    const statusFilter = isStatusFilter(parsed.statusFilter) ? parsed.statusFilter : DEFAULT_STATUS_FILTER;
    const direction = isSortDirection(parsed.sortDirection) ? parsed.sortDirection : DEFAULT_SORT_DESCRIPTOR.direction;
    const column =
      typeof parsed.sortColumn === "string" && parsed.sortColumn.trim().length > 0
        ? parsed.sortColumn
        : String(DEFAULT_SORT_DESCRIPTOR.column);

    return {
      statusFilter,
      sortDescriptor: {
        column,
        direction,
      } satisfies SortDescriptor,
    };
  } catch {
    return {
      statusFilter: DEFAULT_STATUS_FILTER,
      sortDescriptor: DEFAULT_SORT_DESCRIPTOR,
    };
  }
};

const getColorDotProps = (color?: string): { className: string; style?: CSSProperties } | null => {
  if (!color) return null;

  if (color.startsWith("bg-")) {
    return { className: color };
  }

  return {
    className: "",
    style: { backgroundColor: color },
  };
};

const normalizeDate = (value?: string | null) => {
  if (!value) return "";
  return String(value).split("T")[0];
};

const compareText = (left: string, right: string) =>
  left.localeCompare(right, "pt-BR", { sensitivity: "base", numeric: true });

const matchesQuery = (value: string, query: string) =>
  value.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"));

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
  hideAddTaskButton = false,
}: TaskTableProps) => {
  const location = useLocation();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [cfDrafts, setCfDrafts] = useState<Record<string, string>>({});
  const cfTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>(DEFAULT_STATUS_FILTER);
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});
  const [areFiltersExpanded, setAreFiltersExpanded] = useState(false);
  const [projectSelectVersion, setProjectSelectVersion] = useState<Record<string, number>>({});
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>(DEFAULT_SORT_DESCRIPTOR);
  const skipNextTableStatePersist = useRef(false);

  const tableStateStorageKey = useMemo(
    () =>
      `${TASK_TABLE_STORAGE_PREFIX}:v${TASK_TABLE_STORAGE_VERSION}:${location.pathname}:${activeView}`,
    [location.pathname, activeView]
  );

  useEffect(() => {
    return () => {
      Object.values(cfTimers.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    skipNextTableStatePersist.current = true;
    const stored = window.localStorage.getItem(tableStateStorageKey);
    const parsedState = parseStoredTaskTableState(stored);
    setStatusFilter(parsedState.statusFilter);
    setSortDescriptor(parsedState.sortDescriptor);
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
      sortColumn: String(sortDescriptor.column ?? DEFAULT_SORT_DESCRIPTOR.column),
      sortDirection: sortDescriptor.direction ?? DEFAULT_SORT_DESCRIPTOR.direction,
    };

    window.localStorage.setItem(tableStateStorageKey, JSON.stringify(payload));
  }, [statusFilter, sortDescriptor, tableStateStorageKey]);

  const safeCustomFields = Array.isArray(activeCustomFields) ? activeCustomFields : [];

  const getIsCompleted = (task: GetTasksDto) => task?.isCompleted ?? false;
  const getTitle = (task: GetTasksDto) => task?.title ?? "";
  const getDueDate = (task: GetTasksDto) => normalizeDate(task?.dueDate);
  const getCreatedAt = (task: GetTasksDto) => normalizeDate(task?.createdAt) || "";

  const getFieldOptions = (field: GetCustomFieldDefinitionDto) => {
    if (Array.isArray(field.options)) {
      return field.options;
    }

    return String(field.options ?? "")
      .split(",")
      .map((option) => option.trim())
      .filter(Boolean);
  };

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

  const setColumnSearchValue = (columnKey: string, value: string) => {
    setColumnSearch((previous) => ({ ...previous, [columnKey]: value }));
  };

  const resetProjectSelect = (taskId: string) => {
    setProjectSelectVersion((previous) => ({
      ...previous,
      [taskId]: (previous[taskId] ?? 0) + 1,
    }));
  };

  const filteredTasks = useMemo(() => {
    let taskList = [...visibleTasks];

    if (statusFilter === "completed") {
      taskList = taskList.filter((task) => getIsCompleted(task));
    }

    if (statusFilter === "pending") {
      taskList = taskList.filter((task) => !getIsCompleted(task));
    }

    taskList = taskList.filter((task) => {
      const taskQuery = (columnSearch.task ?? "").trim();
      const projectsQuery = (columnSearch.projects ?? "").trim();
      const dueDateQuery = (columnSearch.dueDate ?? "").trim();

      if (taskQuery && !matchesQuery(getTitle(task), taskQuery)) {
        return false;
      }

      if (activeView === "all" && projectsQuery) {
        const projectsLabel = getTaskProjects(task.id)
          .map((project) => project.name)
          .join(" ");
        if (!matchesQuery(projectsLabel, projectsQuery)) {
          return false;
        }
      }

      if (dueDateQuery && !matchesQuery(getDueDate(task), dueDateQuery)) {
        return false;
      }

      for (const field of safeCustomFields) {
        const fieldQuery = (columnSearch[`cf-${field.id}`] ?? "").trim();
        if (!fieldQuery) continue;

        const fieldLabel = getCustomFieldValueLabel(task, field);
        if (!matchesQuery(fieldLabel, fieldQuery)) {
          return false;
        }
      }

      return true;
    });

    const directionFactor = sortDescriptor.direction === "descending" ? -1 : 1;
    const sortColumn = String(sortDescriptor.column ?? "dueDate");

    taskList.sort((left, right) => {
      if (sortColumn === "status") {
        return (Number(getIsCompleted(left)) - Number(getIsCompleted(right))) * directionFactor;
      }

      if (sortColumn === "task") {
        return compareText(getTitle(left), getTitle(right)) * directionFactor;
      }

      if (sortColumn === "projects") {
        const leftProjects = getTaskProjects(left.id).map((project) => project.name).join(" ");
        const rightProjects = getTaskProjects(right.id).map((project) => project.name).join(" ");
        return compareText(leftProjects, rightProjects) * directionFactor;
      }

      if (sortColumn === "dueDate") {
        return compareText(getDueDate(left), getDueDate(right)) * directionFactor;
      }

      if (sortColumn.startsWith("cf-")) {
        const fieldId = sortColumn.replace("cf-", "");
        const field = safeCustomFields.find((item) => item.id === fieldId);
        if (!field) return 0;
        return compareText(getCustomFieldValueLabel(left, field), getCustomFieldValueLabel(right, field)) * directionFactor;
      }

      if (sortColumn === "createdAt") {
        return compareText(getCreatedAt(left), getCreatedAt(right)) * directionFactor;
      }

      return 0;
    });

    return taskList;
  }, [visibleTasks, statusFilter, columnSearch, sortDescriptor, safeCustomFields]);

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

  const commitDraft = (key: string, commit: (value: string) => void) => {
    const value = cfDrafts[key];
    if (value === undefined) return;

    commit(value);
    setCfDrafts((previous) => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const cancelDraft = (key: string) => {
    setCfDrafts((previous) => {
      const next = { ...previous };
      delete next[key];
      return next;
    });
    if (cfTimers.current[key]) {
      clearTimeout(cfTimers.current[key]);
      delete cfTimers.current[key];
    }
  };

  const queueDraftCommit = (key: string, value: string, commit: (next: string) => void) => {
    setCfDrafts((previous) => ({ ...previous, [key]: value }));
    if (cfTimers.current[key]) {
      clearTimeout(cfTimers.current[key]);
    }
    cfTimers.current[key] = setTimeout(() => {
      commit(value);
      setCfDrafts((previous) => {
        const next = { ...previous };
        delete next[key];
        return next;
      });
      delete cfTimers.current[key];
    }, 1200);
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
    const key = `${task.id}::${field.id}`;
    const draft = cfDrafts[key];

    if (!updateCustomValue) {
      return renderReadOnlyFieldValue(field, fieldValue);
    }

    if (field.type === "enum") {
      return (
        <select
          className="field h-9 w-full bg-white px-2 text-sm"
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
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
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
          buttonClassName="field h-9 bg-white text-sm"
          placeholder="Sem data"
        />
      );
    }

    return (
      <input
        type={field.type === "number" ? "number" : "text"}
        value={draft !== undefined ? draft : String(fieldValue ?? "")}
        onChange={(event) => {
          queueDraftCommit(key, event.target.value, (nextValue) => {
            if (field.type === "number") {
              updateCustomValue(task.id, field.id, nextValue === "" ? undefined : Number(nextValue));
            } else {
              updateCustomValue(task.id, field.id, nextValue);
            }
          });
        }}
        onBlur={() => {
          if (cfTimers.current[key]) {
            clearTimeout(cfTimers.current[key]);
            delete cfTimers.current[key];
          }

          commitDraft(key, (nextValue) => {
            if (field.type === "number") {
              updateCustomValue(task.id, field.id, nextValue === "" ? undefined : Number(nextValue));
            } else {
              updateCustomValue(task.id, field.id, nextValue);
            }
          });
        }}
        className="field h-9 w-full bg-white px-2 text-sm"
        placeholder="-"
      />
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white/90 p-4 backdrop-blur">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <p className="text-sm text-slate-500">
            Mostrando <span className="font-semibold text-slate-700">{filteredTasks.length}</span> tarefas
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                className="bg-transparent text-sm text-slate-700 outline-none"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as TaskStatusFilter)}
              >
                <option value="all">Todas</option>
                <option value="completed">Concluidas</option>
                <option value="pending">Pendentes</option>
              </select>
            </div>

            <button
              onClick={() => setAreFiltersExpanded((previous) => !previous)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
            >
              {areFiltersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {areFiltersExpanded ? "Esconder filtros" : "Mostrar filtros"}
            </button>

            <button
              onClick={() => {
                setStatusFilter(DEFAULT_STATUS_FILTER);
                setColumnSearch({});
                setSortDescriptor(DEFAULT_SORT_DESCRIPTOR);
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
            >
              <XCircle className="h-4 w-4" />
              Limpar filtros
            </button>
          </div>
        </div>

        {areFiltersExpanded && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="relative w-full min-w-[180px] flex-1 md:w-auto md:max-w-[240px]">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                className="field h-9 w-full bg-white pl-8 pr-2 text-sm"
                placeholder="Buscar na coluna Tarefa"
                value={columnSearch.task ?? ""}
                onChange={(event) => setColumnSearchValue("task", event.target.value)}
              />
            </div>

            {activeView === "all" && (
              <div className="relative w-full min-w-[180px] flex-1 md:w-auto md:max-w-[240px]">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  className="field h-9 w-full bg-white pl-8 pr-2 text-sm"
                  placeholder="Buscar na coluna Projetos"
                  value={columnSearch.projects ?? ""}
                  onChange={(event) => setColumnSearchValue("projects", event.target.value)}
                />
              </div>
            )}

            <div className="relative w-full min-w-[180px] flex-1 md:w-auto md:max-w-[220px]">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                className="field h-9 w-full bg-white pl-8 pr-2 text-sm"
                placeholder="Buscar na coluna Prazo"
                value={columnSearch.dueDate ?? ""}
                onChange={(event) => setColumnSearchValue("dueDate", event.target.value)}
              />
            </div>

            {safeCustomFields.map((field) => (
              <div key={field.id} className="relative w-full min-w-[180px] flex-1 md:w-auto md:max-w-[240px]">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  className="field h-9 w-full bg-white pl-8 pr-2 text-sm"
                  placeholder={`Buscar em ${field.name}`}
                  value={columnSearch[`cf-${field.id}`] ?? ""}
                  onChange={(event) => setColumnSearchValue(`cf-${field.id}`, event.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-white">
        <Table
          aria-label="Tabela de tarefas"
          className="min-w-[980px] w-full border-separate border-spacing-0"
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
        >
          <TableHeader className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur">
            <Column
              id="status"
              allowsSorting
              className="w-14 border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
            >
              {({ sortDirection }) => (
                <span className="inline-flex items-center gap-1">
                  Status
                  <ArrowUpDown className={`h-3.5 w-3.5 ${sortDirection ? "text-slate-700" : "text-slate-400"}`} />
                </span>
              )}
            </Column>
            <Column
              id="task"
              allowsSorting
              className="min-w-[240px] border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
            >
              {({ sortDirection }) => (
                <span className="inline-flex items-center gap-1">
                  Tarefa
                  <ArrowUpDown className={`h-3.5 w-3.5 ${sortDirection ? "text-slate-700" : "text-slate-400"}`} />
                </span>
              )}
            </Column>
            {activeView === "all" && (
              <Column
                id="projects"
                allowsSorting
                className="w-72 border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                {({ sortDirection }) => (
                  <span className="inline-flex items-center gap-1">
                    Projetos
                    <ArrowUpDown className={`h-3.5 w-3.5 ${sortDirection ? "text-slate-700" : "text-slate-400"}`} />
                  </span>
                )}
              </Column>
            )}
            <Column
              id="dueDate"
              allowsSorting
              className="w-44 border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
            >
              {({ sortDirection }) => (
                <span className="inline-flex items-center gap-1">
                  Prazo
                  <ArrowUpDown className={`h-3.5 w-3.5 ${sortDirection ? "text-slate-700" : "text-slate-400"}`} />
                </span>
              )}
            </Column>
            {safeCustomFields.map((field) => (
              <Column
                key={field.id}
                id={`cf-${field.id}`}
                allowsSorting
                className="w-52 border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                {({ sortDirection }) => (
                  <span className="inline-flex items-center gap-1">
                    {field.name}
                    <ArrowUpDown className={`h-3.5 w-3.5 ${sortDirection ? "text-slate-700" : "text-slate-400"}`} />
                  </span>
                )}
              </Column>
            ))}
            <Column id="actions" className="w-28 border-b border-slate-200 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
              Acoes
            </Column>
          </TableHeader>

          <TableBody>
            {filteredTasks.map((task) => {
              const titleKey = `${task.id}::__title`;
              const titleDraft = cfDrafts[titleKey];
              const titleValue = titleDraft !== undefined ? titleDraft : getTitle(task);
              const isEditing = editingTaskId === task.id || titleDraft !== undefined;
              const taskProjects = getTaskProjects(task.id);
              const availableProjects = projects.filter(
                (project) => !taskProjects.find((taskProject) => taskProject.id === project.id)
              );

              return (
                <Row
                  id={task.id}
                  key={task.id}
                  className={`group transition-colors ${isEditing ? "bg-sky-50/70" : "hover:bg-slate-50"}`}
                >
                  <Cell className="border-b border-slate-100 px-3 py-2">
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className="text-slate-400 transition-colors hover:text-emerald-600"
                    >
                      {getIsCompleted(task) ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                  </Cell>

                  <Cell className="border-b border-slate-100 px-3 py-2">
                    <input
                      type="text"
                      value={titleValue}
                      placeholder="Escreva uma tarefa..."
                      onFocus={() => setEditingTaskId(task.id)}
                      onBlur={() => {
                        setEditingTaskId(null);
                        if (cfTimers.current[titleKey]) {
                          clearTimeout(cfTimers.current[titleKey]);
                          delete cfTimers.current[titleKey];
                        }
                        commitDraft(titleKey, (nextValue) => saveTaskField(task.id, { title: nextValue }));
                      }}
                      onChange={(event) => {
                        queueDraftCommit(titleKey, event.target.value, (nextValue) => saveTaskField(task.id, { title: nextValue }));
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.preventDefault();
                          cancelDraft(titleKey);
                          setEditingTaskId(null);
                          event.currentTarget.blur();
                        }

                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                      }}
                      className={`w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm outline-none transition-colors focus:border-slate-300 focus:bg-white ${getIsCompleted(task) ? "text-slate-400 line-through" : "text-slate-800"
                        }`}
                    />
                  </Cell>

                  {activeView === "all" && (
                    <Cell className="border-b border-slate-100 px-3 py-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {taskProjects.map((project) => {
                          const colorDot = getColorDotProps(project.color);

                          return (
                            <span
                              key={project.id}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
                            >
                              <span className={`h-2 w-2 rounded-full ${colorDot?.className ?? ""}`} style={colorDot?.style} />
                              {project.name}
                              <button
                                onClick={() => removeProjectFromTask(task.id, project.id)}
                                className="text-slate-400 transition-colors hover:text-rose-600"
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
                              className="h-7 w-7 justify-center border-dashed border-slate-300 bg-white p-0 text-slate-700 [&_svg.pointer-events-none]:hidden"
                              disabled={availableProjects.length === 0}
                              aria-label="Adicionar projeto"
                            >
                              <Plus className="h-3.5 w-3.5 ml-1.5 text-slate-500" />
                              <span className="sr-only">
                                {availableProjects.length > 0 ? "Adicionar projeto" : "Sem projetos disponiveis"}
                              </span>
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

                          <HoverCard openDelay={150}>
                            <HoverCardTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Ajuda sobre vinculo de projetos"
                              >
                                <CircleHelp className="h-3.5 w-3.5" />
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-72">
                              Vincule a tarefa a mais de um projeto para facilitar filtros e acompanhamento entre times.
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      </div>
                    </Cell>
                  )}

                  <Cell className="border-b border-slate-100 px-3 py-2">
                    <DatePickerField
                      value={getDueDate(task)}
                      onChange={(nextDate) => saveTaskField(task.id, { dueDate: nextDate })}
                      className="w-full"
                      buttonClassName="field h-9 bg-white text-sm"
                      placeholder="Sem prazo"
                    />
                  </Cell>

                  {safeCustomFields.map((field) => (
                    <Cell key={field.id} className="border-b border-slate-100 px-3 py-2">
                      {renderCustomFieldEditor(task, field)}
                    </Cell>
                  ))}

                  <Cell className="border-b border-slate-100 px-3 py-2">
                    <div className="flex items-center justify-center gap-1">
                      {titleDraft !== undefined && (
                        <>
                          <button
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => commitDraft(titleKey, (nextValue) => saveTaskField(task.id, { title: nextValue }))}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            title="Salvar titulo"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => cancelDraft(titleKey)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                            title="Cancelar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
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
                  </Cell>
                </Row>
              );
            })}
          </TableBody>
        </Table>

        {filteredTasks.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-slate-500">Nenhuma tarefa para os filtros atuais.</div>
        )}
      </div>

      {!hideAddTaskButton && (
        <div className="border-t border-slate-200 bg-white px-3 py-3">
          <button
            onClick={addTask}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Adicionar tarefa
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskTable;
