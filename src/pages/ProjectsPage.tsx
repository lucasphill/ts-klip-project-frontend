import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import TaskTable from '../components/TaskTable';
import AddTaskModal from '../components/AddTaskModal';
import TaskViewLayout from '../components/TaskViewLayout';
import { useProjectsContext } from '../contexts/ProjectsContext';
import { buildParentTaskOptions, getDescendantTaskIds } from '../lib/taskHierarchy';
import {
  customFieldDefinitionsApi,
  customFieldValuesApi,
  projectsCustomFieldDefinitionsApi,
  projectsTasksApi,
  tasksApi,
} from '../services/api';
import type {
  CreateCustomFieldDefinitionDto,
  CreateCustomFieldValueDto,
  CreateTaskDto,
  CustomFieldValue,
  GetCustomFieldDefinitionDto,
  GetProjectsDto,
  GetTasksDto,
  GetTasksWithCustomFieldsDto,
} from '../types/apiTypes';

type ProjectTask = GetTasksDto & {
  customFields?: Record<string, CustomFieldValue>;
};

const normalizeDueDate = (value?: string | null) => {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }

  return value.split('T')[0];
};

const normalizeTask = (task: GetTasksDto | GetTasksWithCustomFieldsDto): ProjectTask => ({
  ...task,
  dueDate: normalizeDueDate(task.dueDate),
  customFields: 'customFields' in task ? task.customFields ?? {} : {},
});

const normalizeFieldOptions = (options?: string | string[] | null) => {
  if (Array.isArray(options)) {
    return options.map((option) => option.trim()).filter(Boolean);
  }

  return String(options ?? '')
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean);
};

const normalizeFieldKey = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

const normalizeCustomField = (field: GetCustomFieldDefinitionDto): GetCustomFieldDefinitionDto => ({
  ...field,
  options: normalizeFieldOptions(field.options),
});

const areSameOptions = (left: string[], right: string[]) =>
  left.length === right.length && left.every((option, index) => option === right[index]);

const toTaskPayload = (task: CreateTaskDto) => ({
  title: task.title.trim(),
  dueDate: task.dueDate ? `${task.dueDate}T00:00:00` : undefined,
  isCompleted: task.isCompleted ?? false,
  notes: task.notes?.trim() || undefined,
  parentTaskId: task.parentTaskId?.trim() || undefined,
});

const buildCustomFieldValuePayload = (
  taskId: string,
  customFieldId: string,
  fieldType: GetCustomFieldDefinitionDto['type'],
  value: CustomFieldValue
): CreateCustomFieldValueDto => {
  const payload: CreateCustomFieldValueDto = {
    taskId,
    customFieldId,
  };

  if (fieldType === 'number') {
    payload.valueNumber =
      value === undefined || value === null || value === '' ? undefined : Number(value);
    return payload;
  }

  payload.valueText = value === undefined || value === null ? '' : String(value);
  return payload;
};

