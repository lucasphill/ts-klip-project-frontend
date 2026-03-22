import { useEffect, useState } from "react";
import { toast } from "sonner";
import TaskTable from "../components/TaskTable";
import AddTaskModal from "../components/AddTaskModal";
import TaskViewLayout from "../components/TaskViewLayout";
import { tasksApi, projectsTasksApi } from "../services/api";
import type { GetProjectsDto, GetTasksDto, CreateTaskDto } from "../types/apiTypes";
import { useTasksContext } from "../contexts/TasksContext";
import { useProjectsContext } from "../contexts/ProjectsContext";

const HomePage = () => {
  const { tasks, fetchTasks, appendTask, updateTaskLocal, removeTaskLocal } = useTasksContext();
  const { projects, fetchProjects } = useProjectsContext();
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);

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
        toast.success("Status da tarefa atualizado");
      } catch (error: any) {
        toast.error(error?.message ?? "Erro ao atualizar status");
        updateTaskLocal(taskId, { isCompleted: !newCompleted });
      }
    })();
  };

  const addTask = () => {
    const draftTask = {
      title: "",
      isCompleted: false,
      dueDate: "",
      notes: "",
      parentTaskId: "",
    } as any;
    setTaskToEdit(draftTask);
    setShowEditTaskModal(true);
  };

  const addProjectToTask = (taskId: string, projectId: string) => {
    const exists = projectTasks.some((projectTask) => projectTask.task_id === taskId && projectTask.project_id === projectId);
    if (!projectId || exists) return;

    setProjectTasks((previous) => [...previous, { project_id: projectId, task_id: taskId }]);
    void (async () => {
      try {
        await projectsTasksApi.assign(projectId, taskId);
        toast.success("Projeto vinculado a tarefa");
      } catch (error: any) {
        toast.error(error?.message ?? "Erro ao vincular projeto");
        setProjectTasks((previous) =>
          previous.filter((projectTask) => !(projectTask.task_id === taskId && projectTask.project_id === projectId))
        );
      }
    })();
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
        toast.success("Projeto desvinculado da tarefa");
      } catch (error: any) {
        toast.error(error?.message ?? "Erro ao desvincular projeto");
        setProjectTasks((previous) => [...previous, { project_id: projectId, task_id: taskId }]);
      }
    })();
  };

  const getTaskProjects = (taskId: string) => {
    const projectIds = projectTasks
      .filter((projectTask) => projectTask.task_id === taskId)
      .map((projectTask) => projectTask.project_id);

    return projects.filter((project) => projectIds.includes(project.id));
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

  const handleEditTask = (task: any) => {
    setTaskToEdit(task);
    setShowEditTaskModal(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

    void (async () => {
      try {
        await tasksApi.remove(taskId);
        removeTaskLocal(taskId);
        toast.success("Tarefa excluida");
      } catch (error: any) {
        toast.error(error?.message ?? "Erro ao excluir tarefa");
      }
    })();
  };

  const handleSaveTask = async (task: any): Promise<void> => {
    const payload = {
      title: task.title ?? "",
      dueDate: task.dueDate ?? task.due_date,
      isCompleted: task.isCompleted ?? task.is_completed ?? false,
      notes: task.notes,
      parentTaskId: task.parentTaskId ?? task.parent_task_id,
    } as any;

    const isTemp = typeof task.id === "string" && task.id.startsWith("t-");

    if (isTemp) {
      try {
        const response = await tasksApi.create(payload);
        const created: GetTasksDto = response.data;
        removeTaskLocal(task.id);
        appendTask(created);
        toast.success("Tarefa criada com sucesso");
      } catch (error: any) {
        toast.error(error?.message ?? "Erro ao criar tarefa");
        throw error;
      }
      return;
    }

    if (task.id) {
      updateTaskLocal(task.id, task);
      try {
        await tasksApi.update(task.id, payload);
        toast.success("Tarefa atualizada");
      } catch (error: any) {
        toast.error(error?.message ?? "Erro ao atualizar tarefa");
        throw error;
      }
      return;
    }

    try {
      const response = await tasksApi.create(payload);
      const created: GetTasksDto = response.data;
      appendTask(created);
      toast.success("Tarefa criada com sucesso");
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao criar tarefa");
      throw error;
    }
  };

  return (
    <>
      <TaskViewLayout
        title="Todas as tarefas"
        description="Visualize e gerencie todas as suas tarefas aqui."
        canAddCustomField={false}
      >
        <TaskTable
          visibleTasks={tasks}
          activeView="all"
          toggleTaskCompletion={toggleTaskCompletion}
          addTask={addTask}
          projects={projects}
          getTaskProjects={getTaskProjects}
          addProjectToTask={addProjectToTask}
          removeProjectFromTask={removeProjectFromTask}
          updateTaskTitle={updateTaskTitle}
          updateTaskDueDate={updateTaskDueDate}
          updateTaskInline={updateTaskInline}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />

        <AddTaskModal
          isOpen={showEditTaskModal}
          onClose={() => {
            setShowEditTaskModal(false);
            setTaskToEdit(null);
          }}
          onSave={handleSaveTask}
          task={taskToEdit}
        />
      </TaskViewLayout>
    </>
  );
};

export default HomePage;
