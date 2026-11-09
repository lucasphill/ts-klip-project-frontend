import { useEffect, useMemo, useState } from "react";
import TaskTable, { type TaskTableTask } from "../components/TaskTable";
import AddTaskModal from "../components/AddTaskModal";
import TaskViewLayout from "../components/TaskViewLayout";
import type { CreateTaskDto, CustomFieldValue } from "../types/apiTypes";
import type { Task } from "../gateway/klipGateway";
import { useProjectsContext } from "../contexts/ProjectsContext";
import { useCustomFieldDefinitionsContext } from "../contexts/CustomFieldDefinitionsContext";
import { buildParentTaskOptions, getDescendantTaskIds } from "../lib/taskHierarchy";
import { getCustomFieldValueByDefinition } from "../lib/customFields";
import { DeleteTaskModal } from "../components/DeleteTaskModal";
import type { DeleteTaskTarget } from "../types/taskDeletion";
import { useTaskOperations } from "../taskOperations/useTaskOperations";

type TaskDraft = CreateTaskDto & { id?: string };

const toTableTask = (task: Task): TaskTableTask => ({
  ...task,
  dueDate: task.dueDate ?? undefined,
  createdAt: task.createdAt ?? undefined,
});

const HomePage = () => {
  const { tasks, create, update, toggle, setProjects, setCustomValue, deleteTask } = useTaskOperations();
  const { projects, fetchProjects } = useProjectsContext();
  const { universalCustomFields } = useCustomFieldDefinitionsContext();
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskDraft | null>(null);
  const [taskProjectIds, setTaskProjectIds] = useState<string[]>([]);
  const [taskToDelete, setTaskToDelete] = useState<DeleteTaskTarget | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tableTasks = useMemo(() => tasks.map(toTableTask), [tasks]);
  const tasksById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);

  const availableParentTasks = useMemo(
    () => buildParentTaskOptions(tableTasks, taskToEdit?.id),
    [tableTasks, taskToEdit?.id]
  );

  // Tasks revalidate through Task operations (mount, focus, 30s cache). Projects still live in their context.
  useEffect(() => {
    void fetchProjects({ force: true }).catch(() => undefined);

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        void fetchProjects({ force: true }).catch(() => undefined);
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchProjects]);

  const projectIdsOf = (taskId: string) => tasksById.get(taskId)?.projectIds ?? [];

  const getTaskProjects = (taskId: string) => {
    const ids = projectIdsOf(taskId);
    return projects.filter((project) => ids.includes(project.id));
  };

  const updateTaskInline = (taskId: string, updates: { title?: string; dueDate?: string; notes?: string }) =>
    update(taskId, updates, updates.notes !== undefined ? { success: "Observação da tarefa atualizada" } : {});

  const getFieldValue = (taskId: string, fieldId: string) =>
    getCustomFieldValueByDefinition(
      tasksById.get(taskId),
      universalCustomFields.find((item) => item.id === fieldId)
    );

  const updateCustomValue = (taskId: string, fieldId: string, value: CustomFieldValue) => {
    const field = universalCustomFields.find((item) => item.id === fieldId);
    if (!field) return;
    void setCustomValue(taskId, field, value);
  };

  const addProjectToTask = (taskId: string, projectId: string) => {
    const current = projectIdsOf(taskId);
    if (!projectId || current.includes(projectId)) return;
    void setProjects(taskId, [...current, projectId], {
      success: "Projeto vinculado à tarefa",
      error: "Erro ao vincular projeto",
    });
  };

  const removeProjectFromTask = (taskId: string, projectId: string) => {
    const current = projectIdsOf(taskId);
    if (!current.includes(projectId)) return;
    void setProjects(
      taskId,
      current.filter((id) => id !== projectId),
      { success: "Projeto desvinculado da tarefa", error: "Erro ao desvincular projeto" }
    );
  };

  const openTaskModal = (taskDraft: TaskDraft, selectedProjectIds: string[] = []) => {
    setTaskToEdit(taskDraft);
    setTaskProjectIds(selectedProjectIds);
    setShowEditTaskModal(true);
  };

  const addTask = (initialTitle = "") => {
    openTaskModal({ title: initialTitle, isCompleted: false, dueDate: "", notes: "", parentTaskId: "" });
  };

  const quickAddTask = (title: string) =>
    handleSaveTask({ title, isCompleted: false, dueDate: "", notes: "", parentTaskId: "" }, []);

  const handleEditTask = (task: TaskTableTask) => {
    openTaskModal(task, projectIdsOf(task.id));
  };

  const handleAddSubtask = (task: TaskTableTask) => {
    openTaskModal(
      { title: "", isCompleted: false, dueDate: "", notes: "", parentTaskId: task.id },
      projectIdsOf(task.id)
    );
  };

  const handleDeleteTask = (taskId: string): boolean => {
    const task = tasksById.get(taskId);
    if (!task) return false;
    const descendantTaskIds = getDescendantTaskIds(tableTasks, taskId);
    setTaskToDelete({
      id: task.id,
      title: task.title,
      subtaskCount: descendantTaskIds.length,
      descendantTaskIds,
    });
    setShowDeleteModal(true);
    return true;
  };

  // The modals stay open when the command fails: they expect a rejection.
  const handleConfirmDelete = async (taskId: string, cascade?: boolean): Promise<void> => {
    const result = await deleteTask(taskId, cascade ? "cascade" : "detach");
    if (!result.ok) throw result.error;
  };

  const handleSaveTask = async (task: TaskDraft, selectedProjectIds: string[] = []): Promise<void> => {
    const fields = {
      title: task.title ?? "",
      notes: task.notes ?? null,
      dueDate: task.dueDate ?? null,
      isCompleted: task.isCompleted ?? false,
      parentTaskId: task.parentTaskId ?? null,
      projectIds: selectedProjectIds,
    };

    const result = task.id
      ? await update(task.id, fields, { success: "Tarefa atualizada" })
      : await create(fields);
    if (!result.ok) throw result.error;
  };

  return (
    <TaskViewLayout
      title="Inbox"
      description="Todas as suas tarefas em um só lugar."
    >
      <TaskTable
        visibleTasks={tableTasks}
        activeView="all"
        activeCustomFields={universalCustomFields}
        getFieldValue={getFieldValue}
        updateCustomValue={updateCustomValue}
        toggleTaskCompletion={(taskId) => void toggle(taskId)}
        addTask={addTask}
        onQuickAdd={quickAddTask}
        projects={projects}
        getTaskProjects={getTaskProjects}
        addProjectToTask={addProjectToTask}
        removeProjectFromTask={removeProjectFromTask}
        updateTaskTitle={(taskId, title) => void updateTaskInline(taskId, { title })}
        updateTaskDueDate={(taskId, dueDate) => void updateTaskInline(taskId, { dueDate })}
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
  );
};

export default HomePage;
