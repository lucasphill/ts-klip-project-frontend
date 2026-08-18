import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import TaskTable from '../components/TaskTable';
import AddTaskModal from '../components/AddTaskModal';
import TaskViewLayout from '../components/TaskViewLayout';
import { useProjectsContext } from '../contexts/ProjectsContext';
import { useTasksContext } from '../contexts/TasksContext';
import { useCustomFieldDefinitionsContext } from '../contexts/CustomFieldDefinitionsContext';
import { buildParentTaskOptions, getDescendantTaskIds } from '../lib/taskHierarchy';
import { normalizeTask as normalizeApiTask, toTaskPayload } from '../lib/taskPayload';
import { DeleteTaskModal } from '../components/DeleteTaskModal';
import type { DeleteTaskTarget } from '../types/taskDeletion';
import {
  customFieldValuesApi,
  projectsCustomFieldDefinitionsApi,
  projectsTasksApi,
  tasksApi,
} from '../services/api';
import type {
  CreateTaskDto,
  CustomFieldValue,
  GetCustomFieldDefinitionDto,
  GetProjectsDto,
  GetTasksDto,
  GetTasksWithCustomFieldsDto,
} from '../types/apiTypes';
import {
  buildCustomFieldValuePayload,
  getCustomFieldValueByDefinition,
  normalizeCustomFieldDefinition,
} from '../lib/customFields';

type ProjectTask = GetTasksDto & {
  customFields?: Record<string, CustomFieldValue>;
};

const normalizeDueDate = (value?: string | null) => {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  return value.split('T')[0];
};

const normalizeTask = (task: GetTasksDto | GetTasksWithCustomFieldsDto): ProjectTask => {
  const normalizedTask = normalizeApiTask(task);
  const customFields = 'customFields' in task ? task.customFields ?? {} : {};

  return {
    ...normalizedTask,
    dueDate: normalizeDueDate(normalizedTask.dueDate),
    customFields,
  };
};

