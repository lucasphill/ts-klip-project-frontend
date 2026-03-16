import { useState, useMemo } from 'react';
import WeekNavigator from '../components/WeekNavigator';
import TaskTable from '../components/TaskTable';
import AddTaskModal from '../components/AddTaskModal';
import TaskViewLayout from '../components/TaskViewLayout';
import type { CreateTaskDto, CustomFieldValue, GetProjectsDto, GetTasksDto } from '../types/apiTypes';

const INITIAL_TASKS: GetTasksDto[] = [
  { id: 't1', title: 'Definir paleta de cores', isCompleted: true, dueDate: '2026-02-03', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 't2', title: 'Desenvolver Homepage', isCompleted: false, dueDate: '2026-02-05', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 't3', title: 'Revisar métricas Q2', isCompleted: false, dueDate: '2026-02-10', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 't4', title: 'Reunião de planejamento', isCompleted: false, dueDate: '2026-02-01', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 't5', title: 'Atualizar documentação', isCompleted: false, dueDate: '2026-02-07', createdAt: '2026-01-01T00:00:00.000Z' },
];

const INITIAL_PROJECTS: GetProjectsDto[] = [
  { id: 'p1', name: 'Lançamento Website', description: 'Redesign e launch', color: 'bg-blue-500', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'p2', name: 'Roadmap Q3', description: 'Planejamento trimestral', color: 'bg-emerald-500', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'p3', name: 'Marketing Social', description: 'Campanhas redes sociais', color: 'bg-purple-500', createdAt: '2026-01-01T00:00:00.000Z' }
];

const INITIAL_PROJECT_TASKS = [
  { project_id: 'p1', task_id: 't1' },
  { project_id: 'p1', task_id: 't2' },
  { project_id: 'p2', task_id: 't3' },
  { project_id: 'p3', task_id: 't4' },
  { project_id: 'p1', task_id: 't5' }
];

// Helper: Obter segunda-feira da semana de uma data
const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para segunda-feira
  return new Date(d.setDate(diff));
};

// Helper: Obter domingo da semana de uma data
const getSunday = (monday: Date): Date => {
  const d = new Date(monday);
  d.setDate(d.getDate() + 6);
  return d;
};

// Helper: Formatar data para exibição
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const WeekViewPage = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [tasks, setTasks] = useState<GetTasksDto[]>(INITIAL_TASKS);
  const [projectTasks] = useState(INITIAL_PROJECT_TASKS);
  const [projects] = useState<GetProjectsDto[]>(INITIAL_PROJECTS);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<(CreateTaskDto & { id?: string }) | null>(null);

  const currentMonth = useMemo(() => new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 1), [currentWeekStart]);

  const currentWeekEnd = useMemo(() => getSunday(currentWeekStart), [currentWeekStart]);

  const weeksInMonth = useMemo(() => {
    const weeks: { start: Date; end: Date }[] = [];
    const firstDay = new Date(currentMonth);
    const firstWeekStart = getMonday(firstDay);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    let cursor = new Date(firstWeekStart);

    while (cursor <= lastDay || weeks.length === 0) {
      const start = new Date(cursor);
      const end = getSunday(start);
      weeks.push({ start, end });
      cursor = new Date(end);
      cursor.setDate(cursor.getDate() + 1);
    }

    return weeks;
  }, [currentMonth]);

  // Filtrar tarefas da semana atual
  const weekTasks = useMemo(() => {
    const startStr = currentWeekStart.toISOString().split('T')[0];
    const endStr = currentWeekEnd.toISOString().split('T')[0];

    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return task.dueDate >= startStr && task.dueDate <= endStr;
    });
  }, [tasks, currentWeekStart, currentWeekEnd]);

  // Navegação entre semanas
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(getMonday(newDate));
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(getMonday(newDate));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  // Actions
  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    ));
  };

  const addTask = () => {
    const newTask: GetTasksDto = {
      id: `t-${Date.now()}`,
      title: '',
      isCompleted: false,
      dueDate: currentWeekStart.toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTaskTitle = (taskId: string, title: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, title } : t));
  };

  const updateTaskDueDate = (taskId: string, dueDate: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, dueDate } : t));
  };

  const getTaskProjects = (taskId: string) => {
    const projectIds = projectTasks
      .filter(pt => pt.task_id === taskId)
      .map(pt => pt.project_id);
    return projects.filter(p => projectIds.includes(p.id));
  };

  const addProjectToTask = (_taskId: string, _projectId: string) => {
    // Not implemented in this view
  };

  const removeProjectFromTask = (_taskId: string, _projectId: string) => {
    // Not implemented in this view
  };

  const getFieldValue = (_taskId: string, _fieldId: string) => '';
  const updateCustomValue = (_taskId: string, _fieldId: string, _value: CustomFieldValue) => { };
  const handleEditTask = (task: GetTasksDto) => {
    setTaskToEdit(task);
    setShowEditTaskModal(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const handleSaveTask = (task: CreateTaskDto & { id?: string }) => {
    if (task.id) {
      // Edit existing
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...task } : t));
    } else {
      // Add new
      const newTask: GetTasksDto = {
        id: `t-${Date.now()}`,
        title: task.title,
        dueDate: task.dueDate,
        isCompleted: task.isCompleted,
        notes: task.notes,
        parentTaskId: task.parentTaskId,
        createdAt: new Date().toISOString()
      };
      setTasks(prev => [...prev, newTask]);
    }
  };
  return (
    <>
      <AddTaskModal
        isOpen={showEditTaskModal}
        onClose={() => {
          setShowEditTaskModal(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        task={taskToEdit}
      />
      <TaskViewLayout
        title={'Visão Semanal'}
        description={'Visualize e gerencie suas tarefas desta semana.'}
        canAddCustomField={false}
      >
        <WeekNavigator
          currentWeekStart={currentWeekStart}
          currentWeekEnd={currentWeekEnd}
          onPrev={goToPreviousWeek}
          onNext={goToNextWeek}
          onToday={goToCurrentWeek}
          formatDate={formatDate}
          currentMonth={currentMonth}
          weeksInMonth={weeksInMonth}
          onSelectWeek={(start) => setCurrentWeekStart(getMonday(start))}
        />
        {/* TASK LIST AREA */}
        <div className="flex-1 overflow-auto bg-white">
          <TaskTable
            visibleTasks={weekTasks}
            activeView="week"
            activeCustomFields={[]}
            getFieldValue={getFieldValue}
            updateCustomValue={updateCustomValue}
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
};

export default WeekViewPage;
