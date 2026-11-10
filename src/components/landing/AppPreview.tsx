import { useTheme } from "../../contexts/ThemeContext";
import { CheckCircle2, Home, CalendarDays, Settings, LogOut, Circle, Plus, Sun, Moon } from "lucide-react";
import KlipLogo from "./KlipLogo";

/** Prévia estática do app exibida no hero. */
export default function AppPreview() {
  const { theme } = useTheme();
  return (
        <div className="landing-glass w-full rounded-2xl p-2 shadow-2xl shadow-[#66ACCB]/10">
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
                <KlipLogo className="h-6 w-6" />
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
  );
}