const ProjectsPage = () => {
  const { projectId } = useParams();
  const { projects, fetchProjects } = useProjectsContext();
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [customFields, setCustomFields] = useState<GetCustomFieldDefinitionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<(CreateTaskDto & { id?: string }) | null>(null);
  const [projectTasks, setProjectTasks] = useState<{ project_id: string; task_id: string }[]>([]);
  const [taskProjectIds, setTaskProjectIds] = useState<string[]>([]);

  const currentProject = useMemo(
    () => projects.find((project) => project.id === projectId) ?? null,
    [projectId, projects]
  );
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
      setCustomFields((projectFieldsResponse.data ?? []).map(normalizeCustomField));
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
    const task = tasks.find((item) => item.id === taskId);
    const field = customFields.find((item) => item.id === fieldId);

    if (!task) return '';
    if (task.customFields?.[fieldId] !== undefined) return task.customFields[fieldId];
    if (field && task.customFields?.[field.name] !== undefined) return task.customFields[field.name];

    if (field && task.customFields) {
      const normalizedTargetKey = normalizeFieldKey(field.name);
      const matchingEntry = Object.entries(task.customFields).find(([key]) => normalizeFieldKey(key) === normalizedTargetKey);
      if (matchingEntry) {
        return matchingEntry[1];
      }
    }

    return '';
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
    const field = customFields.find((item) => item.id === fieldId);
    const task = tasks.find((item) => item.id === taskId);
    if (!field || !task || !projectId) return;

    const previousCustomFields = { ...(task.customFields ?? {}) };
    const nextCustomFields = { ...(task.customFields ?? {}) };
    delete nextCustomFields[fieldId];
    nextCustomFields[field.name] = value;

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

    const payload = buildCustomFieldValuePayload(taskId, fieldId, field.type, value);
    const request = hasCurrentValue ? customFieldValuesApi.update(payload, projectId) : customFieldValuesApi.create(payload, projectId);

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

  const handleDeleteTask = async (taskId: string): Promise<boolean> => {
    const descendantTaskIds = getDescendantTaskIds(tasks, taskId);
    const taskIdsToRemove = [taskId, ...descendantTaskIds];
    const confirmationMessage =
      descendantTaskIds.length > 0
        ? `Esta tarefa possui ${descendantTaskIds.length} subtarefa(s). Ao excluir a tarefa pai, todas as tarefas filho tambem serao excluidas. Deseja continuar?`
        : 'Tem certeza que deseja excluir esta tarefa?';

    if (!confirm(confirmationMessage)) return false;

    try {
      await tasksApi.remove(taskId);
      setTasks((previousTasks) => previousTasks.filter((task) => !taskIdsToRemove.includes(task.id)));
      setProjectTasks((previous) => previous.filter((projectTask) => !taskIdsToRemove.includes(projectTask.task_id)));
      toast.success(descendantTaskIds.length > 0 ? 'Tarefa e subtarefas excluidas' : 'Tarefa excluida com sucesso');
      return true;
    } catch (error: any) {
      toast.error(error?.message ?? 'Erro ao excluir tarefa');
      return false;
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
        setTasks((previousTasks) =>
          previousTasks.map((currentTask) =>
            currentTask.id === task.id ? { ...currentTask, ...task } : currentTask
          )
        );
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
      toast.error(error?.message ?? 'Erro ao salvar tarefa');
      throw error;
    }
  };

  const handleCreateCustomField = async (field: CreateCustomFieldDefinitionDto) => {
    if (!projectId) return;

    const normalizedNewOptions = normalizeFieldOptions(field.options);

    try {
      await customFieldDefinitionsApi.create({
        ...field,
        options: normalizedNewOptions.length > 0 ? normalizedNewOptions.join(',') : undefined,
      });

      const allFieldsResponse = await customFieldDefinitionsApi.getAll();
      const matchingField = (allFieldsResponse.data ?? [])
        .map(normalizeCustomField)
        .filter((item) =>
          item.name.trim().toLowerCase() === field.name.trim().toLowerCase()
          && item.type === field.type
          && areSameOptions(normalizeFieldOptions(item.options), normalizedNewOptions)
        )
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];

      if (!matchingField) {
        throw new Error('Nao foi possivel localizar o campo criado para vincular ao projeto.');
      }

      await projectsCustomFieldDefinitionsApi.assign(projectId, matchingField.id);
      setCustomFields((previousFields) => {
        const nextFields = previousFields.filter((item) => item.id !== matchingField.id);
        return [...nextFields, matchingField];
      });
      toast.success('Campo personalizado adicionado ao projeto');
    } catch (error: any) {
      toast.error(error?.message ?? 'Erro ao criar campo personalizado');
      throw error;
    }
  };

  const handleRemoveCustomField = async (field: GetCustomFieldDefinitionDto) => {
    if (!projectId) return;

    try {
      await projectsCustomFieldDefinitionsApi.unassign(projectId, field.id);
      setCustomFields((previousFields) => previousFields.filter((item) => item.id !== field.id));
      toast.success('Campo removido do projeto');
    } catch (error: any) {
      toast.error(error?.message ?? 'Erro ao remover campo personalizado');
    }
  };

  return (
    <>
      <TaskViewLayout
        title={currentProject?.name ?? 'Projeto'}
        description={currentProject?.description ?? 'Visualize e gerencie as tarefas deste projeto.'}
        color={currentProject?.color}
        canAddCustomField={!!currentProject}
        customFields={customFields}
        onCreateCustomField={handleCreateCustomField}
        onRemoveCustomField={handleRemoveCustomField}
      >
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center px-6 py-8 text-sm text-slate-500">Carregando projeto...</div>
        ) : !currentProject ? (
          <div className="flex flex-1 items-center justify-center px-6 py-8 text-sm text-slate-500">Projeto nao encontrado.</div>
        ) : (
          <TaskTable
            visibleTasks={tasks}
            activeView={projectId ?? ''}
            activeCustomFields={customFields}
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
      </TaskViewLayout>
    </>
  );
};

export default ProjectsPage;
