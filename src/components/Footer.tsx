import { useEffect, useState } from "react";
import type { HealthStatus } from "../types/types";
import { healthApi } from "../services/api";
import { useLoading } from "../contexts/LoadingContext";

const Footer = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);
    healthApi.getHealth().then(setHealth).catch(console.error).finally(() => setLoading(false));
  }, []);

  const apiStatusIsHealthy = health?.status === "Healthy";
  const statusColor = apiStatusIsHealthy ? "bg-emerald-500" : "bg-red-500";

  return (
    <footer className="mx-auto w-full border-t border-slate-200 py-3 px-4 flex flex-col md:flex-row md:items-center justify-between items-start gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
      <div className="flex flex-wrap items-center gap-6">
        <span className="whitespace-nowrap">Desenvolvido por: <a href="https://github.com/lucasphill" target="_blank" rel="noopener noreferrer">Lucas Phill</a></span>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
        <p className="mt-2 md:mt-0 text-center md:text-right">© {new Date().getFullYear()} Klip</p>
      </div>
    </footer>
  );
}

export default Footer;