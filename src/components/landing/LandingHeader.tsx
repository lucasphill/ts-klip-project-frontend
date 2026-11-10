import { ArrowRight, Moon, Sun } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import KlipLogo from "./KlipLogo";
import { BRAND, content } from "./content";

export default function LandingHeader() {
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-6xl">
      <div className="landing-glass flex items-center justify-between rounded-2xl px-3 py-2 sm:px-4">
        <a href="/" className="flex items-center gap-2 rounded-lg p-1 transition-opacity hover:opacity-80">
          <KlipLogo className="h-7 w-7" />
          <span className="text-base font-semibold tracking-tight">Klip</span>
        </a>

        <nav className="flex items-center gap-2">
          <a
            href="#recursos"
            className="hidden sm:inline-flex rounded-lg px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Recursos
          </a>
          <a
            href="#privacidade"
            className="hidden sm:inline-flex rounded-lg px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Privacidade
          </a>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {isAuthenticated ? (
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
              style={{ backgroundColor: BRAND.blue }}
            >
              {content.nav.dashboard}
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <button
              onClick={login}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
              style={{ backgroundColor: BRAND.blue }}
            >
              {content.nav.login}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
