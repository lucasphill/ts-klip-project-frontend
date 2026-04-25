import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import type { DatesSetArg, DayCellMountArg, EventClickArg } from "@fullcalendar/core";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import AddTaskModal from "../components/AddTaskModal";
import TaskTable from "../components/TaskTable";
import TaskViewLayout from "../components/TaskViewLayout";
import { useTasksContext } from "../contexts/TasksContext";
import { useProjectsContext } from "../contexts/ProjectsContext";
import { useUniversalCustomFields } from "../contexts/UniversalCustomFieldsContext";
import { buildParentTaskOptions, getDescendantTaskIds } from "../lib/taskHierarchy";
import { customFieldValuesApi, projectsTasksApi, tasksApi } from "../services/api";
import type { CreateTaskDto, CustomFieldValue, GetCustomFieldDefinitionDto, GetProjectsDto, GetTasksDto } from "../types/apiTypes";

const toDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeFieldKey = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

const getTaskFieldValue = (
  task: { customFields?: Record<string, CustomFieldValue> } | undefined,
  field: GetCustomFieldDefinitionDto | undefined
) => {
  if (!task || !field) return '';
  if (task.customFields?.[field.id] !== undefined) return task.customFields[field.id];
  if (task.customFields?.[field.name] !== undefined) return task.customFields[field.name];

  if (task.customFields) {
    const normalizedTargetKey = normalizeFieldKey(field.name);
    const matchingEntry = Object.entries(task.customFields).find(([key]) => normalizeFieldKey(key) === normalizedTargetKey);
    if (matchingEntry) return matchingEntry[1];
  }

  return '';
};

const buildCustomFieldValuePayload = (
  taskId: string,
  customFieldId: string,
  fieldType: GetCustomFieldDefinitionDto['type'],
  value: CustomFieldValue
) => {
  const payload: any = { taskId, customFieldId };

  if (fieldType === 'number') {
    payload.valueNumber = value === undefined || value === null || value === '' ? undefined : Number(value);
    return payload;
  }

  payload.valueText = value === undefined || value === null ? '' : String(value);
  return payload;
};

