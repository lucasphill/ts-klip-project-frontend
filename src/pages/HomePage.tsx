import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import TaskTable from "../components/TaskTable";
import AddTaskModal from "../components/AddTaskModal";
import TaskViewLayout from "../components/TaskViewLayout";
import { customFieldDefinitionsApi, customFieldValuesApi, tasksApi, projectsTasksApi } from "../services/api";
import type { GetProjectsDto, GetTasksDto, CreateTaskDto } from "../types/apiTypes";
import { useTasksContext } from "../contexts/TasksContext";
import { useProjectsContext } from "../contexts/ProjectsContext";
import { buildParentTaskOptions, getDescendantTaskIds } from "../lib/taskHierarchy";
import type { CreateCustomFieldDefinitionDto, CustomFieldValue, GetCustomFieldDefinitionDto } from "../types/apiTypes";

const normalizeFieldKey = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

const EMPTY_SENTINEL = '(vazio)';

const getTaskFieldValue = (
  task: { customFields?: Record<string, CustomFieldValue> } | undefined,
  field: GetCustomFieldDefinitionDto | undefined
) => {
  if (!task || !field) return '';

  const normalize = (v: CustomFieldValue) => (v === EMPTY_SENTINEL ? '' : v);

  if (task.customFields?.[field.id] !== undefined) return normalize(task.customFields[field.id]);
  if (task.customFields?.[field.name] !== undefined) return normalize(task.customFields[field.name]);

  if (task.customFields) {
    const normalizedTargetKey = normalizeFieldKey(field.name);
    const matchingEntry = Object.entries(task.customFields).find(([key]) => normalizeFieldKey(key) === normalizedTargetKey);
    if (matchingEntry) return normalize(matchingEntry[1]);
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

const HomePage = () => {
  const { tasks, fetchTasks, appendTask, updateTaskLocal, removeTasksLocal } = useTasksContext();
  const { projects, fetchProjects } = useProjectsContext();
  const { universalCustomFields, fetchUniversalCustomFields } = useUniversalCustomFields();
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [taskProjectIds, setTaskProjectIds] = useState<string[]>([]);

  const availableParentTasks = useMemo(
    () => buildParentTaskOptions(tasks, taskToEdit?.id),
    [tasks, taskToEdit?.id]
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

  const openTaskModal = (taskDraft: CreateTaskDto & { id?: string }, selectedProjectIds: string[] = []) => {
    setTaskToEdit(taskDraft);
    setTaskProjectIds(selectedProjectIds);
    setShowEditTaskModal(true);
  };

  const addTask = () => {
    openTaskModal({
      title: "",
      isCompleted: false,
      dueDate: "",
      notes: "",
      parentTaskId: "",
    });
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

    void (async () => {
      try {
        if (hasCurrentValue) {
          await customFieldValuesApi.update(payload);
        } else {
          await customFieldValuesApi.create(payload);
        }
      } catch (error: any) {
        // If update failed because the record doesn't exist, fall back to create
        if (hasCurrentValue && (error?.response?.status === 400 || error?.response?.status === 404)) {
          try {
            await customFieldValuesApi.create(payload);
            return;
          } catch (retryError: any) {
            toast.error(retryError?.message ?? 'Erro ao salvar campo personalizado');
          }
        } else {
          toast.error(error?.message ?? 'Erro ao salvar campo personalizado');
        }
        updateTaskLocal(taskId, { customFields: previousCustomFields });
      }
    })();
  };

  const handleEditTask = (task: any) => {
    openTaskModal(task, getTaskProjects(task.id).map((project) => project.id));
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

  const handleSaveTask = async (task: any, selectedProjectIds: string[] = []): Promise<void> => {
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
        await syncTaskProjects(created.id, selectedProjectIds);
        removeTasksLocal([task.id]);
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
        await syncTaskProjects(task.id, selectedProjectIds);
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
      await syncTaskProjects(created.id, selectedProjectIds);
      appendTask(created);
      toast.success("Tarefa criada com sucesso");
    } catch (error: any) {
      toast.error(error?.message ?? "Erro ao criar tarefa");
      throw error;
    }
  };

  const handleCreateCustomField = async (field: CreateCustomFieldDefinitionDto) => {
    const normalizedField: CreateCustomFieldDefinitionDto = {
      ...field,
      isUniversal: true,
      options: Array.isArray(field.options)
        ? field.options.map((option) => option.trim()).filter(Boolean).join(',') || undefined
        : field.options,
    };

    try {
      await customFieldDefinitionsApi.create(normalizedField);
      await fetchUniversalCustomFields({ force: true });
      toast.success('Campo universal criado com sucesso');
    } catch (error: any) {
      toast.error(error?.message ?? 'Erro ao criar campo universal');
      throw error;
    }
  };

  const handleRemoveCustomField = async (field: GetCustomFieldDefinitionDto) => {
    try {
      await customFieldDefinitionsApi.remove(field.id);
      await fetchUniversalCustomFields({ force: true });
      toast.success('Campo universal removido com sucesso');
    } catch (error: any) {
      toast.error(error?.message ?? 'Erro ao remover campo universal');
    }
  };

  return (
    <>
      <TaskViewLayout
        title="Todas as tarefas"
        description="Visualize e gerencie todas as suas tarefas aqui."
        canAddCustomField
        canRemoveUniversalCustomField
        customFields={universalCustomFields}
        onCreateCustomField={handleCreateCustomField}
        onRemoveCustomField={handleRemoveCustomField}
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
          onAddSubtask={handleAddSubtask}
        />

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

export default HomePage;
