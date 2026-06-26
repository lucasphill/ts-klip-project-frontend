import { User, SlidersHorizontal, Sun, Moon, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const SettingsProfilePage = () => {
  const { user } = useAuth();
  const { isDark, setTheme } = useTheme();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="sticky top-0 z-10 shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="pt-6 pb-0">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Configurações</h1>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">Gerencie seu perfil e preferências</p>
          </div>
          <div className="mt-4 flex gap-0">
            <Link
              to="/settings/profile"
              className="flex items-center gap-1.5 border-b-2 border-[var(--brand)] px-4 py-2.5 text-sm font-medium text-[var(--brand)] transition-colors"
            >
              <User size={15} />
              Perfil
            </Link>
            <Link
              to="/settings/custom-fields"
              className="flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <SlidersHorizontal size={15} />
              Campos Personalizados
            </Link>
            <Link
              to="/settings/integrations"
              className="flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <Cpu size={15} />
              Integrações
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 py-6">
          <div className="max-w-2xl">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6">
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">Aparência</h2>
              <p className="text-sm text-[var(--text-muted)] mb-5">Escolha como o Klip deve ser exibido para você</p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
                    !isDark
                      ? "border-[var(--brand)] bg-[var(--bg-soft)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-muted)] hover:bg-[var(--bg-soft)]"
                  }`}
                >
                  <Sun className={`h-5 w-5 shrink-0 ${!isDark ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}`} />
                  <span className={`text-sm font-medium ${!isDark ? "text-[var(--brand)]" : "text-[var(--text-secondary)]"}`}>
                    Claro
                  </span>
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
                    isDark
                      ? "border-[var(--brand)] bg-[var(--bg-soft)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-panel)] hover:border-[var(--border-muted)] hover:bg-[var(--bg-soft)]"
                  }`}
                >
                  <Moon className={`h-5 w-5 shrink-0 ${isDark ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}`} />
                  <span className={`text-sm font-medium ${isDark ? "text-[var(--brand)]" : "text-[var(--text-secondary)]"}`}>
                    Escuro
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6">
              <div className="flex items-center gap-5">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name ?? "Avatar"}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-[var(--border-subtle)]"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-soft-strong)] text-[var(--text-muted)]">
                    <User size={28} />
                  </div>
                )}
                <div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">{user?.name ?? "—"}</p>
                  <p className="text-sm text-[var(--text-muted)]">{user?.email ?? "—"}</p>
                </div>
              </div>

              <hr className="my-5 border-[var(--border-subtle)]" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Nome</label>
                  <input
                    type="text"
                    value={user?.name ?? ""}
                    readOnly
                    className="field w-full cursor-not-allowed opacity-60"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Email</label>
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    readOnly
                    className="field w-full cursor-not-allowed opacity-60"
                  />
                </div>
              </div>

              <p className="mt-4 text-xs text-[var(--text-faint)]">
                As informações de perfil são gerenciadas pelo provedor de identidade (Auth0).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfilePage;