const MonthViewPage = () => {
  const { tasks, fetchTasks, appendTask, updateTaskLocal, removeTasksLocal } = useTasksContext();
  const { projects, fetchProjects } = useProjectsContext();
  const { universalCustomFields } = useUniversalCustomFields();
  const [projectTasks, setProjectTasks] = useState<{ project_id: string; task_id: string }[]>([]);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<(CreateTaskDto & { id?: string }) | null>(null);
  const [taskProjectIds, setTaskProjectIds] = useState<string[]>([]);
  const [visibleRange, setVisibleRange] = useState<{
    start: Date;
    end: Date;
    title: string;
  }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
    title: new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
  });
  const availableParentTasks = useMemo(
    () => buildParentTaskOptions(tasks, taskToEdit?.id),
    [taskToEdit?.id, tasks]
  );

  const loadProjectTaskAssignments = async (projectsList: GetProjectsDto[]) => {
    try {
      const promises = projectsList.map((project) => projectsTasksApi.getByProject(project.id));
      const results = await Promise.all(promises);
      const assignments: { project_id: string; task_id: string }[] = [];

      results.forEach((result, index) => {
        const projectId = projectsList[index].id;
        const tasksForProject = result?.data ?? [];
        tasksForProject.forEach((task: any) => {
          if (task?.id) {
            assignments.push({ project_id: projectId, task_id: task.id });
          }
        });
      });

      setProjectTasks(assignments);
    } catch (error) {
      console.error("Erro ao carregar vinculos projeto-tarefa", error);
    }
  };

  useEffect(() => {
    fetchProjects()
      .then((projectsList) => loadProjectTaskAssignments(projectsList))
      .catch((error: any) => toast.error(error?.message ?? "Erro ao buscar projetos"));

    fetchTasks().catch((error: any) => toast.error(error?.message ?? "Erro ao buscar tarefas"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calendarEvents = useMemo(
    () =>
      tasks
        .filter((task) => Boolean(task.dueDate))
        .map((task) => ({
          id: task.id,
          title: task.title || "Sem titulo",
          date: task.dueDate,
          allDay: true,
          extendedProps: {
            isCompleted: task.isCompleted ?? false,
          },
        })),
    [tasks]
  );

  const monthTasks = useMemo(
    () =>
      tasks
        .filter((task) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(`${task.dueDate}T00:00:00`);
          return dueDate >= visibleRange.start && dueDate < visibleRange.end;
        })
        .sort((left, right) => String(left.dueDate).localeCompare(String(right.dueDate))),
    [tasks, visibleRange]
  );

  const openTaskModal = (taskDraft: CreateTaskDto & { id?: string }, selectedProjectIds: string[] = []) => {
    setTaskToEdit(taskDraft);
    setTaskProjectIds(selectedProjectIds);
    setShowEditTaskModal(true);
  };

  const openCreateTaskModal = (dueDate?: string) => {
    openTaskModal({
      title: "",
      isCompleted: false,
      dueDate,
      notes: "",
      parentTaskId: "",
    });
  };

  const handleEventClick = (arg: EventClickArg) => {
    const task = tasks.find((item) => item.id === arg.event.id);
    if (!task) return;

    openTaskModal({
      id: task.id,
      title: task.title ?? "",
      dueDate: task.dueDate ?? "",
      isCompleted: task.isCompleted ?? false,
      notes: (task as any).notes ?? "",
      parentTaskId: (task as any).parentTaskId ?? "",
    }, getTaskProjects(task.id).map((project) => project.id));
  };

  const handleDayCellDidMount = (arg: DayCellMountArg) => {
    arg.el.style.cursor = "pointer";
    arg.el.onclick = (event) => {
      const target = event.target as HTMLElement;
      if (target.closest(".fc-event") || target.closest(".fc-daygrid-more-link")) return;
      openCreateTaskModal(toDateString(arg.date));
    };
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    setVisibleRange({
      start: arg.start,
      end: arg.end,
      title: arg.view.title,
    });
  };

  const persistTaskUpdate = async (taskId: string, updates: Partial<GetTasksDto>) => {
    const existingTask = tasks.find((task) => task.id === taskId);
    if (!existingTask) return;

    const updatedTask = { ...existingTask, ...updates };
    updateTaskLocal(taskId, updates);

    try {
      await tasksApi.update(taskId, {
        title: updatedTask.title?.trim() ?? "",
        dueDate: updatedTask.dueDate ? `${updatedTask.dueDate}T00:00:00` : undefined,
        isCompleted: updatedTask.isCompleted ?? false,
        notes: (updatedTask as any).notes?.trim() || undefined,
        parentTaskId: (updatedTask as any).parentTaskId?.trim() || undefined,
      });
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao atualizar tarefa");
      updateTaskLocal(taskId, existingTask);
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    const task = tasks.find((currentTask) => currentTask.id === taskId);
    if (!task) return;

    const newCompleted = !(task.isCompleted ?? false);
    updateTaskLocal(taskId, { isCompleted: newCompleted });

    void (async () => {
      const payload: CreateTaskDto = {
        title: task.title ?? "",
        dueDate: (task as any).dueDate ?? (task as any).due_date,
        isCompleted: newCompleted,
        notes: (task as any).notes,
        parentTaskId: (task as any).parentTaskId ?? (task as any).parent_task_id,
      };

      try {
        await tasksApi.update(task.id, payload);
      } catch (error: any) {
        toast.error(error?.message ?? "Erro ao atualizar status");
        updateTaskLocal(taskId, { isCompleted: !newCompleted });
      }
    })();
  };

  const addTask = () => {
    openCreateTaskModal(toDateString(new Date()));
  };

  const updateTaskTitle = (taskId: string, title: string) => {
    void persistTaskUpdate(taskId, { title });
  };

  const updateTaskDueDate = (taskId: string, dueDate: string) => {
    void persistTaskUpdate(taskId, { dueDate });
  };

  const updateTaskInline = (taskId: string, updates: { title?: string; dueDate?: string }) => {
    void persistTaskUpdate(taskId, updates);
  };

  const getTaskProjects = (taskId: string) => {
    const projectIds = projectTasks
      .filter((projectTask) => projectTask.task_id === taskId)
      .map((projectTask) => projectTask.project_id);
    return projects.filter((project) => projectIds.includes(project.id));
  };

  const addProjectToTask = (taskId: string, projectId: string) => {
    const exists = projectTasks.some((projectTask) => projectTask.task_id === taskId && projectTask.project_id === projectId);
    if (!projectId || exists) return;

    setProjectTasks((previous) => [...previous, { project_id: projectId, task_id: taskId }]);
    void (async () => {
      try {
        await projectsTasksApi.assign(projectId, taskId);
      } catch (error: any) {
        toast.error(error?.message ?? "Erro ao vincular projeto");
        setProjectTasks((previous) =>
          previous.filter((projectTask) => !(projectTask.task_id === taskId && projectTask.project_id === projectId))
        );
      }
    })();
  };

  const syncTaskProjects = async (taskId: string, nextProjectIds: string[]) => {
    const normalizedNextProjectIds = Array.from(new Set(nextProjectIds.filter(Boolean)));
    const currentProjectIds = projectTasks
      .filter((projectTask) => projectTask.task_id === taskId)
      .map((projectTask) => projectTask.project_id);

    const projectsToAssign = normalizedNextProjectIds.filter((projectId) => !currentProjectIds.includes(projectId));
    const projectsToUnassign = currentProjectIds.filter((projectId) => !normalizedNextProjectIds.includes(projectId));

    if (projectsToAssign.length === 0 && projectsToUnassign.length === 0) {
      return;
    }

    try {
      await Promise.all([
        ...projectsToAssign.map((projectId) => projectsTasksApi.assign(projectId, taskId)),
        ...projectsToUnassign.map((projectId) => projectsTasksApi.unassign(projectId, taskId)),
      ]);

      setProjectTasks((previous) => [
        ...previous.filter((projectTask) => projectTask.task_id !== taskId),
        ...normalizedNextProjectIds.map((projectId) => ({ project_id: projectId, task_id: taskId })),
      ]);
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao atualizar projetos da tarefa");
      if (projects.length > 0) {
        await loadProjectTaskAssignments(projects);
      }
      throw error;
    }
  };

  const removeProjectFromTask = (taskId: string, projectId: string) => {
    const exists = projectTasks.some((projectTask) => projectTask.task_id === taskId && projectTask.project_id === projectId);
    if (!exists) return;

    setProjectTasks((previous) =>
      previous.filter((projectTask) => !(projectTask.task_id === taskId && projectTask.project_id === projectId))
    );

    void (async () => {
      try {
        await projectsTasksApi.unassign(projectId, taskId);
      } catch (error: any) {
        toast.error(error?.message ?? "Erro ao desvincular projeto");
        setProjectTasks((previous) => [...previous, { project_id: projectId, task_id: taskId }]);
      }
    })();
  };

  const getFieldValue = (taskId: string, fieldId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    const field = universalCustomFields.find((item) => item.id === fieldId);
    return getTaskFieldValue(task, field);
  };

  const updateCustomValue = (taskId: string, fieldId: string, value: CustomFieldValue) => {
    const field = universalCustomFields.find((item) => item.id === fieldId);
    const task = tasks.find((item) => item.id === taskId);
    if (!field || !task) return;

    const previousCustomFields = { ...(task.customFields ?? {}) };
    const nextCustomFields = { ...(task.customFields ?? {}) };
    delete nextCustomFields[field.id];
    nextCustomFields[field.name] = value;

    const currentValue = getTaskFieldValue(task, field);
    const hasCurrentValue = currentValue !== '' && currentValue !== undefined && currentValue !== null;

    updateTaskLocal(taskId, { customFields: nextCustomFields });

    const payload = buildCustomFieldValuePayload(taskId, fieldId, field.type, value);
    const request = hasCurrentValue
      ? customFieldValuesApi.update(payload)
      : customFieldValuesApi.create(payload);

    void (async () => {
      try {
        await request;
      } catch (error: any) {
        toast.error(error?.message ?? 'Erro ao salvar campo personalizado');
        updateTaskLocal(taskId, { customFields: previousCustomFields });
      }
    })();
  };

  const handleEditTask = (task: GetTasksDto) => {
    openTaskModal({
      id: task.id,
      title: task.title ?? "",
      dueDate: task.dueDate ?? "",
      isCompleted: task.isCompleted ?? false,
      notes: (task as any).notes ?? "",
      parentTaskId: (task as any).parentTaskId ?? "",
    }, getTaskProjects(task.id).map((project) => project.id));
  };

  const handleAddSubtask = (task: GetTasksDto) => {
    openTaskModal(
      {
        title: "",
        isCompleted: false,
        dueDate: "",
        notes: "",
        parentTaskId: task.id,
      },
      getTaskProjects(task.id).map((project) => project.id)
    );
  };

  const handleDeleteTask = async (taskId: string): Promise<boolean> => {
    const descendantTaskIds = getDescendantTaskIds(tasks, taskId);
    const taskIdsToRemove = [taskId, ...descendantTaskIds];
    const confirmationMessage =
      descendantTaskIds.length > 0
        ? `Esta tarefa possui ${descendantTaskIds.length} subtarefa(s). Ao excluir a tarefa pai, todas as tarefas filho tambem serao excluidas. Deseja continuar?`
        : "Tem certeza que deseja excluir esta tarefa?";

    if (!confirm(confirmationMessage)) return false;

    try {
      await tasksApi.remove(taskId);
      removeTasksLocal(taskIdsToRemove);
      setProjectTasks((previous) =>
        previous.filter((projectTask) => !taskIdsToRemove.includes(projectTask.task_id))
      );
      toast.success(descendantTaskIds.length > 0 ? "Tarefa e subtarefas excluidas" : "Tarefa excluida");
      return true;
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao excluir tarefa");
      return false;
    }
  };

  const handleSaveTask = async (
    task: CreateTaskDto & { id?: string },
    selectedProjectIds: string[] = []
  ): Promise<void> => {
    const payload = {
      title: task.title ?? "",
      dueDate: task.dueDate ?? "",
      isCompleted: task.isCompleted ?? false,
      notes: task.notes,
      parentTaskId: task.parentTaskId,
    } as CreateTaskDto;

    if (task.id) {
      updateTaskLocal(task.id, task);
      try {
        await tasksApi.update(task.id, payload);
        await syncTaskProjects(task.id, selectedProjectIds);
      } catch (error: any) {
        toast.error(error?.message ?? "Erro ao atualizar tarefa");
        throw error;
      }
      return;
    }

    try {
      const response = await tasksApi.create(payload);
      const createdTask = response.data;
      await syncTaskProjects(createdTask.id, selectedProjectIds);
      appendTask(createdTask);
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao criar tarefa");
      throw error;
    }
  };

  return (
    <>
      <TaskViewLayout
        title="Calendario"
        description="Visualize suas tarefas no mes e clique nos eventos para editar rapidamente."
        canAddCustomField={false}
      >
        <section className="flex min-h-0 flex-1 flex-col overflow-auto bg-white pt-4 sm:pt-6">
          <div className="px-4 sm:px-6">
            <div className="surface-panel rounded-2xl bg-white p-3 sm:p-4">
              <FullCalendar
                plugins={[dayGridPlugin]}
                locale={ptBrLocale}
                initialView="dayGridWeek"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridWeek dayGridMonth",
                }}
                buttonText={{ today: "Hoje" }}
                events={calendarEvents}
                eventClick={handleEventClick}
                dayCellDidMount={handleDayCellDidMount}
                datesSet={handleDatesSet}
                fixedWeekCount={false}
                height="auto"
                eventClassNames={(arg) =>
                  arg.event.extendedProps.isCompleted
                    ? ["klip-fc-event", "is-completed"]
                    : ["klip-fc-event", "is-pending"]
                }
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  meridiem: false,
                }}
              />
            </div>
          </div>

          <div className="mt-5">
            <div className="px-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Tarefas do periodo</h2>
                  <p className="text-sm text-slate-500">{visibleRange.title}</p>
                </div>
                <button
                  onClick={addTask}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2f6fb2] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#225587]"
                >
                  <Plus className="h-4 w-4" />
                  Nova tarefa
                </button>
              </div>
            </div>

            <div className="my-4">
              <TaskTable
                activeView="all"
                visibleTasks={monthTasks}
                activeCustomFields={universalCustomFields}
                projects={projects}
                getFieldValue={getFieldValue}
                updateCustomValue={updateCustomValue}
                toggleTaskCompletion={toggleTaskCompletion}
                addTask={addTask}
                getTaskProjects={getTaskProjects}
                addProjectToTask={addProjectToTask}
                removeProjectFromTask={removeProjectFromTask}
                updateTaskTitle={updateTaskTitle}
                updateTaskDueDate={updateTaskDueDate}
                updateTaskInline={updateTaskInline}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onAddSubtask={handleAddSubtask}
              />
            </div>
          </div>
        </section>

        <AddTaskModal
          isOpen={showEditTaskModal}
          onClose={() => {
            setShowEditTaskModal(false);
            setTaskToEdit(null);
            setTaskProjectIds([]);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          task={taskToEdit}
          projects={projects}
          initialProjectIds={taskProjectIds}
          parentTaskOptions={availableParentTasks}
        />
      </TaskViewLayout>
    </>
  );
};

export default MonthViewPage;
