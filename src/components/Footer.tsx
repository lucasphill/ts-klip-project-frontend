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
  const statusLabel = health ? "Online" : "Offline";
  const apiVersion = health?.version || "Inavailable";

  return (
    <footer className="mx-auto w-full border-t border-slate-200 py-3 px-4 flex flex-col md:flex-row md:items-center justify-between items-start gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
      <div className="flex flex-wrap items-center gap-6">
        {/* <span className="whitespace-nowrap">Versao do App: v0.0.1-Development</span> */}
        <span className="whitespace-nowrap">Versao da API: {apiVersion}</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
          <span className="whitespace-nowrap">Status da API: {statusLabel}</span>
        </div>
      </div>
      <p className="mt-2 md:mt-0 text-center md:text-right">© {new Date().getFullYear()} Klip</p>
    </footer>
  );
}

export default Footer;