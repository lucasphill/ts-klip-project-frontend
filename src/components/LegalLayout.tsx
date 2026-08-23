import { type FC, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, ShieldCheck, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Footer from './Footer';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  documentType: 'privacy' | 'terms';
  effectiveDate: string;
  version: string;
  children: ReactNode;
}

export const LegalLayout: FC<LegalLayoutProps> = ({
  title,
  subtitle,
  documentType,
  effectiveDate,
  version,
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans selection:bg-[#66ACCB]/20 selection:text-[var(--text-primary)]">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--glass-1)] border-b border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg p-1 transition-opacity hover:opacity-80"
            title="Klip - Início"
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
          </Link>

          <span className="text-[var(--text-faint)]">/</span>
          <span className="text-xs font-medium text-[var(--text-muted)]">
            {documentType === 'privacy' ? 'Privacidade' : 'Termos'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-soft-strong)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-soft)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {isAuthenticated ? 'Voltar ao Dashboard' : 'Voltar ao Início'}
          </Link>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Document Header */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border bg-[#66ACCB]/10 text-[#66ACCB] border-[#66ACCB]/25">
                {documentType === 'privacy' ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>Documento Legal Oficial</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)]">
                <span>Versão {version}</span>
                <span>•</span>
                <span>Vigência: {effectiveDate}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {subtitle}
            </p>

            {/* Quick Navigation tabs between Terms & Privacy */}
            <div className="pt-2 flex flex-wrap gap-2 border-t border-[var(--border-subtle)] text-xs print:hidden">
              <Link
                to="/privacy"
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  documentType === 'privacy'
                    ? 'bg-[#66ACCB] text-white shadow-sm'
                    : 'bg-[var(--bg-soft)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Política de Privacidade
              </Link>
              <Link
                to="/terms"
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  documentType === 'terms'
                    ? 'bg-[#66ACCB] text-white shadow-sm'
                    : 'bg-[var(--bg-soft)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Termos de Serviço
              </Link>
            </div>
          </div>

          {/* Rendered Document Sections */}
          <div className="space-y-6">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <div className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] px-5 py-3 print:hidden">
        <div className="max-w-4xl mx-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default LegalLayout;
