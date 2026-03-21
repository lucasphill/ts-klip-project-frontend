import { useState, useEffect } from 'react';
import TaskTable from '../components/TaskTable';
import AddTaskModal from '../components/AddTaskModal';
import TaskViewLayout from '../components/TaskViewLayout';
import { toast } from 'sonner';
import { projectsApi, tasksApi, projectsTasksApi } from '../services/api';
import type { GetProjectsDto, GetTasksDto, CreateTaskDto } from '../types/apiTypes';

const HomePage = () => {
  const [projects, setProjects] = useState<GetProjectsDto[]>([]);
  const [tasks, setTasks] = useState<GetTasksDto[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll();
      const projs = response.data ?? [];
      setProjects(projs);

      // Carrega vínculos projeto->tarefa para manter estado após reload
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
    } catch (error: any) {
      toast.error(error?.message ?? 'Erro ao buscar projetos');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await tasksApi.getAll();
      //normalize due date field
      const normalizedTasks = (response.data ?? []).map((task: any) => {
        const rawDueDate = task.dueDate ?? task.due_date;

        return {
          ...task,
          dueDate:
            typeof rawDueDate === 'string' && rawDueDate.trim()
              ? rawDueDate.split('T')[0]
              : undefined,
        };
      });
      console.log('Tarefas carregadas:', normalizedTasks);
      setTasks(normalizedTasks);
    } catch (error: any) {
      toast.error(error?.message ?? 'Erro ao buscar tarefas');
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => {
      const next = prev.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
      const toggled = next.find(t => t.id === taskId);
      if (!toggled) return next;

      (async () => {
        const payload: CreateTaskDto = {
          title: toggled.title ?? '',
          dueDate: (toggled as any).dueDate ?? (toggled as any).due_date,
          isCompleted: toggled.isCompleted ?? (toggled as any).is_completed ?? false,
          notes: (toggled as any).notes,
          parentTaskId: (toggled as any).parentTaskId ?? (toggled as any).parent_task_id
        };
        try {
          await tasksApi.update(toggled.id, payload);
          toast.success('Status da tarefa atualizado');
        } catch (error: any) {
          toast.error(error?.message ?? 'Erro ao atualizar status');
          // rollback
          setTasks(prev2 => prev2.map(pt => pt.id === taskId ? { ...pt, isCompleted: !(pt.isCompleted ?? (pt as any).is_completed) } : pt));
        }
      })();

      return next;
    });
  };

  const addTask = () => {
    const draft = {
      title: '',
      isCompleted: false,
      dueDate: new Date().toISOString().split('T')[0],
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

  const updateTaskTitle = (taskId: string, title: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, title } : t));
  };

  const updateTaskDueDate = (taskId: string, dueDate: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, dueDate } : t));
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
        setTasks(prev => prev.filter(t => t.id !== taskId));
        toast.success('Tarefa excluída');
      } catch (error: any) {
        toast.error(error?.message ?? 'Erro ao excluir tarefa');
      }
    })();
  };

  const handleSaveTask = (task: any) => {
    const isTemp = typeof task.id === 'string' && task.id.startsWith('t-');

    if (isTemp) {
      // Create on API and replace temporary task with server response
      (async () => {
        try {
          const payload = {
            title: task.title ?? '',
            dueDate: task.dueDate ?? task.due_date,
            isCompleted: task.isCompleted ?? task.is_completed ?? false,
            notes: task.notes,
            parentTaskId: task.parentTaskId ?? task.parentTaskId
          } as any;

          const response = await tasksApi.create(payload);
          const created: GetTasksDto = response.data;
          setTasks(prev => prev.map(t => t.id === task.id ? created : t));
          toast.success('Tarefa criada com sucesso');
        } catch (error: any) {
          toast.error(error?.message ?? 'Erro ao criar tarefa');
        } finally {
          setShowEditTaskModal(false);
          setTaskToEdit(null);
        }
      })();
    } else if (task.id) {
      // Edit existing: update locally and try to persist
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...task } : t));
      (async () => {
        try {
          const payload = {
            title: task.title ?? '',
            dueDate: task.dueDate ?? task.due_date,
            isCompleted: task.isCompleted ?? task.is_completed ?? false,
            notes: task.notes,
            parentTaskId: task.parentTaskId ?? task.parentTaskId
          } as any;
          await tasksApi.update(task.id, payload);
          toast.success('Tarefa atualizada');
        } catch (error: any) {
          toast.error(error?.message ?? 'Erro ao atualizar tarefa');
        } finally {
          setShowEditTaskModal(false);
          setTaskToEdit(null);
        }
      })();
    } else {
      // No id → create on API and append to list
      (async () => {
        try {
          const payload = {
            title: task.title ?? '',
            dueDate: task.dueDate ?? task.due_date,
            isCompleted: task.isCompleted ?? task.is_completed ?? false,
            notes: task.notes,
            parentTaskId: task.parentTaskId ?? task.parentTaskId
          } as any;

          const response = await tasksApi.create(payload);
          const created: GetTasksDto = response.data;
          setTasks(prev => [...prev, created]);
          toast.success('Tarefa criada com sucesso');
        } catch (error: any) {
          toast.error(error?.message ?? 'Erro ao criar tarefa');
        } finally {
          setShowEditTaskModal(false);
          setTaskToEdit(null);
        }
      })();
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