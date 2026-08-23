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
      .catch(console.error)
  }, []);

  const apiStatusIsHealthy = health?.status === "Healthy";

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
        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${apiStatusIsHealthy ? "bg-emerald-500" : "bg-rose-500"}`} />
        <span className="font-medium">{apiStatusIsHealthy ? "API online" : "API com alerta"}</span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-500">© {new Date().getFullYear()} Klip</span>
      </div>
    </footer>
  );
};

export default Footer;
