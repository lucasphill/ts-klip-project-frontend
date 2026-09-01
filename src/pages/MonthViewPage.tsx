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
import { buildParentTaskOptions, getDescendantTaskIds } from "../lib/taskHierarchy";
import { DeleteTaskModal } from "../components/DeleteTaskModal";
import type { DeleteTaskTarget } from "../types/taskDeletion";
import { projectsTasksApi, tasksApi } from "../services/api";
import { toTaskPayload } from "../lib/taskPayload";
import { isMarkdownEmpty } from "../lib/markdown";
import type { CreateTaskDto, CustomFieldValue, GetProjectsDto, GetTasksDto } from "../types/apiTypes";

const toDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const MonthViewPage = () => {
  const { tasks, fetchTasks, appendTask, updateTaskLocal, removeTasksLocal } = useTasksContext();
  const { projects, fetchProjects } = useProjectsContext();
  const [projectTasks, setProjectTasks] = useState<{ project_id: string; task_id: string }[]>([]);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<(CreateTaskDto & { id?: string }) | null>(null);
  const [taskProjectIds, setTaskProjectIds] = useState<string[]>([]);
  const [taskToDelete, setTaskToDelete] = useState<DeleteTaskTarget | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    updateTaskLocal(taskId, {
      ...updates,
      notes: isMarkdownEmpty(updatedTask.notes) ? undefined : updatedTask.notes,
    });

    try {
      await tasksApi.update(taskId, toTaskPayload(updatedTask));
      if (updates.notes !== undefined) {
        toast.success("Observação da tarefa atualizada");
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao atualizar tarefa");
      updateTaskLocal(taskId, existingTask);
      throw error;
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

  const updateTaskInline = (taskId: string, updates: { title?: string; dueDate?: string; notes?: string }) => {
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

  const getFieldValue = (_taskId: string, _fieldId: string) => "";
  const updateCustomValue = (_taskId: string, _fieldId: string, _value: CustomFieldValue) => { };

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

  const handleDeleteTask = (taskId: string): boolean => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return false;
    const descendantTaskIds = getDescendantTaskIds(tasks, taskId);
    setTaskToDelete({
      id: task.id,
      title: task.title,
      subtaskCount: descendantTaskIds.length,
      descendantTaskIds,
    });
    setShowDeleteModal(true);
    return true;
  };

  const handleConfirmDelete = async (taskId: string, cascade?: boolean): Promise<void> => {
    const descendantTaskIds = taskToDelete?.descendantTaskIds ?? getDescendantTaskIds(tasks, taskId);
    const isCascade = cascade === true;

    try {
      await tasksApi.remove(taskId, cascade);

      if (isCascade || descendantTaskIds.length === 0) {
        const taskIdsToRemove = isCascade ? [taskId, ...descendantTaskIds] : [taskId];
        removeTasksLocal(taskIdsToRemove);
        setProjectTasks((previous) =>
          previous.filter((projectTask) => !taskIdsToRemove.includes(projectTask.task_id))
        );
        toast.success(descendantTaskIds.length > 0 ? "Tarefa e subtarefas excluídas" : "Tarefa excluída");
      } else {
        removeTasksLocal([taskId]);
        setProjectTasks((previous) =>
          previous.filter((projectTask) => projectTask.task_id !== taskId)
        );

        tasks.forEach((t) => {
          if (t.parentTaskId === taskId || (t as any).parent_task_id === taskId) {
            updateTaskLocal(t.id, { parentTaskId: undefined });
          }
        });
        toast.success("Tarefa excluída e subtarefas mantidas");
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao excluir tarefa");
      throw error;
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
      >
        <section className="flex min-h-0 flex-1 flex-col overflow-auto bg-[var(--bg-canvas)] pt-0 sm:pt-0">
          <div className="px-0 sm:px-6 mt-4 sm:mt-6 [@media(max-height:600px)]:mt-2 [@media(max-height:600px)]:px-0">
            <div className="w-full bg-[var(--bg-panel)] border-x-0 border-y border-[var(--border-subtle)] rounded-none shadow-none p-1.5 sm:border sm:rounded-2xl sm:shadow-[var(--panel-shadow)] sm:p-4 [@media(max-height:600px)]:border-x-0 [@media(max-height:600px)]:border-y [@media(max-height:600px)]:border-[var(--border-subtle)] [@media(max-height:600px)]:rounded-none [@media(max-height:600px)]:shadow-none [@media(max-height:600px)]:p-1.5">
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
                activeCustomFields={[]}
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

        <DeleteTaskModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setTaskToDelete(null);
          }}
          task={taskToDelete}
          onConfirm={handleConfirmDelete}
        />
      </TaskViewLayout>
    </>
  );
};

export default MonthViewPage;
