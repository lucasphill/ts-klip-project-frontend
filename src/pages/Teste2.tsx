import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  Layout,
  Settings2,
  ChevronRight,
  Hash,
  Type,
  List,
  FolderOpen,
  X,
  Bell,
  Search,
  User,
  LogOut
} from 'lucide-react';

// --- MOCK DATA (Simulando o Banco de Dados) ---

// Usuário atual simulando Auth0
const CURRENT_USER = {
  id: 'u1',
  auth0_id: 'auth0|123456',
  full_name: 'Ana Silva',
  email: 'ana@example.com',
  avatar_url: null // null para usar iniciais
};

const INITIAL_PROJECTS = [
  { id: 'p1', name: 'Lançamento Website', description: 'Redesign e launch', color: 'bg-blue-500' },
  { id: 'p2', name: 'Roadmap Q3', description: 'Planejamento trimestral', color: 'bg-emerald-500' },
  { id: 'p3', name: 'Marketing Social', description: 'Campanhas redes sociais', color: 'bg-purple-500' }
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

export default function Teste2() {
  // --- STATE ---
  const [activeView, setActiveView] = useState('all'); // 'all' ou project_id
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [projectTasks, setProjectTasks] = useState(INITIAL_PROJECT_TASKS);
  const [customFields, setCustomFields] = useState(INITIAL_FIELD_DEFS);
  const [projectFields, setProjectFields] = useState(INITIAL_PROJECT_FIELDS);
  const [fieldValues, setFieldValues] = useState(INITIAL_FIELD_VALUES);
  const [projects] = useState(INITIAL_PROJECTS);

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);

  // --- DERIVED STATE ---

  const currentProject = projects.find(p => p.id === activeView);

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

  const updateTaskDate = (taskId, newDate) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, due_date: newDate } : t
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

  const createNewField = (fieldData) => {
    const newFieldId = `cf-${Date.now()}`;
    const newField = { ...fieldData, id: newFieldId };

    // 1. Criar a definição do campo
    setCustomFields(prev => [...prev, newField]);

    // 2. Associar ao projeto atual
    setProjectFields(prev => [...prev, { project_id: activeView, custom_field_id: newFieldId }]);

    setIsFieldModalOpen(false);
  };

  const addTask = () => {
    const newTask = {
      id: `t-${Date.now()}`,
      title: '',
      is_completed: false,
      due_date: new Date().toISOString().split('T')[0],
      owner_id: CURRENT_USER.id
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

  // Helper para iniciais do usuário
  const getUserInitials = (name) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  // --- RENDERERS ---

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-800 font-sans">

      {/* GLOBAL TOP BAR */}
      <nav className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">

        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">TaskFlow</span>
        </div>

        {/* Center: Search (Optional decoration) */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-3 py-1.5 w-96 border border-transparent focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            className="bg-transparent border-none focus:ring-0 text-sm w-full p-0 text-slate-600 placeholder:text-slate-400"
          />
        </div>

        {/* Right: User Profile (Auth0 Mock) */}
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:text-slate-700 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          <div className="flex items-center gap-3 pl-1">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-700 leading-none">{CURRENT_USER.full_name}</div>
              <div className="text-xs text-slate-400 mt-1 leading-none">{CURRENT_USER.email}</div>
            </div>
            <div className="relative group cursor-pointer">
              {CURRENT_USER.avatar_url ? (
                <img src={CURRENT_USER.avatar_url} alt="User" className="w-9 h-9 rounded-full border border-slate-200" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 border border-indigo-200 flex items-center justify-center text-sm font-bold">
                  {getUserInitials(CURRENT_USER.full_name)}
                </div>
              )}
              {/* Dropdown mock */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 hidden group-hover:block">
                <div className="px-4 py-2 border-b border-slate-50 text-xs text-slate-400">Logado como {CURRENT_USER.email}</div>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                  <User className="w-4 h-4" /> Perfil
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            <button
              onClick={() => setActiveView('all')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${activeView === 'all' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-slate-200' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <FolderOpen className="w-4 h-4" />
              Minhas Tarefas
            </button>

            <div className="pt-6">
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projetos</h3>
                <button className="text-slate-400 hover:text-indigo-600"><Plus className="w-3 h-3" /></button>
              </div>
              <div className="space-y-0.5">
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => setActiveView(project.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-transparent
                      ${activeView === project.id ? 'bg-white shadow-sm border-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${project.color}`} />
                    {project.name}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 bg-white">

          {/* HEADER */}
          <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Espaço</span>
                <ChevronRight className="w-3 h-3" />
                <span className="font-medium text-slate-700">{currentProject ? 'Projeto' : 'Visão Geral'}</span>
              </div>
              <div className="h-4 w-px bg-slate-300 mx-2"></div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {currentProject && <span className={`w-3 h-3 rounded-full ${currentProject.color}`} />}
                {currentProject ? currentProject.name : 'Todas as Tarefas'}
              </h1>
            </div>

            {currentProject && (
              <button
                onClick={() => setIsFieldModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Campos
              </button>
            )}
          </header>

          {/* TASK LIST AREA */}
          <div className="flex-1 overflow-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="border-b border-slate-200">
                {/* TABLE HEADER */}
                <div className="flex items-center bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                  <div className="w-10 px-4 py-3 text-center"></div>
                  <div className="flex-1 px-4 py-3 border-r border-slate-200/60">Tarefa</div>

                  {activeView === 'all' && (
                    <div className="w-64 px-4 py-3 border-r border-slate-200/60">Projetos</div>
                  )}

                  <div className="w-40 px-4 py-3 border-r border-slate-200/60">Prazo</div>

                  {activeCustomFields.map(field => (
                    <div key={field.id} className="w-48 px-4 py-3 border-r border-slate-200/60 flex items-center gap-2">
                      {field.type === 'number' && <Hash className="w-3 h-3" />}
                      {field.type === 'text' && <Type className="w-3 h-3" />}
                      {field.type === 'enum' && <List className="w-3 h-3" />}
                      {field.name}
                    </div>
                  ))}
                </div>

                {/* TABLE BODY */}
                <div>
                  {visibleTasks.map(task => (
                    <div key={task.id} className="group flex items-center hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors h-11">

                      {/* Checkbox */}
                      <div className="w-10 px-4 flex justify-center shrink-0">
                        <button onClick={() => toggleTaskCompletion(task.id)} className="text-slate-400 hover:text-green-600 transition-colors">
                          {task.is_completed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Title */}
                      <div className="flex-1 px-4 border-r border-slate-100 shrink-0 min-w-[200px] h-full flex items-center">
                        <input
                          type="text"
                          value={task.title}
                          placeholder="Escreva uma tarefa..."
                          onChange={(e) => {
                            const val = e.target.value;
                            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, title: val } : t))
                          }}
                          className={`w-full bg-transparent border-none focus:ring-0 p-0 text-sm ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}
                        />
                      </div>

                      {/* Projects (All View) */}
                      {activeView === 'all' && (
                        <div className="w-64 px-4 border-r border-slate-100 shrink-0 h-full flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                          {getTaskProjects(task.id).map(proj => (
                            <span
                              key={proj.id}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full mr-1 ${proj.color}`} />
                              {proj.name}
                              <button
                                onClick={() => removeProjectFromTask(task.id, proj.id)}
                                className="ml-1 text-slate-400 hover:text-red-500"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}

                          <div className="relative group/add inline-flex items-center justify-center shrink-0">
                            <button className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-indigo-600 transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <select
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                              value=""
                              onChange={(e) => addProjectToTask(task.id, e.target.value)}
                            >
                              <option value="" disabled>Adicionar...</option>
                              {projects
                                .filter(p => !getTaskProjects(task.id).find(tp => tp.id === p.id))
                                .map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Due Date (Native Date Picker) */}
                      <div className="w-40 px-4 border-r border-slate-100 shrink-0 h-full flex items-center">
                        <div className="relative w-full group/date">
                          {!task.due_date && (
                            <Calendar className="w-3.5 h-3.5 text-slate-300 absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover/date:hidden" />
                          )}
                          <input
                            type="date"
                            value={task.due_date || ''}
                            onChange={(e) => updateTaskDate(task.id, e.target.value)}
                            className={`w-full bg-transparent border-none focus:ring-0 p-0 text-sm cursor-pointer
                              ${!task.due_date ? 'text-transparent group-hover/date:text-slate-400 pl-5 group-hover/date:pl-0' : 'text-slate-600'}`}
                          />
                        </div>
                      </div>

                      {/* Custom Fields */}
                      {activeCustomFields.map(field => (
                        <div key={field.id} className="w-48 px-4 border-r border-slate-100 shrink-0 h-full flex items-center">
                          {field.type === 'enum' ? (
                            <select
                              className="w-full bg-transparent text-sm border-none focus:ring-0 p-0 text-slate-700 cursor-pointer"
                              value={getFieldValue(task.id, field.id)}
                              onChange={(e) => updateCustomValue(task.id, field.id, e.target.value)}
                            >
                              <option value="">-</option>
                              {field.options && field.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type === 'number' ? 'number' : 'text'}
                              value={getFieldValue(task.id, field.id)}
                              onChange={(e) => updateCustomValue(task.id, field.id, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                              placeholder="-"
                              className="w-full bg-transparent text-sm border-none focus:ring-0 p-0 text-slate-700 placeholder:text-slate-300"
                            />
                          )}
                        </div>
                      ))}

                    </div>
                  ))}

                  {/* Add Task Button */}
                  <button
                    onClick={addTask}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-100 text-sm"
                  >
                    <Plus className="w-5 h-5 ml-1" />
                    <span>Adicionar tarefa...</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* MODAL: CREATE CUSTOM FIELD */}
        {isFieldModalOpen && (
          <FieldManagerModal
            onClose={() => setIsFieldModalOpen(false)}
            onCreate={createNewField}
          />
        )}
      </div>
    </div>
  );
}

function FieldManagerModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [optionsStr, setOptionsStr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    const newField = {
      name,
      type,
      options: type === 'enum' ? optionsStr.split(',').map(s => s.trim()).filter(Boolean) : null
    };

    onCreate(newField);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800">Adicionar Campo ao Projeto</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Campo</label>
            <input
              autoFocus
              type="text"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              placeholder="Ex: Prioridade, Custo, Status Cliente"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Dado</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'text', label: 'Texto', icon: Type },
                { id: 'number', label: 'Número', icon: Hash },
                { id: 'enum', label: 'Seleção', icon: List },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm transition-all
                    ${type === t.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                >
                  <t.icon className="w-5 h-5 mb-1" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {type === 'enum' && (
            <div className="animate-in slide-in-from-top-2 fade-in">
              <label className="block text-sm font-medium text-slate-700 mb-1">Opções (separadas por vírgula)</label>
              <input
                type="text"
                className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                placeholder="Ex: Baixa, Média, Alta"
                value={optionsStr}
                onChange={e => setOptionsStr(e.target.value)}
              />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar Campo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}