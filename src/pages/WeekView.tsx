import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TaskTable from '../components/TaskTable';
import AddTaskModal from '../components/AddTaskModal';

const INITIAL_TASKS = [
  { id: 't1', title: 'Definir paleta de cores', is_completed: true, due_date: '2026-02-03', owner_id: 'auth0|1' },
  { id: 't2', title: 'Desenvolver Homepage', is_completed: false, due_date: '2026-02-05', owner_id: 'auth0|2' },
  { id: 't3', title: 'Revisar métricas Q2', is_completed: false, due_date: '2026-02-10', owner_id: 'auth0|1' },
  { id: 't4', title: 'Reunião de planejamento', is_completed: false, due_date: '2026-02-01', owner_id: 'auth0|1' },
  { id: 't5', title: 'Atualizar documentação', is_completed: false, due_date: '2026-02-07', owner_id: 'auth0|2' },
];

const INITIAL_PROJECTS = [
  { id: 'p1', name: 'Lançamento Website', description: 'Redesign e launch', color: 'bg-blue-500', owner_id: 'auth0|1' },
  { id: 'p2', name: 'Roadmap Q3', description: 'Planejamento trimestral', color: 'bg-emerald-500', owner_id: 'auth0|1' },
  { id: 'p3', name: 'Marketing Social', description: 'Campanhas redes sociais', color: 'bg-purple-500', owner_id: 'auth0|2' }
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

const WeekView = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [projectTasks] = useState(INITIAL_PROJECT_TASKS);
  const [projects] = useState(INITIAL_PROJECTS);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);

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
      if (!task.due_date) return false;
      return task.due_date >= startStr && task.due_date <= endStr;
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
      t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
    ));
  };

  const addTask = () => {
    const newTask = {
      id: `t-${Date.now()}`,
      title: '',
      is_completed: false,
      due_date: currentWeekStart.toISOString().split('T')[0],
      owner_id: 'auth0|1'
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTaskTitle = (taskId: string, title: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, title } : t));
  };

  const updateTaskDueDate = (taskId: string, due_date: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, due_date } : t));
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

  const getFieldValue = () => '';
  const updateCustomValue = () => { };
  const handleEditTask = (task: any) => {
    setTaskToEdit(task);
    setShowEditTaskModal(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const handleSaveTask = (task: any) => {
    if (task.id) {
      // Edit existing
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...task } : t));
    } else {
      // Add new
      const newTask = { ...task, id: `t-${Date.now()}` };
      setTasks(prev => [...prev, newTask]);
    }
  };
  return (
    <>
      {/* HEADER */}
      <header className="border-b border-slate-200 px-6 bg-white shrink-0">
        <div className="h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              Esta Semana
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={goToPreviousWeek}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                title="Semana anterior"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="text-sm text-slate-600 font-medium min-w-[200px] text-center">
                {formatDate(currentWeekStart)} - {formatDate(currentWeekEnd)}
              </span>
              <button
                onClick={goToNextWeek}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                title="Próxima semana"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={goToCurrentWeek}
                className="ml-2 px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                Hoje
              </button>
            </div>
          </div>
        </div>

        {/* Calendar overview (week of month) */}
        <div className="pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {weeksInMonth.map((week, idx) => {
              const isActive = currentWeekStart >= week.start && currentWeekStart <= week.end;
              return (
                <button
                  key={`${week.start.toISOString()}-${idx}`}
                  onClick={() => setCurrentWeekStart(getMonday(week.start))}
                  className={`text-left p-2 rounded-md border text-xs transition-colors ${isActive
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  <div className="font-semibold">Semana {idx + 1}</div>
                  <div className="text-[10px]">{formatDate(week.start)} - {formatDate(week.end)}</div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* TASK LIST */}
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
    </>
  );
};

export default WeekView;
