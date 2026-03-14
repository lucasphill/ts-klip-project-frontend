import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import TaskTable from '../components/TaskTable';
import AddTaskModal from '../components/AddTaskModal';
import TaskViewLayout from '../components/TaskViewLayout';
import type {
  CreateTaskDto,
  GetCustomFieldDefinitionDto,
  GetProjectsDto,
  GetTasksDto
} from '../types/apiTypes';

type ProjectTaskLink = {
  project_id: string;
  task_id: string;
};

type ProjectFieldLink = {
  project_id: string;
  custom_field_id: string;
};

type FieldValueRecord = {
  id: string;
  task_id: string;
  custom_field_id: string;
  value_text?: string;
  value_number?: number;
};

const INITIAL_PROJECTS: GetProjectsDto[] = [
  { id: 'p1', name: 'Lançamento Website', description: 'Redesign e launch', color: 'bg-blue-500', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'p2', name: 'Roadmap Q3', description: 'Planejamento trimestral', color: 'bg-emerald-500', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'p3', name: 'Marketing Social', description: 'Campanhas redes sociais', color: 'bg-purple-500', createdAt: '2026-01-01T00:00:00.000Z' }
];

const INITIAL_TASKS: GetTasksDto[] = [
  { id: 't1', title: 'Definir paleta de cores', isCompleted: true, dueDate: '2023-11-10', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 't2', title: 'Desenvolver Homepage', isCompleted: false, dueDate: '2023-11-15', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 't3', title: 'Revisar métricas Q2', isCompleted: false, dueDate: '2023-11-20', createdAt: '2026-01-01T00:00:00.000Z' },
];

// Tabela project_tasks (Many-to-Many)
const INITIAL_PROJECT_TASKS: ProjectTaskLink[] = [
  { project_id: 'p1', task_id: 't1' },
  { project_id: 'p1', task_id: 't2' },
  { project_id: 'p2', task_id: 't3' }
];

// Tabela custom_field_definitions
const INITIAL_FIELD_DEFS: GetCustomFieldDefinitionDto[] = [
  { id: 'cf1', name: 'Prioridade', type: 'enum', options: ['Alta', 'Média', 'Baixa'], createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cf2', name: 'Estimativa (Horas)', type: 'number', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cf3', name: 'Link Figma', type: 'text', createdAt: '2026-01-01T00:00:00.000Z' }
];

// Tabela project_custom_fields (Quais campos pertencem a quais projetos)
const INITIAL_PROJECT_FIELDS: ProjectFieldLink[] = [
  { project_id: 'p1', custom_field_id: 'cf1' }, // Website tem Prioridade
  { project_id: 'p1', custom_field_id: 'cf3' }, // Website tem Link Figma
  { project_id: 'p2', custom_field_id: 'cf2' }, // Roadmap tem Estimativa
];

// Tabela custom_field_values (Valores reais)
const INITIAL_FIELD_VALUES: FieldValueRecord[] = [
  { id: 'v1', task_id: 't1', custom_field_id: 'cf1', value_text: 'Alta' },
  { id: 'v2', task_id: 't2', custom_field_id: 'cf3', value_text: 'figma.com/file/xyz' },
  { id: 'v3', task_id: 't3', custom_field_id: 'cf2', value_number: 4 },
];

// --- COMPONENTES ---

