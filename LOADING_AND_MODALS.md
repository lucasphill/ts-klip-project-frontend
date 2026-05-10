# Contexto de Loading e Modais

## LoadingContext

O `LoadingContext` fornece um indicador de carregamento global para toda a aplicação.

### Uso Básico

```tsx
import { useLoading } from '../contexts/LoadingContext';

function MyComponent() {
  const { isLoading, setLoading, withLoading } = useLoading();

  // Opção 1: Controle manual
  const handleAction = async () => {
    setLoading(true);
    try {
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  // Opção 2: Wrapper automático (recomendado)
  const handleActionAuto = async () => {
    await withLoading(fetchData());
  };

  return (
    <button onClick={handleActionAuto}>
      Carregar Dados
    </button>
  );
}
```

### API

- `isLoading: boolean` - Estado atual do loading
- `setLoading: (loading: boolean) => void` - Define o estado manualmente
- `withLoading: <T>(promise: Promise<T>) => Promise<T>` - Envolve uma Promise e gerencia o loading automaticamente

## Modais

### AddTaskModal

Modal para criar e editar tarefas.

#### Como Editar uma Tarefa

**Opção 1: Via Ícone de Editar na Tabela**

Passe o mouse sobre qualquer linha da tabela de tarefas e clique no ícone de lápis (✏️) que aparece na coluna "Ações". O modal de edição será aberto com os dados atuais da tarefa.

**Opção 2: Programaticamente**

```tsx
import AddTaskModal from './components/AddTaskModal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setShowModal(true);
  };

  const handleSave = (task) => {
    console.log('Task saved:', task);
    // Implementar lógica de salvamento
    // Se task.id existe, é uma edição; caso contrário, é criação
  };

  return (
    <>
      <button onClick={() => handleEditTask(existingTask)}>Editar Tarefa</button>
      
      <AddTaskModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setTaskToEdit(null);
        }}
        onSave={handleSave}
        task={taskToEdit} // Passa a tarefa para edição
      />
    </>
  );
}
```

#### Como Excluir uma Tarefa

Passe o mouse sobre qualquer linha da tabela de tarefas e clique no ícone de lixeira (🗑️) que aparece na coluna "Ações". Uma confirmação será solicitada antes da exclusão.

**Programaticamente:**

```tsx
const handleDeleteTask = (taskId) => {
  if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
    // Remover tarefa do estado
    setTasks(prev => prev.filter(t => t.id !== taskId));
    // Remover vínculos com projetos
    setProjectTasks(prev => prev.filter(pt => pt.task_id !== taskId));
    // Remover valores de campos customizados
    setFieldValues(prev => prev.filter(fv => fv.task_id !== taskId));
  }
};
```

**TaskTable Integration:**

```tsx
<TaskTable
  visibleTasks={tasks}
  onEditTask={handleEditTask}    // Callback para editar
  onDeleteTask={handleDeleteTask} // Callback para excluir
  // ... outras props
/>
```

### Criar Nova Tarefa

```tsx
import AddTaskModal from './components/AddTaskModal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);

  const handleSave = (task) => {
    console.log('Task saved:', task);
    // Implementar lógica de salvamento
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>Nova Tarefa</button>
      
      <AddTaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        // Não passa task - modo criação
      />
    </>
  );
}
```

### AddProjectModal

Modal para criar e editar projetos.

```tsx
import AddProjectModal from './components/AddProjectModal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  const handleSave = (project) => {
    console.log('Project saved:', project);
    // Implementar lógica de salvamento
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>Novo Projeto</button>
      
      <AddProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        project={projectToEdit} // Opcional: passar projeto para edição
      />
    </>
  );
}
```

## Integração Completa

O Layout já possui integração completa com ambos os modais:

- Botão "Nova Tarefa" na sidebar abre o `AddTaskModal`
- Botão "+" ao lado de "Projetos" abre o `AddProjectModal`
- Ambos utilizam `withLoading` para exibir indicador durante salvamento

### Cores Pré-definidas (Projetos)

O modal de projetos oferece 8 cores pré-selecionadas:
- Indigo (#6366f1)
- Emerald (#10b981)
- Pink (#ec4899)
- Amber (#f59e0b)
- Violet (#8b5cf6)
- Blue (#3b82f6)
- Red (#ef4444)
- Teal (#14b8a6)
