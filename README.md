# Klip — Frontend

Frontend da aplicação **Klip**, uma ferramenta de gerenciamento de projetos e tarefas. Construído com React 19, TypeScript e Vite.

## Stack

| Categoria | Tecnologia |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Estilo | TailwindCSS 4 + shadcn/ui |
| Autenticação | Auth0 (`@auth0/auth0-react`) |
| Roteamento | React Router v7 |
| HTTP | Axios |
| Calendário | FullCalendar (daygrid) |
| Notificações | Sonner |
| Analytics | Vercel Analytics |
| Ícones | Lucide React + Untitled UI Icons |
| Fontes | Geist Variable |

## Funcionalidades

- **Autenticação** via Auth0 com redirecionamento automático para login
- **Gerenciamento de projetos** — criar, editar e visualizar projetos com cores personalizadas
- **Gerenciamento de tarefas** — criar, editar, excluir tarefas com suporte a subtarefas
- **Campos customizados** — campos extras por projeto via `AddCustomFieldModal`
- **Visualização de calendário** — visão mensal das tarefas com FullCalendar
- **Modo escuro** — alternância via `ThemeContext`
- **Loading global** — indicador de carregamento multi-fonte via `LoadingContext`
- **Preferências persistidas** — filtros e ordenação da tabela salvos no `localStorage` por escopo

## Rotas

| Rota | Página |
|---|---|
| `/` | `HomePage` — listagem de tarefas do usuário |
| `/calendar` | `MonthViewPage` — visão de calendário mensal |
| `/week` | `MonthViewPage` — visão semanal |
| `/project/:projectId` | `ProjectsPage` — tarefas de um projeto específico |

## Estrutura de pastas

```
src/
├── components/       # Componentes reutilizáveis e modais
│   └── ui/           # Componentes base (shadcn/ui)
├── contexts/         # Contextos globais (Auth, Tasks, Projects, Loading, Theme)
├── hooks/            # Hooks customizados
├── pages/            # Páginas principais
├── services/         # Configuração do Axios (api.ts)
├── types/            # Interfaces TypeScript (Task, Project, etc.)
└── lib/              # Utilitários
```

## Instalação e uso

```bash
npm install
npm run dev
```

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (`tsc -b && vite build`) |
| `npm run lint` | Lint com ESLint |
| `npm run preview` | Preview do build |

## Contextos

### `LoadingContext`
Loading global multi-fonte. Exibe um overlay com spinner enquanto qualquer operação assíncrona estiver ativa.

```tsx
const { isLoading, setLoading, withLoading } = useLoading();

// Envolve uma Promise e gerencia o loading automaticamente
await withLoading(fetchData(), 'minha-operacao');
```

### `TasksContext` / `ProjectsContext`
Gerenciam o estado global de tarefas e projetos, expondo funções de fetch, criação, edição e exclusão.

### `ThemeContext`
Controla o tema claro/escuro da aplicação.

## Hook: `useTaskTablePreferences`

Persiste preferências de filtro e ordenação da tabela de tarefas no `localStorage`, com escopo por projeto/view.

```ts
const { statusFilter, sortBy, sortDir, setStatusFilter, setSortBy, setSortDir } =
  useTaskTablePreferences({ scope: 'home', activeView: 'list' });
```

Chave de armazenamento: `klip:task-table-preferences:v1:{scope}:{activeView}`

## Modais

- **`AddTaskModal`** — cria e edita tarefas; aceita prop `task` para modo de edição
- **`AddProjectModal`** — cria e edita projetos; suporte a 8 cores pré-definidas
- **`AddCustomFieldModal`** — adiciona campos customizados a um projeto

Consulte [`LOADING_AND_MODALS.md`](./LOADING_AND_MODALS.md) para exemplos de uso detalhados.
