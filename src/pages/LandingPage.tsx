import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Github,
  Coffee,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Layers,
  Calendar,
  Sparkles,
  CheckCircle,
  Clock,
  Sun,
  Moon,
  Home,
  CalendarDays,
  Settings,
  LogOut,
  Circle,
  Plus
} from "lucide-react";
import Footer from "../components/Footer";

/* ------------------------------------------------------------------ */
/*  Brand colors from icon.svg                                        */
/*  Blue:   rgb(102,172,203) → #66ACCB                                */
/*  Orange: rgb(238,128,91)  → #EE805B                                */
/* ------------------------------------------------------------------ */

// MCP terminal animation frames (static — never re-created)
const TERMINAL_FRAMES = [
  {
    input: "klip-mcp agent 'Resuma meu dia e monte o standup'",
    output: (
      <div className="space-y-1.5 text-xs text-slate-400 font-mono">
        <p className="font-semibold" style={{ color: "#66ACCB" }}>
          🔄 Conectando ao Klip MCP Server...
        </p>
        <p className="text-emerald-500 font-semibold">
          ⚙️ Executando ferramenta: get_tasks({`{ filter: "today" }`})
        </p>
        <p className="text-slate-300">
          ➔ Retorno da ferramenta: 3 tarefas pendentes encontradas.
        </p>
        <div className="pl-4 border-l border-slate-700 my-1 space-y-0.5 text-slate-400">
          <p>• [ ] Finalizar Landing Page (Projeto: Frontend, Prioridade: Alta)</p>
          <p>• [ ] Revisar endpoints da API (Projeto: Backend, Status: Pendente)</p>
          <p>• [/] Ajustar modal de doações (Projeto: Frontend, Status: Em andamento)</p>
        </div>
        <p className="mt-2 font-semibold" style={{ color: "#EE805B" }}>
          🤖 Resposta da IA:
        </p>
        <p className="text-slate-200 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50 italic">
          "Bom dia, Lucas! Você tem 3 tarefas para hoje. Recomendo focar primeiro
          na Landing Page do Frontend que possui prioridade Alta. Deseja que eu
          conclua alguma tarefa?"
        </p>
      </div>
    ),
  },
  {
    input:
      "klip-mcp agent 'Marque a Landing Page como concluída e crie uma nova tarefa de deploy'",
    output: (
      <div className="space-y-1.5 text-xs text-slate-400 font-mono">
        <p className="text-emerald-500 font-semibold">
          ⚙️ Executando ferramenta: update_task(id: &quot;9f8&quot;, isCompleted: true)
        </p>
        <p className="text-slate-300">
          ➔ Retorno: Tarefa &quot;Finalizar Landing Page&quot; atualizada para CONCLUÍDA! ✅
        </p>
        <p className="text-emerald-500 font-semibold">
          ⚙️ Executando ferramenta: create_task(
          {`{ title: "Realizar deploy de produção", project: "Frontend" }`})
        </p>
        <p className="text-slate-300">
          ➔ Retorno: Nova tarefa criada com sucesso (ID: a32b). 🚀
        </p>
        <p className="mt-2 font-semibold" style={{ color: "#EE805B" }}>
          🤖 Resposta da IA:
        </p>
        <p className="text-slate-200 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50 italic">
          "Pronto! A tarefa da Landing Page foi marcada como concluída e a nova
          tarefa &apos;Realizar deploy de produção&apos; foi adicionada ao projeto Frontend.
          Algo mais em que eu possa ajudar?"
        </p>
      </div>
    ),
  },
] as const;

