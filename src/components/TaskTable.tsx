import { useMemo, useState, type CSSProperties } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  Hash,
  Type,
  List,
  X,
  Pencil,
  Trash2,
  Filter,
  ArrowUpDown,
  XCircle
} from 'lucide-react';
import type {
  CustomFieldValue,
  GetCustomFieldDefinitionDto,
  GetProjectsDto,
  GetTasksDto,
} from '../types/apiTypes';

type TaskTableTask = GetTasksDto & {
  customFields?: Record<string, CustomFieldValue>;
};

interface TaskTableProps {
  activeView: string; // mostra todos ou só de um projeto específico, recebe o id do projeto ou "all"
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
}

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
  onDeleteTask
}: TaskTableProps) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [draftById, setDraftById] = useState<Record<string, { title?: string; dueDate?: string }>>({});

  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'title' | 'created'>('due_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const getIsCompleted = (t: GetTasksDto) => (t?.isCompleted ?? false);
  const getDueDate = (t: GetTasksDto) => (t?.dueDate ?? '');
  const getTitle = (t: GetTasksDto) => (t?.title ?? '');
  const safeCustomFields = Array.isArray(activeCustomFields) ? activeCustomFields : [];
  const getFieldOptions = (field: GetCustomFieldDefinitionDto) => {
    if (Array.isArray(field.options)) {
      return field.options;
    }

    return String(field.options ?? '')
      .split(',')
      .map((option) => option.trim())
      .filter(Boolean);
  };

  const getColorDotProps = (color?: string): { className: string; style?: CSSProperties } | null => {
    if (!color) return null;

    if (color.startsWith('bg-')) {
      return { className: color };
    }

    return {
      className: '',
      style: { backgroundColor: color },
    };
  };

  const getResolvedFieldValue = (task: TaskTableTask, field: GetCustomFieldDefinitionDto): CustomFieldValue => {
    if (getFieldValue) {
      return getFieldValue(task.id, field.id);
    }

    return task.customFields?.[field.id] ?? task.customFields?.[field.name] ?? '';
  };

  const renderReadOnlyFieldValue = (field: GetCustomFieldDefinitionDto, value: CustomFieldValue) => {
    if (field.type === 'boolean') {
      return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${value ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {value ? 'Sim' : 'Nao'}
        </span>
      );
    }

    return <span className="text-sm text-slate-700">{String(value ?? '-')}</span>;
  };

  const filteredTasks = useMemo(() => {
    let list = [...visibleTasks];

    if (statusFilter === 'completed') {
      list = list.filter(t => getIsCompleted(t));
    } else if (statusFilter === 'pending') {
      list = list.filter(t => !getIsCompleted(t));
    }

    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'title') {
        return String(getTitle(a)).localeCompare(String(getTitle(b))) * dir;
      }
      if (sortBy === 'due_date') {
        return String(getDueDate(a)).localeCompare(String(getDueDate(b))) * dir;
      }
      return String(a.id || '').localeCompare(String(b.id || '')) * dir;
    });

    return list;
  }, [visibleTasks, statusFilter, sortBy, sortDir]);

  const startEdit = (task: GetTasksDto) => {
    setEditingTaskId(task.id);
    setDraftById(prev => ({
      ...prev,
      [task.id]: {
        title: task.title ?? '',
        dueDate: task.dueDate ?? ''
      }
    }));
  };

  const cancelEdit = (taskId: string) => {
    setEditingTaskId(prev => (prev === taskId ? null : prev));
    setDraftById(prev => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  const confirmEdit = (taskId: string) => {
    const draft = draftById[taskId];
    if (!draft) return;
    if (updateTaskInline) {
      updateTaskInline(taskId, draft);
    } else {
      if (updateTaskTitle && draft.title !== undefined) {
        updateTaskTitle(taskId, draft.title);
      }
      if (updateTaskDueDate && draft.dueDate !== undefined) {
        updateTaskDueDate(taskId, draft.dueDate);
      }
    }
    cancelEdit(taskId);
  };

  return (
    <div className="min-w-full inline-block align-middle">
      {/* Filters */}
      <div className="w-full p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Mostrando <span className="font-semibold text-slate-600">{filteredTasks.length}</span> tarefas
          </div>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <Filter className="w-4 h-4 text-slate-400 mr-2" />
              <select
                className="text-sm bg-transparent focus:outline-none text-slate-700 pr-6"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'completed' | 'pending')}
              >
                <option value="all">Todas</option>
                <option value="completed">Concluídas</option>
                <option value="pending">Pendentes</option>
              </select>
            </div>
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <ArrowUpDown className="w-4 h-4 text-slate-400 mr-2" />
              <select
                className="text-sm bg-transparent focus:outline-none text-slate-700 pr-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'due_date' | 'title' | 'created')}
              >
                <option value="due_date">Prazo</option>
                <option value="title">Título</option>
                <option value="created">Criação</option>
              </select>
              <select
                className="text-sm bg-transparent focus:outline-none text-slate-700 pr-2 ml-2"
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
            <button
              onClick={() => {
                setStatusFilter('all');
                setSortBy('due_date');
                setSortDir('asc');
              }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="Limpar filtros"
            >
              <XCircle className="w-4 h-4" />
              Limpar filtros
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {/* <div className="flex flex-wrap items-center gap-2 mt-3 justify-end">
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-full">
              Status: {statusFilter === 'completed' ? 'Concluídas' : 'Pendentes'}
            </span>
          )}
          {(sortBy !== 'due_date' || sortDir !== 'asc') && (
            <span className="inline-flex items-center gap-1 text-xs bg-slate-50 text-slate-700 border border-slate-200 px-2 py-1 rounded-full">
              Ordenar: {sortBy === 'title' ? 'Título' : sortBy === 'created' ? 'Criação' : 'Prazo'} • {sortDir === 'asc' ? 'Asc' : 'Desc'}
            </span>
          )}
        </div> */}
      </div>
      <div className="border-b border-slate-200">
        {/* TABLE HEADER */}
        <div className="flex items-center bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200 shadow-sm">
          <div className="w-10 px-4 py-3 text-center"></div>
          <div className="flex-1 px-4 py-3 border-r border-slate-100">Nome da Tarefa</div>

          {/* Conditionally Render Projects Column Header */}
          {activeView === 'all' && (
            <div className="w-64 px-4 py-3 border-r border-slate-100">Projetos</div>
          )}

          <div className="w-40 px-4 py-3 border-r border-slate-100">Prazo</div>

          {/* Dynamic Headers for Custom Fields */}
          {safeCustomFields.map((field: any) => (
            <div key={field.id} className="w-48 px-4 py-3 border-r border-slate-100 flex items-center gap-2">
              {field.type === 'number' && <Hash className="w-3 h-3" />}
              {field.type === 'text' && <Type className="w-3 h-3" />}
              {field.type === 'enum' && <List className="w-3 h-3" />}
              {field.type === 'date' && <Calendar className="w-3 h-3" />}
              {field.type === 'boolean' && <CheckCircle2 className="w-3 h-3" />}
              {field.name}
            </div>
          ))}

          {/* Actions Column */}
          <div className="w-24 px-4 py-3 text-center">Ações</div>
        </div>

        {/* TABLE BODY */}
        <div>
          {filteredTasks.map((task: any) => {
            const isEditing = editingTaskId === task.id;
            const draft = draftById[task.id] || {};
            return (
              <div
                key={task.id}
                className={`group flex items-center border-b border-slate-100 last:border-0 transition-all ${isEditing ? 'bg-indigo-50/60 ring-1 ring-indigo-200/60 shadow-sm' : 'hover:bg-slate-50'
                  }`}
              >

                {/* Checkbox Column */}
                <div className="w-10 px-4 py-2 flex justify-center shrink-0">
                  <button onClick={() => toggleTaskCompletion(task.id)} className="text-slate-400 hover:text-green-600 transition-colors">
                    {getIsCompleted(task) ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5" />}
                  </button>
                </div>

                {/* Task Title Column */}
                <div className="flex-1 px-4 py-2 border-r border-slate-100 shrink-0 min-w-[200px]">
                  <input
                    type="text"
                    value={isEditing ? (draft.title ?? '') : getTitle(task)}
                    placeholder="Escreva uma tarefa..."
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!isEditing) startEdit(task);
                      setDraftById(prev => ({
                        ...prev,
                        [task.id]: { ...prev[task.id], title: val }
                      }));
                    }}
                    onFocus={() => !isEditing && startEdit(task)}
                    onBlur={() => {
                      if (isEditing) {
                        confirmEdit(task.id);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (isEditing) confirmEdit(task.id);
                        e.currentTarget.blur();
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        cancelEdit(task.id);
                        e.currentTarget.blur();
                      }
                    }}
                    className={`w-full bg-transparent border-none focus:ring-0 p-0 text-sm ${getIsCompleted(task) ? 'text-slate-400 line-through' : 'text-slate-800'}`}
                  />
                </div>

                {/* Projects Column (Only in All Tasks view) */}
                {activeView === 'all' && (
                  <div className="w-64 px-4 py-2 border-r border-slate-100 shrink-0 flex items-center gap-1.5 flex-wrap">
                    {getTaskProjects(task.id).map((proj: any) => (
                      <span
                        key={proj.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {(() => {
                          const colorDot = getColorDotProps(proj.color);
                          return (
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${colorDot?.className ?? ''}`}
                              style={colorDot?.style}
                            />
                          );
                        })()}
                        {proj.name}
                        <button
                          onClick={() => removeProjectFromTask(task.id, proj.id)}
                          className="ml-1 text-slate-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    {/* Add Project Button (Native Select Trick) */}
                    <div className="relative group/add inline-flex items-center justify-center">
                      <button className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                      <select
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        value=""
                        onChange={(e) => addProjectToTask(task.id, e.target.value)}
                      >
                        <option value="" disabled>Adicionar...</option>
                        {projects
                          .filter((p: any) => !getTaskProjects(task.id).find((tp: any) => tp.id === p.id))
                          .map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Due Date Column */}
                <div className="w-40 px-4 py-2 border-r border-slate-100 shrink-0">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="date"
                      value={isEditing ? (draft.dueDate ?? '') : getDueDate(task)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!isEditing) startEdit(task);
                        setDraftById(prev => ({
                          ...prev,
                          [task.id]: { ...prev[task.id], dueDate: val }
                        }));
                      }}
                      onFocus={() => !isEditing && startEdit(task)}
                      onBlur={() => {
                        if (isEditing) {
                          confirmEdit(task.id);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (isEditing) confirmEdit(task.id);
                          e.currentTarget.blur();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          cancelEdit(task.id);
                          e.currentTarget.blur();
                        }
                      }}
                      className="bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-700 cursor-pointer hover:text-slate-900"
                    />
                  </div>
                </div>

                {/* Dynamic Custom Field Columns */}
                {safeCustomFields.map((field: any) => {
                  const fieldValue = getResolvedFieldValue(task, field);
                  const fieldOptions = getFieldOptions(field);

                  return (
                    <div key={field.id} className="w-48 px-4 py-2 border-r border-slate-100 shrink-0">
                      {!updateCustomValue ? (
                        renderReadOnlyFieldValue(field, fieldValue)
                      ) : field.type === 'enum' ? (
                        <select
                          className="w-full bg-transparent text-sm border-none focus:ring-0 p-0 text-slate-700 cursor-pointer"
                          value={String(fieldValue ?? '')}
                          onChange={(e) => updateCustomValue(task.id, field.id, e.target.value)}
                        >
                          <option value="">-</option>
                          {fieldOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'boolean' ? (
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(fieldValue)}
                            onChange={(e) => updateCustomValue(task.id, field.id, e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          {fieldValue ? 'Sim' : 'Nao'}
                        </label>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                          value={String(fieldValue ?? '')}
                          onChange={(e) =>
                            updateCustomValue(
                              task.id,
                              field.id,
                              field.type === 'number'
                                ? (e.target.value === '' ? undefined : Number(e.target.value))
                                : e.target.value
                            )
                          }
                          placeholder="-"
                          className="w-full bg-transparent text-sm border-none focus:ring-0 p-0 text-slate-700 placeholder:text-slate-300"
                        />
                      )}
                    </div>
                  );
                })}

                {/* Actions Column */}
                <div className="w-32 px-4 py-2 shrink-0">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing && (
                      <>
                        <button
                          onClick={() => confirmEdit(task.id)}
                          className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors"
                          title="Confirmar edição"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => cancelEdit(task.id)}
                          className="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-md transition-colors"
                          title="Cancelar edição"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {onEditTask && (
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                        title="Editar tarefa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {onDeleteTask && (
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                        title="Excluir tarefa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )
          })}

          {/* Add Task Row */}
          <button
            onClick={addTask}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-100 text-sm"
          >
            <Plus className="w-5 h-5 ml-1" />
            <span>Adicionar tarefa...</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskTable;
