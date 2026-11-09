import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { HealthStatus } from "../types/types";
import { healthApi } from "../services/api";

const Footer = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    healthApi
      .getHealth()
      .then(setHealth)
      .catch((error) => {
        console.error(error);
        setHealth({ status: "Unreachable" });
      });
  }, []);

  // Só exibimos o status quando há um problema confirmado; enquanto carrega ou
  // quando está tudo certo, o rodapé não chama atenção para detalhes técnicos.
  const showServiceWarning = health !== null && health.status !== "Healthy";

  return (
    <footer className="flex flex-col items-center gap-3 text-center text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:text-left">
      <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
        <p className="font-medium">
          Desenvolvido por{" "}
          <a
            href="https://github.com/lucasphill"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
          >
            Lucas Phill
          </a>
        </p>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
        <div className="flex items-center gap-2.5">
          <Link
            to="/terms"
            className="transition-colors hover:text-slate-700 dark:hover:text-slate-300 hover:underline"
          >
            Termos de Uso
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link
            to="/privacy"
            className="transition-colors hover:text-slate-700 dark:hover:text-slate-300 hover:underline"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 md:justify-start">
        {showServiceWarning && (
          <>
            <span
              role="status"
              className="inline-flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400"
              title="Alguns recursos podem ficar lentos ou indisponíveis temporariamente."
            >
              <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
              Instabilidade no serviço
            </span>
            <span className="text-slate-400">|</span>
          </>
        )}
        <span className="text-slate-500">© {new Date().getFullYear()} Klip</span>
      </div>
    </footer>
  );
};

export default Footer;