export default function LandingPage() {
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [terminalStep, setTerminalStep] = useState(0);
  const [typedInput, setTypedInput] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Typing animation — uses ref so cleanup is reliable
  useEffect(() => {
    const targetText = TERMINAL_FRAMES[terminalStep].input;
    let charIndex = 0;

    setTypedInput("");
    setIsTyping(true);

    const type = () => {
      if (charIndex < targetText.length) {
        setTypedInput(targetText.slice(0, charIndex + 1));
        charIndex++;
        timerRef.current = setTimeout(type, 50);
      } else {
        setIsTyping(false);
        timerRef.current = setTimeout(() => {
          setTerminalStep((prev) => (prev + 1) % TERMINAL_FRAMES.length);
        }, 5000);
      }
    };

    timerRef.current = setTimeout(type, 1000);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [terminalStep]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans selection:bg-[#66ACCB]/20 selection:text-[var(--text-primary)]">
      {/* ── 1. HEADER ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--glass-1)] border-b border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-2 rounded-lg p-1 transition-opacity hover:opacity-80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 191 191"
          >
            <g>
              <path
                d="M 75.00 29.77 L 75.00 160.00 L 71.75 159.90 C60.29,159.54 49.27,152.47 43.84,142.00 C41.51,137.53 41.50,137.27 41.22,96.10 L 41.21 95.49 C40.97,59.07 40.91,50.73 44.72,44.93 C45.88,43.17 47.38,41.65 49.35,39.65 C55.74,33.15 60.71,30.73 68.75,30.19 Z"
                fill="rgb(102,172,203)"
              />
              <path
                d="M 127.25 77.27 C116.94,87.28 103.44,100.40 97.25,106.43 L 86.00 117.39 L 86.00 71.41 L 97.00 61.50 C107.43,52.10 108.00,51.38 108.00,47.68 C108.00,42.45 111.39,36.71 116.00,34.12 C119.31,32.26 121.38,32.00 132.89,32.00 L 146.00 32.00 L 146.00 59.08 ZM 125.81 156.60 C122.88,158.08 118.30,159.33 114.45,159.69 L 108.00 160.29 L 108.00 131.56 L 102.75 126.25 L 97.50 120.93 L 106.02 112.72 C110.71,108.20 116.40,102.77 118.65,100.66 L 122.76 96.83 L 129.88 103.95 C133.80,107.87 138.19,113.41 139.63,116.27 C143.10,123.11 143.85,131.92 141.56,138.83 C139.41,145.28 132.30,153.31 125.81,156.60 Z"
                fill="rgb(238,128,91)"
              />
            </g>
          </svg>
          <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
            Klip
          </span>
        </a>

        <nav className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            title={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <a
            href="https://github.com/lucasphill"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">lucasphill</span>
          </a>

          {isAuthenticated ? (
            <a
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-sm"
              style={{ backgroundColor: "#66ACCB" }}
            >
              Ir para o Dashboard
              <ArrowRight className="w-4 h-4" />
            </a>
          ) : (
            <button
              onClick={login}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-sm hover:brightness-110"
              style={{ backgroundColor: "#66ACCB" }}
            >
              Começar Agora
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </nav>
      </header>

      {/* ── 2. HERO ───────────────────────────────────────────────── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 lg:pt-32 flex flex-col items-center text-center overflow-hidden">
        {/* Decorative ambient gradients */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-15"
          style={{ backgroundColor: "#66ACCB" }}
        />
        <div
          className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none opacity-10"
          style={{ backgroundColor: "#EE805B" }}
        />

        <div className="max-w-4xl space-y-6 z-10">
          <div
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold border"
            style={{
              backgroundColor: "rgba(102,172,203,0.08)",
              color: "#66ACCB",
              borderColor: "rgba(102,172,203,0.25)",
            }}
          >
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>Gerenciamento de Tarefas Nativo para IAs</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
            Organize suas tarefas de forma simples.{" "}
            <br className="hidden md:inline" />
            Deixe sua{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(to right, #66ACCB, #EE805B)",
              }}
            >
              IA favorita fazer o resto.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-[var(--text-secondary)] leading-relaxed">
            O Klip combina a simplicidade do gerenciamento de tarefas visual com a
            potência do{" "}
            <strong>Model Context Protocol (MCP)</strong>. Organize seu fluxo de
            trabalho pessoal e permita que suas LLMs favoritas automatizem
            relatórios, categorizações e agendamentos.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={login}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-bold text-white hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md"
              style={{ backgroundColor: "#66ACCB" }}
            >
              Criar Conta Gratuita
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="https://github.com/lucasphill"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold bg-[var(--bg-panel)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-muted)] transition-all"
            >
              <Github className="w-5 h-5 text-[var(--text-muted)]" />
              GitHub do Desenvolvedor
            </a>
          </div>
        </div>

        {/* Browser Mockup */}
        <div className="mt-16 w-full max-w-5xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--glass-2)] backdrop-blur-sm p-2 shadow-xl">
          <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-panel)] flex flex-col">
            {/* Title bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-[var(--bg-soft)] border-b border-[var(--border-subtle)]">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="mx-auto bg-[var(--bg-soft-strong)] px-8 py-1 rounded text-[11px] text-[var(--text-faint)] font-mono max-w-sm truncate">
                klip.app.br/
              </div>
            </div>

            {/* App Header / Navbar Mockup */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] px-4 select-none">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 191 191">
                  <g>
                    <path d="M 75.00 29.77 L 75.00 160.00 L 71.75 159.90 C60.29,159.54 49.27,152.47 43.84,142.00 C41.51,137.53 41.50,137.27 41.22,96.10 L 41.21 95.49 C40.97,59.07 40.91,50.73 44.72,44.93 C45.88,43.17 47.38,41.65 49.35,39.65 C55.74,33.15 60.71,30.73 68.75,30.19 Z" fill="rgb(102,172,203)" />
                    <path d="M 127.25 77.27 C116.94,87.28 103.44,100.40 97.25,106.43 L 86.00 117.39 L 86.00 71.41 L 97.00 61.50 C107.43,52.10 108.00,51.38 108.00,47.68 C108.00,42.45 111.39,36.71 116.00,34.12 C119.31,32.26 121.38,32.00 132.89,32.00 L 146.00 32.00 L 146.00 59.08 ZM 125.81 156.60 C122.88,158.08 118.30,159.33 114.45,159.69 L 108.00 160.29 L 108.00 131.56 L 102.75 126.25 L 97.50 120.93 L 106.02 112.72 C110.71,108.20 116.40,102.77 118.65,100.66 L 122.76 96.83 L 129.88 103.95 C133.80,107.87 138.19,113.41 139.63,116.27 C143.10,123.11 143.85,131.92 141.56,138.83 C139.41,145.28 132.30,153.31 125.81,156.60 Z" fill="rgb(238,128,91)" />
                  </g>
                </svg>
                <span className="text-xs font-semibold tracking-tight text-[var(--text-primary)]">Klip</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] font-medium text-[var(--text-primary)] leading-tight">Jon Doe</p>
                  <p className="text-[8px] text-[var(--text-muted)] leading-tight">email@example.com</p>
                </div>
                <div className="h-6 w-6 rounded-full bg-[#66ACCB]/10 flex items-center justify-center text-[10px] font-bold text-[#66ACCB] border border-[#66ACCB]/25">
                  LP
                </div>
                <div className="h-4 w-[1px] bg-[var(--border-subtle)]" />
                <Settings className="h-3.5 w-3.5 text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)] transition-colors" />
                {theme === "dark" ? (
                  <Sun className="h-3.5 w-3.5 text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)] transition-colors" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)] transition-colors" />
                )}
                <LogOut className="h-3.5 w-3.5 text-[var(--text-muted)] cursor-pointer hover:text-red-500 transition-colors" />
              </div>
            </div>

            {/* App Sidebar + Content */}
            <div className="flex flex-1 flex-col md:flex-row min-h-[380px] text-left">
              {/* Sidebar Mockup */}
              <div className="w-full md:w-[180px] border-b md:border-b-0 md:border-r border-[var(--border-subtle)] bg-[var(--bg-soft)]/30 p-3 flex flex-col gap-4 select-none">
                <div>
                  <button
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-white transition-all hover:brightness-110 shadow-sm"
                    style={{ backgroundColor: "#66ACCB" }}
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                    <span>Nova tarefa</span>
                  </button>
                </div>
                <nav className="flex-1 space-y-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-soft-strong)] px-2 py-1.5 text-xs font-semibold text-[var(--text-primary)]">
                      <Home className="h-3.5 w-3.5" />
                      <span>Inbox</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-soft)]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>Calendário</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 pb-1">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">Projetos</span>
                      <Plus className="h-3 w-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer" />
                    </div>
                    <div className="space-y-0.5">
                      {[
                        { name: "Frontend App", color: "#66ACCB" },
                        { name: "API Backend", color: "#EE805B" },
                        { name: "Indie Marketing", color: "#9b59b6" },
                      ].map((p) => (
                        <div key={p.name} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-soft)] cursor-pointer">
                          <span className="flex items-center gap-2 truncate">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                            <span className="truncate">{p.name}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>

              {/* Main Task View Mockup */}
              <div className="flex-1 bg-[var(--bg-panel)] flex flex-col">
                {/* Header Mockup */}
                <div className="border-b border-[var(--border-subtle)] px-5 py-3.5 flex items-center justify-between bg-[var(--bg-panel)] select-none">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">Todas as tarefas</h2>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Gerencie seu fluxo de trabalho pessoal e controle suas entregas.</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-soft)] cursor-pointer transition-colors">
                    <Settings className="h-3.5 w-3.5" />
                    <span>Gerenciar campos</span>
                  </div>
                </div>

                {/* Task Grid Mockup */}
                <div className="flex-1 p-4 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-[var(--text-secondary)]">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-medium">
                        <th className="py-2 px-3 w-10">Status</th>
                        <th className="py-2 px-3">Tarefa</th>
                        <th className="py-2 px-3 w-28">Projetos</th>
                        <th className="py-2 px-3 w-24">Prazo</th>
                        <th className="py-2 px-3 w-24">GTD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {/* Row 1 */}
                      <tr className="hover:bg-[var(--bg-soft)]/30">
                        <td className="py-2.5 px-3">
                          <Circle className="h-4 w-4 text-[var(--text-muted)] cursor-pointer hover:text-emerald-500 transition-colors" />
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">Revisar endpoints da API</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold border" style={{ backgroundColor: "rgba(238,128,91,0.08)", color: "#EE805B", borderColor: "rgba(238,128,91,0.2)" }}>
                            API Backend
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[var(--text-muted)] font-mono">29 de Jun</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center rounded bg-[var(--bg-soft-strong)] px-2 py-0.5 text-[9px] font-semibold text-[var(--text-primary)]">
                            Próximo
                          </span>
                        </td>
                      </tr>
                      {/* Row 2 */}
                      <tr className="hover:bg-[var(--bg-soft)]/30">
                        <td className="py-2.5 px-3">
                          <Circle className="h-4 w-4 text-[var(--text-muted)] cursor-pointer hover:text-emerald-500 transition-colors" />
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">Ajustar modal de doações</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold border" style={{ backgroundColor: "rgba(102,172,203,0.08)", color: "#66ACCB", borderColor: "rgba(102,172,203,0.2)" }}>
                            Frontend App
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[var(--text-muted)] font-mono">30 de Jun</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center rounded bg-[#66ACCB]/10 px-2 py-0.5 text-[9px] font-semibold text-[#66ACCB]">
                            Inbox
                          </span>
                        </td>
                      </tr>
                      {/* Row 3 */}
                      <tr className="hover:bg-[var(--bg-soft)]/30 opacity-60">
                        <td className="py-2.5 px-3">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 cursor-pointer" />
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[var(--text-muted)] line-through">Finalizar Landing Page</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold border" style={{ backgroundColor: "rgba(102,172,203,0.08)", color: "#66ACCB", borderColor: "rgba(102,172,203,0.2)" }}>
                            Frontend App
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[var(--text-muted)] font-mono">28 de Jun</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
                            Concluído
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURES / GTD ─────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-16">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Do Método GTD à sua Organização Própria
          </h2>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
            O Klip não impõe regras de organização. Ele foi desenhado para ser
            flexível, permitindo que você crie campos customizados por projeto
            para estruturar o seu fluxo de produtividade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Layers className="w-5 h-5" />,
              color: "#66ACCB",
              title: "Caixa de Entrada & GTD",
              text: 'Capture ideias, tarefas e compromissos instantaneamente no seu Inbox. Classifique em seguida usando etapas como "A Fazer", "Próximo", "Delegado" ou "Algum Dia" com campos customizados.',
            },
            {
              icon: <Sparkles className="w-5 h-5" />,
              color: "#EE805B",
              title: "Campos Customizados",
              text: "Defina campos específicos para cada projeto. Crie campos de prioridade, seleções de stack (Frontend, Backend), links de referência ou tags customizadas para ter controle absoluto das informações.",
            },
            {
              icon: <Calendar className="w-5 h-5" />,
              color: "#66ACCB",
              title: "Visualização de Calendário",
              text: "Planeje sua semana ou seu mês em uma interface visual fluida. O Klip sincroniza as datas limites das suas tarefas e sub-tarefas para garantir que você nunca perca nenhum prazo importante.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-6 rounded-2xl text-left space-y-4 hover:shadow-lg hover:border-[var(--border-muted)] transition-all"
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: `${card.color}15`,
                  color: card.color,
                }}
              >
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {card.title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. MCP / AI ───────────────────────────────────────────── */}
      <section className="bg-slate-900 text-slate-100 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[150px] pointer-events-none opacity-15"
          style={{ backgroundColor: "#66ACCB" }}
        />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Info */}
          <div className="lg:col-span-5 space-y-6">
            <div
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border"
              style={{
                backgroundColor: "rgba(102,172,203,0.12)",
                color: "#66ACCB",
                borderColor: "rgba(102,172,203,0.3)",
              }}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Model Context Protocol</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Sua IA favorita no controle das suas tarefas
            </h2>

            <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
              O backend do Klip expõe suas tarefas de forma segura por meio do
              protocolo open-source <strong>MCP</strong>. Isso permite que você
              conecte suas tarefas diretamente a modelos de linguagem avançados
              como Claude, Gemini e ChatGPT na sua própria máquina.
            </p>

            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
              <li className="flex gap-2.5 items-start">
                <CheckCircle2
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: "#66ACCB" }}
                />
                <span>
                  <strong>Relatórios automáticos:</strong> &quot;Crie meu standup
                  matinal com as tarefas pendentes de hoje&quot;.
                </span>
              </li>
              <li className="flex gap-2.5 items-start">
                <CheckCircle2
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: "#66ACCB" }}
                />
                <span>
                  <strong>Auto-organização inteligente:</strong> Solicite à IA que
                  ordene por prioridades e categorize seu inbox.
                </span>
              </li>
              <li className="flex gap-2.5 items-start">
                <CheckCircle2
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: "#EE805B" }}
                />
                <span>
                  <strong>Automação natural:</strong> &quot;Toda sexta-feira crie uma
                  tarefa de revisão de código no projeto Backend&quot;.
                </span>
              </li>
            </ul>

            {/* Config code block */}
            <div className="mt-6 rounded-xl bg-slate-950/80 border border-slate-800/80 p-4 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800 text-[10px] text-slate-500">
                <span>Configuração de Exemplo</span>
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#EE805B" }}>mcp_config.json</span>
              </div>
              <pre className="overflow-x-auto leading-relaxed">
                {`"klip": {
    "serverUrl": "https://api.klip.app.br/mcp",
    "headers": {
        "Authorization": "klip_live_<token>"
    }
}`}
              </pre>
            </div>
          </div>

          {/* Terminal */}
          <div className="lg:col-span-7">
            <div className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-2 shadow-2xl">
              <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80">
                {/* Control bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-950/70 border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 tracking-wide font-medium">
                    Klip MCP Client Terminal
                  </span>
                  <div className="w-10" />
                </div>

                {/* Console lines */}
                <div className="p-5 font-mono text-xs text-left min-h-[290px] flex flex-col justify-between bg-slate-900/60">
                  <div className="space-y-4">
                    {/* Previous step (faded) */}
                    {terminalStep > 0 && (
                      <div className="space-y-2 opacity-40 transition-opacity duration-300">
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="text-emerald-500 font-bold">➜</span>
                          <span className="text-slate-300 font-semibold">
                            {TERMINAL_FRAMES[0].input}
                          </span>
                        </div>
                        {TERMINAL_FRAMES[0].output}
                      </div>
                    )}

                    {/* Current step */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-white">
                        <span style={{ color: "#66ACCB" }} className="font-bold">
                          ➜
                        </span>
                        <span className="text-slate-200 font-semibold">
                          {typedInput}
                          {isTyping && (
                            <span
                              className="animate-pulse text-transparent ml-0.5"
                              style={{ backgroundColor: "#66ACCB" }}
                            >
                              |
                            </span>
                          )}
                        </span>
                      </div>

                      {!isTyping && (
                        <div className="animate-fade-in duration-300">
                          {TERMINAL_FRAMES[terminalStep].output}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span>
                      Etapa {terminalStep + 1} de {TERMINAL_FRAMES.length}
                    </span>
                    <span className="animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Conexão Ativa (Klip API)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. INDIE & DONATION ────────────────────────────────────── */}
      <section className="bg-[var(--bg-soft)] border-y border-[var(--border-subtle)] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-8 sm:p-12 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-4 text-left">
            <div
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold border"
              style={{
                backgroundColor: "rgba(238,128,91,0.08)",
                color: "#EE805B",
                borderColor: "rgba(238,128,91,0.2)",
              }}
            >
              <Coffee className="w-3 h-3" />
              <span>Desenvolvimento Independente</span>
            </div>

            <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">
              Desenvolvido de forma independente por Lucas Phill
            </h3>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              O Klip é um projeto indie em constante desenvolvimento. Desenvolvo
              este aplicativo sozinho nas minhas horas vagas buscando criar o
              gerenciador de tarefas ideal. No futuro, você poderá me apoiar com
              um café para acelerar o desenvolvimento do projeto.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs font-medium text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Atualizações constantes
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 100% de
                Controle do Usuário
              </span>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-soft)]">
            <div className="group relative">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-center text-[10px] py-1.5 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-20 font-semibold border border-slate-800">
                Apoio financeiro estará disponível nas próximas semanas! ☕
              </div>

              <button
                disabled
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm opacity-65 cursor-not-allowed select-none shadow-md"
                style={{ backgroundColor: "#EE805B" }}
              >
                <Coffee className="w-4 h-4" />
                Buy me a coffee
              </button>
            </div>
            <span className="text-[10px] text-[var(--text-faint)] mt-2.5 font-medium">
              Doações indisponíveis no momento
            </span>
          </div>
        </div>
      </section>

      {/* ── 6. FOOTER ─────────────────────────────────────────────── */}
      <div className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] px-5 py-2.5">
        <div className="max-w-6xl mx-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}
