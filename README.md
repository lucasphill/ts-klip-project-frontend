# Klip — Frontend

Frontend da aplicação **Klip**, um gerenciador de tarefas e projetos pessoal flexível e expansível. O aplicativo combina uma interface visual limpa inspirada no método GTD com a potência do **Model Context Protocol (MCP)** e integração com o **Google Calendar**.

Construído com React 19, TypeScript e Vite.

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build & Tooling** | [Vite 7](https://vite.dev/) |
| **Estilização** | [TailwindCSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Autenticação** | [Auth0](https://auth0.com/) (`@auth0/auth0-react`) |
| **Roteamento** | [React Router v7](https://reactrouter.com/) |
| **Cliente HTTP** | [Axios](https://axios-http.com/) |
| **Calendário** | [FullCalendar](https://fullcalendar.io/) (visão mensal e semanal) |
| **Notificações** | [Sonner](https://sonner.emilkowal.ski/) |
| **Ícones** | [Lucide React](https://lucide.dev/) |
| **Telemetria & Desempenho** | [Vercel Analytics](https://vercel.com/analytics) + [Speed Insights](https://vercel.com/docs/speed-insights) |
| **Tipografia** | Geist Variable Font |

---

## ✨ Funcionalidades Principais

### 1. Gestão de Tarefas e Projetos (GTD)
* **Inbox e Visualização Geral**: Criação rápida de tarefas, categorização por projetos, definição de prioridades e prazos.
* **Sub-tarefas**: Decomposição de tarefas complexas em itens menores com acompanhamento de progresso.
* **Projetos Customizáveis**: Criação e edição de projetos com paleta de cores personalizada.
* **Campos Customizados por Projeto**: Adição de campos específicos (texto, número, seleção, checkbox, etc.) por projeto via gerenciador dedicado.
* **Filtros e Preferências Persistidas**: Ordenação e filtragem salvas automaticamente no `localStorage` por escopo e visualização.

### 2. Calendário e Planejamento
* **Visão Mensal e Semanal**: Navegação intuitiva entre meses e semanas com realce de prazos e eventos.
* **Integração com Google Calendar**: Sincronização bidirecional de prazos de tarefas diretamente com a agenda do Google via OAuth 2.0.

### 3. Integrações & Model Context Protocol (MCP)
* **Servidor MCP**: Conexão com modelos de linguagem (Claude, Gemini, ChatGPT) para automação de relatórios, standups e gerenciamento de tarefas via linguagem natural.
* **Gerenciador de Chaves de API**: Criação, revelação segura e revogação de tokens de acesso na área de configurações.
* **Painel de Integrações em Abas Colapsáveis**: Configuração limpa e isolada para MCP e Google Calendar.

### 4. Privacidade, Termos Legais & Segurança
* **Páginas Legais Públicas**: Rotas acessíveis publicamente (sem exigir login) para [Política de Privacidade](/privacy) e [Termos de Serviço](/terms).
* **Conformidade Google OAuth**: Seção mandatória de *Limited Use* (*Google API Services User Data Policy*), garantindo que dados do calendário não são comercializados, usados para anúncios ou treinamento de IA.
* **Criptografia**: Dados e tokens persistidos protegidos com criptografia em repouso (*at rest*) e em trânsito (*HTTPS/TLS*).
* **Auto-serviço de Privacidade**: Desconexão instantânea de integrações e botão de exclusão definitiva de conta nas configurações de perfil.

### 5. Experiência de Uso & UI
* **Landing Page Interativa**: Demonstração animada do terminal MCP, apresentação de funcionalidades e modo claro/escuro para visitantes.
* **Modo Claro / Escuro**: Suporte completo a temas com alternância instantânea.
* **Loading Global Centralizado**: Indicador de carregamento multi-fonte que sincroniza requisições assíncronas em segundo plano.

---

## 🧭 Rotas da Aplicação

### Rotas Públicas (Sem Autenticação)
| Rota | Descrição |
|---|---|
| `/` | Landing page para visitantes (ou redirecionamento para o Dashboard se logado) |
| `/privacy` | Política de Privacidade (aliases: `/politica-de-privacidade`, `/privacy-policy`) |
| `/terms` | Termos de Serviço (aliases: `/termos-de-uso`, `/terms-of-service`) |

### Rotas Autenticadas (Dashboard)
| Rota | Descrição |
|---|---|
| `/` | `HomePage` — Caixa de entrada e listagem geral de tarefas |
| `/calendar` | `MonthViewPage` — Calendário em visão mensal |
| `/week` | `MonthViewPage` — Calendário em visão semanal |
| `/project/:projectId` | `ProjectsPage` — Visão detalhada de tarefas de um projeto |
| `/settings/profile` | `SettingsProfilePage` — Gerenciamento de perfil e exclusão de conta |
| `/settings/custom-fields` | `SettingsCustomFieldsPage` — Definições e tipos de campos customizados |
| `/settings/integrations` | `SettingsIntegrationsPage` — Painéis colapsáveis de MCP e Google Calendar |

---

## 📁 Estrutura do Projeto

```text
src/
├── assets/             # Ícones e fontes estáticas
├── components/         # Componentes compartilhados e modais
│   ├── ui/             # Primitivas shadcn/ui (button, dialog, input, etc.)
│   ├── Footer.tsx      # Rodapé com status da API e links legais
│   ├── Layout.tsx      # Layout principal do Dashboard autenticado
│   ├── LegalLayout.tsx # Layout dedicado para páginas legais (cabeçalho, tema, impressão)
│   ├── GoogleCalendarIntegration.tsx # Painel colapsável da integração Google Calendar
│   ├── IntegrationsManager.tsx       # Gerenciador de chaves MCP
│   └── TaskTable.tsx   # Tabela de tarefas com suporte a ordenação e campos customizados
├── contexts/           # Contextos React globais
│   ├── AuthContext.tsx                   # Estado de login e integração Auth0
│   ├── TasksContext.tsx                  # Estado e operações CRUD de tarefas
│   ├── ProjectsContext.tsx               # Estado e operações CRUD de projetos
│   ├── CustomFieldDefinitionsContext.tsx # Definições de campos customizados
│   ├── LoadingContext.tsx                # Gestão centralizada de loading
│   └── ThemeContext.tsx                  # Alternador de tema claro/escuro
├── hooks/              # Hooks customizados (ex: useTaskTablePreferences)
├── lib/                # Funções utilitárias e helpers
├── pages/              # Páginas da aplicação
│   ├── HomePage.tsx               # Dashboard principal
│   ├── LandingPage.tsx            # Página inicial pública
│   ├── MonthViewPage.tsx          # Visão de calendário mensal/semanal
│   ├── PrivacyPolicyPage.tsx      # Política de Privacidade oficial
│   ├── ProjectsPage.tsx           # Visão por projeto
│   ├── SettingsCustomFieldsPage.tsx # Configuração de campos
│   ├── SettingsIntegrationsPage.tsx # Configuração de MCP e Google Calendar
│   ├── SettingsProfilePage.tsx    # Perfil do usuário e exclusão de conta
│   └── TermsOfServicePage.tsx     # Termos de Serviço oficiais
├── services/           # Camada de comunicação com a API backend (api.ts)
└── types/              # Interfaces TypeScript e definições de domínio
```

---

## 🚀 Instalação e Execução

### Pré-requisitos
* Node.js 18+ ou superior
* Gerenciador de pacotes `npm`

### Passos de Instalação

1. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```

2. Configure o arquivo `.env` na raiz do projeto com as credenciais do Auth0 e URLs da API:
   ```env
   VITE_AUTH0_DOMAIN=seu-dominio.auth0.com
   VITE_AUTH0_CLIENT_ID=seu-client-id
   VITE_AUTH0_AUDIENCE=sua-audience
   VITE_API_BASE_URL=http://localhost:5145
   ```

3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento Vite local |
| `npm run build` | Valida tipagem (`tsc -b`) e gera o build de produção (`vite build`) |
| `npm run lint` | Executa a verificação estática de código com ESLint |
| `npm run preview` | Inicia um servidor local servindo a pasta `dist/` gerada no build |

---

## 📄 Governança e Especificação

Este repositório utiliza o **Spec Kit** para especificação de requisitos, planejamento arquitetural e governança:
* Especificações de features disponíveis na pasta [`specs/`](./specs/).
* Princípios de arquitetura e padrões técnicos documentados na [Constituição do Projeto](.specify/memory/constitution.md).