const ProjectsPage = () => {
  // --- ROUTING ---
  const { projectId } = useParams();
  const activeView = projectId || 'all'; // Se tem projectId na URL, usa ele; senão, é 'all'

  // --- STATE ---
  const [tasks, setTasks] = useState<GetTasksDto[]>(INITIAL_TASKS);
  const [projectTasks, setProjectTasks] = useState<ProjectTaskLink[]>(INITIAL_PROJECT_TASKS);
  const [customFields] = useState<GetCustomFieldDefinitionDto[]>(INITIAL_FIELD_DEFS);
  const [projectFields] = useState<ProjectFieldLink[]>(INITIAL_PROJECT_FIELDS);
  const [fieldValues, setFieldValues] = useState<FieldValueRecord[]>(INITIAL_FIELD_VALUES);
  const [projects] = useState<GetProjectsDto[]>(INITIAL_PROJECTS);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<(CreateTaskDto & { id?: string }) | null>(null);

  // --- DERIVED STATE ---

  const currentProject = projects.find(p => p.id === activeView) || null;

  // Filtrar tarefas baseadas na view atual
  const visibleTasks = useMemo(() => {
    if (activeView === 'all') return tasks;

    // Join logic: tasks -> project_tasks -> project
    const taskIdsInProject = projectTasks
      .filter(pt => pt.project_id === activeView)
      .map(pt => pt.task_id);

    return tasks.filter(t => taskIdsInProject.includes(t.id));
  }, [activeView, tasks, projectTasks]);

  // Obter campos customizados do projeto ativo
  const activeCustomFields = useMemo(() => {
    if (activeView === 'all') return [];

    const fieldIds = projectFields
      .filter(pf => pf.project_id === activeView)
      .map(pf => pf.custom_field_id);

    return customFields.filter(cf => fieldIds.includes(cf.id));
  }, [activeView, projectFields, customFields]);

  // --- ACTIONS ---

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    ));
  };

  const updateCustomValue = (taskId: string, fieldId: string, value: string | number) => {
    setFieldValues(prev => {
      // Verifica se já existe valor
      const existingIndex = prev.findIndex(v => v.task_id === taskId && v.custom_field_id === fieldId);

      const baseValue = {
        id: existingIndex >= 0 ? prev[existingIndex].id : `v-${Date.now()}`,
        task_id: taskId,
        custom_field_id: fieldId
      };

      const newValue: FieldValueRecord = typeof value === 'number'
        ? { ...baseValue, value_number: value }
        : { ...baseValue, value_text: value };

      if (existingIndex >= 0) {
        const newArr = [...prev];
        newArr[existingIndex] = newValue;
        return newArr;
      } else {
        return [...prev, newValue];
      }
    });
  };

  const addTask = () => {
    const newTask: GetTasksDto = {
      id: `t-${Date.now()}`,
      title: '',
      isCompleted: false,
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, newTask]);

    // Se estiver num projeto, cria o vínculo project_tasks
    if (activeView !== 'all') {
      setProjectTasks(prev => [...prev, { project_id: activeView, task_id: newTask.id }]);
    }
  };

  const addProjectToTask = (taskId: string, projectId: string) => {
    // Evita duplicatas
    const exists = projectTasks.some(pt => pt.task_id === taskId && pt.project_id === projectId);
    if (!exists && projectId) {
      setProjectTasks(prev => [...prev, { project_id: projectId, task_id: taskId }]);
    }
  };

  const removeProjectFromTask = (taskId: string, projectId: string) => {
    setProjectTasks(prev => prev.filter(pt => !(pt.task_id === taskId && pt.project_id === projectId)));
  };

  // Helper para pegar valor de campo customizado de forma segura
  const getFieldValue = (taskId: string, fieldId: string) => {
    const record = fieldValues.find(v => v.task_id === taskId && v.custom_field_id === fieldId);
    if (!record) return '';
    return record.value_text ?? record.value_number ?? '';
  };

  // Helper para pegar projetos de uma tarefa
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

  const handleEditTask = (task: GetTasksDto) => {
    setTaskToEdit(task);
    setShowEditTaskModal(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setProjectTasks(prev => prev.filter(pt => pt.task_id !== taskId));
      setFieldValues(prev => prev.filter(fv => fv.task_id !== taskId));
    }
  };

  const handleSaveTask = (task: CreateTaskDto & { id?: string }) => {
    if (task.id) {
      // Edit existing
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...task } : t));
    } else {
      // Add new (not used here, but keeping for consistency)
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
      if (activeView !== 'all') {
        setProjectTasks(prev => [...prev, { project_id: activeView, task_id: newTask.id }]);
      }
    }
  };

  // --- RENDERERS ---

  return (
    <>
      <TaskViewLayout
        title={currentProject ? currentProject.name : 'Todas as Tarefas'}
        description={currentProject?.description ?? 'Visualize e gerencie todas as suas tarefas aqui.'}
        color={currentProject ? currentProject.color : 'bg-slate-500'}
        canAddCustomField={!!currentProject}
      >
        {/* TASK LIST AREA */}
        <div className="flex-1 overflow-auto bg-white">
          <TaskTable
            visibleTasks={visibleTasks}
            activeView={activeView}
            activeCustomFields={activeCustomFields}
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
}

export default ProjectsPage;