const ProjectsPage = () => {
  const { projectId } = useParams();
  const { projects, fetchProjects } = useProjectsContext();
  const { tasks: tasksWithUniversalCustomFields, updateTaskLocal } = useTasksContext();
  const { universalCustomFields } = useCustomFieldDefinitionsContext();
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [customFields, setCustomFields] = useState<GetCustomFieldDefinitionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<(CreateTaskDto & { id?: string }) | null>(null);
  const [projectTasks, setProjectTasks] = useState<{ project_id: string; task_id: string }[]>([]);
  const [taskProjectIds, setTaskProjectIds] = useState<string[]>([]);
  const [taskToDelete, setTaskToDelete] = useState<DeleteTaskTarget | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const currentProject = useMemo(
    () => projects.find((project) => project.id === projectId) ?? null,
    [projectId, projects]
  );
  const availableParentTasks = useMemo(
    () => buildParentTaskOptions(tasks, taskToEdit?.id),
    [taskToEdit?.id, tasks]
  );
  const activeCustomFields = useMemo(() => {
    const fieldsById = new Map<string, GetCustomFieldDefinitionDto>();

    universalCustomFields.forEach((field) => fieldsById.set(field.id, field));
    customFields.forEach((field) => {
      if (!fieldsById.has(field.id)) {
        fieldsById.set(field.id, field);
      }
    });

    return Array.from(fieldsById.values());
  }, [customFields, universalCustomFields]);
  const visibleTasks = useMemo(() => {
    const universalTaskMap = new Map(tasksWithUniversalCustomFields.map((task) => [task.id, task]));

    return tasks.map((task) => {
      const taskWithUniversalFields = universalTaskMap.get(task.id);

      return {
        ...task,
        customFields: {
          ...(taskWithUniversalFields?.customFields ?? {}),
          ...(task.customFields ?? {}),
        },
      };
    });
  }, [tasks, tasksWithUniversalCustomFields]);

  const loadProjectTaskAssignments = async (projectsList: GetProjectsDto[]) => {
    try {
      const promises = projectsList.map((project) => projectsTasksApi.getByProject(project.id));
      const results = await Promise.all(promises);
      const assignments: { project_id: string; task_id: string }[] = [];

      results.forEach((result, index) => {
        const currentProjectId = projectsList[index].id;
        const tasksForProject = result?.data ?? [];
        tasksForProject.forEach((task: GetTasksDto) => {
          if (task?.id) {
            assignments.push({ project_id: currentProjectId, task_id: task.id });
          }
        });
      });

      setProjectTasks(assignments);
    } catch (error) {
      console.error('Erro ao carregar vinculos projeto-tarefa', error);
    }
  };

  const refreshProjectData = async () => {
    if (!projectId) {
      setTasks([]);
      setCustomFields([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [projectsList, projectFieldsResponse] = await Promise.all([
        fetchProjects(),
        projectsCustomFieldDefinitionsApi.getByProject(projectId),
      ]);
      await loadProjectTaskAssignments(projectsList);

      let projectTasks: ProjectTask[] = [];

      try {
        const tasksWithFieldsResponse = await projectsTasksApi.getWithCustomFieldsByProject(projectId);
        projectTasks = (tasksWithFieldsResponse.data ?? []).map(normalizeTask);
      } catch {
        const tasksResponse = await projectsTasksApi.getByProject(projectId);
        projectTasks = (tasksResponse.data ?? []).map(normalizeTask);
      }

      setTasks(projectTasks);
      setCustomFields((projectFieldsResponse.data ?? []).map(normalizeCustomFieldDefinition));
    } catch (error: any) {
      toast.error(error?.message ?? 'Erro ao carregar o projeto');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshProjectData();
  }, [projectId]);

  const persistTaskUpdate = async (taskId: string, updates: Partial<ProjectTask>) => {
    const existingTask = tasks.find((task) => task.id === taskId);
    if (!existingTask) return;

    const updatedTask = { ...existingTask, ...updates };

    setTasks((previousTasks) =>
      previousTasks.map((task) => (task.id === taskId ? updatedTask : task))
    );

    try {
      await tasksApi.update(taskId, toTaskPayload(updatedTask));
      await refreshProjectData();
    } catch (error: any) {
      toast.error(error?.message ?? 'Erro ao atualizar tarefa');
      await refreshProjectData();
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    void persistTaskUpdate(taskId, { isCompleted: !(task.isCompleted ?? false) });
  };

  const openTaskModal = (taskDraft: CreateTaskDto & { id?: string }, selectedProjectIds: string[] = []) => {
    setTaskToEdit(taskDraft);
    setTaskProjectIds(selectedProjectIds);
    setShowEditTaskModal(true);
  };

  const addTask = () => {
    openTaskModal({
      title: '',
      isCompleted: false,
      dueDate: '',
      notes: '',
      parentTaskId: '',
    }, currentProject ? [currentProject.id] : []);
  };

  const getFieldValue = (taskId: string, fieldId: string) => {
    const task = visibleTasks.find((item) => item.id === taskId);
    const field = activeCustomFields.find((item) => item.id === fieldId);

    return getCustomFieldValueByDefinition(task, field);
  };

  const getTaskProjects = (taskId: string) => {
    const projectIds = projectTasks
      .filter((projectTask) => projectTask.task_id === taskId)
      .map((projectTask) => projectTask.project_id);

    const relatedProjects = projects.filter((project) => projectIds.includes(project.id));

    if (relatedProjects.length === 0 && currentProject) {
      return [currentProject];
    }

    return relatedProjects;
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

    await Promise.all([
      ...projectsToAssign.map((projectId) => projectsTasksApi.assign(projectId, taskId)),
      ...projectsToUnassign.map((projectId) => projectsTasksApi.unassign(projectId, taskId)),
    ]);

    setProjectTasks((previous) => [
      ...previous.filter((projectTask) => projectTask.task_id !== taskId),
      ...normalizedNextProjectIds.map((projectId) => ({ project_id: projectId, task_id: taskId })),
    ]);
  };

  const updateCustomValue = (taskId: string, fieldId: string, value: CustomFieldValue) => {
    const field = activeCustomFields.find((item) => item.id === fieldId);
    const task = visibleTasks.find((item) => item.id === taskId);
    if (!field || !task) return;
    if (!field.isUniversal && !projectId) return;

    const previousCustomFields = { ...(task.customFields ?? {}) };
    const previousGlobalCustomFields = {
      ...(tasksWithUniversalCustomFields.find((item) => item.id === taskId)?.customFields ?? {}),
    };
    const nextCustomFields = { ...(task.customFields ?? {}) };
    const nextGlobalCustomFields = { ...previousGlobalCustomFields };
    delete nextCustomFields[fieldId];
    nextCustomFields[field.name] = value;
    delete nextGlobalCustomFields[fieldId];
    nextGlobalCustomFields[field.name] = value;

    const currentValue = getFieldValue(taskId, fieldId);
    const hasCurrentValue = currentValue !== '' && currentValue !== undefined && currentValue !== null;

    setTasks((previousTasks) =>
      previousTasks.map((currentTask) =>
        currentTask.id === taskId
          ? {
            ...currentTask,
            customFields: nextCustomFields,
          }
          : currentTask
      )
    );

    if (field.isUniversal) {
      updateTaskLocal(taskId, { customFields: nextGlobalCustomFields });
    }

    if (!hasCurrentValue && (value === '' || value === undefined || value === null)) {
      return;
    }

    const payload = buildCustomFieldValuePayload(taskId, fieldId, field.type, value);
    const requestProjectId = field.isUniversal ? undefined : projectId;
    const request = hasCurrentValue
      ? customFieldValuesApi.update(payload, requestProjectId)
      : customFieldValuesApi.create(payload, requestProjectId);

    void (async () => {
      try {
        await request;
      } catch (error: any) {
        toast.error(error?.message ?? 'Erro ao salvar campo personalizado');
        setTasks((previousTasks) =>
          previousTasks.map((currentTask) =>
            currentTask.id === taskId
              ? {
                ...currentTask,
                customFields: previousCustomFields,
              }
              : currentTask
          )
        );
        if (field.isUniversal) {
          updateTaskLocal(taskId, { customFields: previousGlobalCustomFields });
        }
      }
    })();
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

  const handleEditTask = (task: ProjectTask) => {
    openTaskModal(task, getTaskProjects(task.id).map((project) => project.id));
  };

  const handleAddSubtask = (task: ProjectTask) => {
    openTaskModal(
      {
        title: '',
        isCompleted: false,
        dueDate: '',
        notes: '',
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
        setTasks((previousTasks) => previousTasks.filter((task) => !taskIdsToRemove.includes(task.id)));
        setProjectTasks((previous) => previous.filter((projectTask) => !taskIdsToRemove.includes(projectTask.task_id)));
        toast.success(descendantTaskIds.length > 0 ? 'Tarefa e subtarefas excluídas' : 'Tarefa excluída com sucesso');
      } else {
        setTasks((previousTasks) =>
          previousTasks
            .filter((task) => task.id !== taskId)
            .map((task) =>
              task.parentTaskId === taskId || (task as any).parent_task_id === taskId
                ? { ...task, parentTaskId: undefined, parent_task_id: undefined }
                : task
            )
        );
        setProjectTasks((previous) => previous.filter((projectTask) => projectTask.task_id !== taskId));
        toast.success('Tarefa excluída e subtarefas mantidas');
      }
      await refreshProjectData().catch(() => undefined);
    } catch (error: any) {
      toast.error(error?.message ?? 'Erro ao excluir tarefa');
      throw error;
    }
  };

  const handleSaveTask = async (
    task: CreateTaskDto & { id?: string },
    selectedProjectIds: string[] = []
  ): Promise<void> => {
    if (!projectId) return;

    try {
      if (task.id) {
        await tasksApi.update(task.id, toTaskPayload(task));
        await syncTaskProjects(task.id, selectedProjectIds);
        await refreshProjectData();
        toast.success('Tarefa atualizada');
      } else {
        const createdTaskResponse = await tasksApi.create(toTaskPayload(task));
        const createdTask = createdTaskResponse.data;
        const normalizedSelectedProjectIds = Array.from(new Set(selectedProjectIds.filter(Boolean)));
        const targetProjectIds =
          normalizedSelectedProjectIds.length > 0 ? normalizedSelectedProjectIds : [projectId];
        await syncTaskProjects(createdTask.id, targetProjectIds);
        toast.success('Tarefa criada com sucesso');
        await refreshProjectData();
      }
    } catch (error: any) {
      await refreshProjectData().catch(() => undefined);
      toast.error(error?.message ?? 'Erro ao salvar tarefa');
      throw error;
    }
  };

  return (
    <>
      <TaskViewLayout
        title={currentProject?.name ?? 'Projeto'}
        description={currentProject?.description ?? 'Visualize e gerencie as tarefas deste projeto.'}
        color={currentProject?.color}
      >
        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="text-sm font-medium text-slate-500">Carregando projeto...</p>
          </div>
        ) : !currentProject ? (
          <div className="flex flex-1 items-center justify-center px-6 py-8 text-sm text-slate-500">Projeto nao encontrado.</div>
        ) : (
          <TaskTable
            visibleTasks={visibleTasks}
            activeView={projectId ?? ''}
            activeCustomFields={activeCustomFields}
            getFieldValue={getFieldValue}
            updateCustomValue={updateCustomValue}
            toggleTaskCompletion={toggleTaskCompletion}
            addTask={addTask}
            projects={projects}
            getTaskProjects={getTaskProjects}
            addProjectToTask={() => undefined}
            removeProjectFromTask={() => undefined}
            updateTaskTitle={updateTaskTitle}
            updateTaskDueDate={updateTaskDueDate}
            updateTaskInline={updateTaskInline}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onAddSubtask={handleAddSubtask}
          />
        )}

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

export default ProjectsPage;
