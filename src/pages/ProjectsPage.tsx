import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import TaskTable from '../components/TaskTable';
import AddTaskModal from '../components/AddTaskModal';
import TaskViewLayout from '../components/TaskViewLayout';

const INITIAL_PROJECTS = [
  { id: 'p1', name: 'Lançamento Website', description: 'Redesign e launch', color: 'bg-blue-500', owner_id: 'auth0|1' },
  { id: 'p2', name: 'Roadmap Q3', description: 'Planejamento trimestral', color: 'bg-emerald-500', owner_id: 'auth0|1' },
  { id: 'p3', name: 'Marketing Social', description: 'Campanhas redes sociais', color: 'bg-purple-500', owner_id: 'auth0|2' }
];

const INITIAL_TASKS = [
  { id: 't1', title: 'Definir paleta de cores', is_completed: true, due_date: '2023-11-10', owner_id: 'u1' },
  { id: 't2', title: 'Desenvolver Homepage', is_completed: false, due_date: '2023-11-15', owner_id: 'u2' },
  { id: 't3', title: 'Revisar métricas Q2', is_completed: false, due_date: '2023-11-20', owner_id: 'u1' },
];

// Tabela project_tasks (Many-to-Many)
const INITIAL_PROJECT_TASKS = [
  { project_id: 'p1', task_id: 't1' },
  { project_id: 'p1', task_id: 't2' },
  { project_id: 'p2', task_id: 't3' }
];

// Tabela custom_field_definitions
const INITIAL_FIELD_DEFS = [
  { id: 'cf1', name: 'Prioridade', type: 'enum', options: ['Alta', 'Média', 'Baixa'] },
  { id: 'cf2', name: 'Estimativa (Horas)', type: 'number', options: null },
  { id: 'cf3', name: 'Link Figma', type: 'text', options: null }
];

// Tabela project_custom_fields (Quais campos pertencem a quais projetos)
const INITIAL_PROJECT_FIELDS = [
  { project_id: 'p1', custom_field_id: 'cf1' }, // Website tem Prioridade
  { project_id: 'p1', custom_field_id: 'cf3' }, // Website tem Link Figma
  { project_id: 'p2', custom_field_id: 'cf2' }, // Roadmap tem Estimativa
];

// Tabela custom_field_values (Valores reais)
const INITIAL_FIELD_VALUES = [
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
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [projectTasks, setProjectTasks] = useState(INITIAL_PROJECT_TASKS);
  const [customFields, setCustomFields] = useState(INITIAL_FIELD_DEFS);
  const [projectFields, setProjectFields] = useState(INITIAL_PROJECT_FIELDS);
  const [fieldValues, setFieldValues] = useState(INITIAL_FIELD_VALUES);
  const [projects] = useState(INITIAL_PROJECTS);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [isCreatingField, setIsCreatingField] = useState(false);
  const [newField, setNewField] = useState({ name: '', type: 'text', optionsString: '' });

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

  const toggleTaskCompletion = (taskId) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
    ));
  };

  const updateCustomValue = (taskId, fieldId, value) => {
    setFieldValues(prev => {
      // Verifica se já existe valor
      const existingIndex = prev.findIndex(v => v.task_id === taskId && v.custom_field_id === fieldId);

      const newValue = {
        id: existingIndex >= 0 ? prev[existingIndex].id : `v-${Date.now()}`,
        task_id: taskId,
        custom_field_id: fieldId,
        value_text: typeof value === 'string' ? value : null,
        value_number: typeof value === 'number' ? value : null
      };

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
    const newTask = {
      id: `t-${Date.now()}`,
      title: '',
      is_completed: false,
      due_date: new Date().toISOString().split('T')[0],
      owner_id: 'u1' // Default current user
    };

    setTasks(prev => [...prev, newTask]);

    // Se estiver num projeto, cria o vínculo project_tasks
    if (activeView !== 'all') {
      setProjectTasks(prev => [...prev, { project_id: activeView, task_id: newTask.id }]);
    }
  };

  const addProjectToTask = (taskId, projectId) => {
    // Evita duplicatas
    const exists = projectTasks.some(pt => pt.task_id === taskId && pt.project_id === projectId);
    if (!exists && projectId) {
      setProjectTasks(prev => [...prev, { project_id: projectId, task_id: taskId }]);
    }
  };

  const removeProjectFromTask = (taskId, projectId) => {
    setProjectTasks(prev => prev.filter(pt => !(pt.task_id === taskId && pt.project_id === projectId)));
  };

  // Helper para pegar valor de campo customizado de forma segura
  const getFieldValue = (taskId, fieldId) => {
    const record = fieldValues.find(v => v.task_id === taskId && v.custom_field_id === fieldId);
    if (!record) return '';
    return record.value_text || record.value_number || '';
  };

  // Helper para pegar projetos de uma tarefa
  const getTaskProjects = (taskId) => {
    const projectIds = projectTasks
      .filter(pt => pt.task_id === taskId)
      .map(pt => pt.project_id);
    return projects.filter(p => projectIds.includes(p.id));
  };

  const updateTaskTitle = (taskId: string, title: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, title } : t));
  };

  const updateTaskDueDate = (taskId: string, due_date: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, due_date } : t));
  };

  const addCustomFieldToProject = () => {
    if (!currentProject || !newField.name.trim()) return;

    const newFieldId = `cf-${Date.now()}`;
    const options = newField.type === 'enum' && newField.optionsString
      ? newField.optionsString.split(',').map(s => s.trim()).filter(Boolean)
      : null;

    setCustomFields(prev => ([
      ...prev,
      { id: newFieldId, name: newField.name.trim(), type: newField.type, options }
    ]));

    setProjectFields(prev => ([
      ...prev,
      { project_id: currentProject.id, custom_field_id: newFieldId }
    ]));

    setNewField({ name: '', type: 'text', optionsString: '' });
    setIsCreatingField(false);
  };

  const handleEditTask = (task: any) => {
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

  const handleSaveTask = (task: any) => {
    if (task.id) {
      // Edit existing
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...task } : t));
    } else {
      // Add new (not used here, but keeping for consistency)
      const newTask = { ...task, id: `t-${Date.now()}` };
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
        description={currentProject ? currentProject.description : 'Visualize e gerencie todas as suas tarefas aqui.'}
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