import { useState, useEffect } from 'react';
import TaskTable from '../components/TaskTable';
import AddTaskModal from '../components/AddTaskModal';
import TaskViewLayout from '../components/TaskViewLayout';
import { toast } from 'sonner';
import { tasksApi, projectsTasksApi } from '../services/api';
import type { GetProjectsDto, GetTasksDto, CreateTaskDto } from '../types/apiTypes';
import { useTasksContext } from '../contexts/TasksContext';
import { useProjectsContext } from '../contexts/ProjectsContext';

const HomePage = () => {
  const { tasks, fetchTasks, appendTask, updateTaskLocal, removeTaskLocal } = useTasksContext();
  const { projects, fetchProjects } = useProjectsContext();
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);

  const loadProjectTaskAssignments = async (projs: GetProjectsDto[]) => {
    try {
      const promises = projs.map(p => projectsTasksApi.getByProject(p.id));
      const results = await Promise.all(promises);
      const assignments: { project_id: string; task_id: string }[] = [];
      results.forEach((res, idx) => {
        const projectId = projs[idx].id;
        const tasksForProject = res?.data ?? [];
        tasksForProject.forEach((t: any) => {
          if (t?.id) assignments.push({ project_id: projectId, task_id: t.id });
        });
      });
      setProjectTasks(assignments);
    } catch (err) {
      console.error('Erro ao carregar vínculos projeto-tarefa', err);
    }
  };

  useEffect(() => {
    fetchProjects()
      .then(projs => loadProjectTaskAssignments(projs))
      .catch((error: any) => toast.error(error?.message ?? 'Erro ao buscar projetos'));
    fetchTasks().catch((error: any) => {
      toast.error(error?.message ?? 'Erro ao buscar tarefas');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTaskCompletion = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newCompleted = !(task.isCompleted ?? false);
    updateTaskLocal(taskId, { isCompleted: newCompleted });

    (async () => {
      const payload: CreateTaskDto = {
        title: task.title ?? '',
        dueDate: (task as any).dueDate ?? (task as any).due_date,
        isCompleted: newCompleted,
        notes: (task as any).notes,
        parentTaskId: (task as any).parentTaskId ?? (task as any).parent_task_id,
      };
      try {
        await tasksApi.update(task.id, payload);
        toast.success('Status da tarefa atualizado');
      } catch (error: any) {
        toast.error(error?.message ?? 'Erro ao atualizar status');
        updateTaskLocal(taskId, { isCompleted: !newCompleted }); // rollback
      }
    })();
  };

  const addTask = () => {
    const draft = {
      title: '',
      isCompleted: false,
      dueDate: '',
      notes: '',
      parentTaskId: ''
    } as any;
    setTaskToEdit(draft);
    setShowEditTaskModal(true);
  };

  const addProjectToTask = (taskId: string, projectId: string) => {
    // Evita duplicatas
    const exists = projectTasks.some(pt => pt.task_id === taskId && pt.project_id === projectId);
    if (!exists && projectId) {
      // Optimistic UI
      setProjectTasks(prev => [...prev, { project_id: projectId, task_id: taskId }]);
      (async () => {
        try {
          await projectsTasksApi.assign(projectId, taskId);
          toast.success('Projeto vinculado à tarefa');
        } catch (error: any) {
          toast.error(error?.message ?? 'Erro ao vincular projeto');
          setProjectTasks(prev => prev.filter(pt => !(pt.task_id === taskId && pt.project_id === projectId)));
        }
      })();
    }
  };

  const removeProjectFromTask = (taskId: string, projectId: string) => {
    // Optimistic UI: remove locally then call API
    const existed = projectTasks.some(pt => pt.task_id === taskId && pt.project_id === projectId);
    if (!existed) return;
    setProjectTasks(prev => prev.filter(pt => !(pt.task_id === taskId && pt.project_id === projectId)));
    (async () => {
      try {
        await projectsTasksApi.unassign(projectId, taskId);
        toast.success('Projeto desvinculado da tarefa');
      } catch (error: any) {
        toast.error(error?.message ?? 'Erro ao desvincular projeto');
        // rollback
        setProjectTasks(prev => [...prev, { project_id: projectId, task_id: taskId }]);
      }
    })();
  };

  const getTaskProjects = (taskId: string) => {
    const projectIds = projectTasks
      .filter(pt => pt.task_id === taskId)
      .map(pt => pt.project_id);
    return projects.filter(p => projectIds.includes(p.id));
  };

  const persistTaskUpdate = async (taskId: string, updates: Partial<GetTasksDto>) => {
    const existing = tasks.find(t => t.id === taskId);
    if (!existing) return;
    const updated = { ...existing, ...updates };
    updateTaskLocal(taskId, updates);
    try {
      await tasksApi.update(taskId, {
        title: updated.title?.trim() ?? '',
        dueDate: updated.dueDate ? `${updated.dueDate}T00:00:00` : undefined,
        isCompleted: updated.isCompleted ?? false,
        notes: (updated as any).notes?.trim() || undefined,
        parentTaskId: (updated as any).parentTaskId?.trim() || undefined,
      });
    } catch (error: any) {
      toast.error(error?.message ?? 'Erro ao atualizar tarefa');
      updateTaskLocal(taskId, existing); // rollback
    }
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
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    (async () => {
      try {
        await tasksApi.remove(taskId);
        removeTaskLocal(taskId);
        toast.success('Tarefa excluída');
      } catch (error: any) {
        toast.error(error?.message ?? 'Erro ao excluir tarefa');
      }
    })();
  };

  const handleSaveTask = async (task: any): Promise<void> => {
    const payload = {
      title: task.title ?? '',
      dueDate: task.dueDate ?? task.due_date,
      isCompleted: task.isCompleted ?? task.is_completed ?? false,
      notes: task.notes,
      parentTaskId: task.parentTaskId ?? task.parentTaskId,
    } as any;

    const isTemp = typeof task.id === 'string' && task.id.startsWith('t-');

    if (isTemp) {
      try {
        const response = await tasksApi.create(payload);
        const created: GetTasksDto = response.data;
        removeTaskLocal(task.id);
        appendTask(created);
        toast.success('Tarefa criada com sucesso');
      } catch (error: any) {
        toast.error(error?.message ?? 'Erro ao criar tarefa');
        throw error;
      }
    } else if (task.id) {
      updateTaskLocal(task.id, task);
      try {
        await tasksApi.update(task.id, payload);
        toast.success('Tarefa atualizada');
      } catch (error: any) {
        toast.error(error?.message ?? 'Erro ao atualizar tarefa');
        throw error;
      }
    } else {
      try {
        const response = await tasksApi.create(payload);
        const created: GetTasksDto = response.data;
        appendTask(created);
        toast.success('Tarefa criada com sucesso');
      } catch (error: any) {
        toast.error(error?.message ?? 'Erro ao criar tarefa');
        throw error;
      }
    }
  };

  // --- RENDERERS ---

  return (
    <>
      <TaskViewLayout
        title={'Todas as Tarefas'}
        description={'Visualize e gerencie todas as suas tarefas aqui.'}
        canAddCustomField={false}
      >
        {/* TASK LIST AREA */}
        <div className="flex-1 overflow-auto bg-white">
          <TaskTable
            visibleTasks={tasks}
            activeView={'all'}
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
        </div>

        {/* Edit Task Modal */}
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
}

export default HomePage;