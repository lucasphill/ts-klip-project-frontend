import { CheckCircle, Clock, Coffee, Github } from "lucide-react";

/** Seção "Desenvolvimento Independente" — mantida integralmente da versão anterior. */
export default function IndieSection() {
  return (
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
              Desenvolvido de forma independente por mim, Lucas Phill
            </h3>

            <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
              <p>
                Desenvolvo o Klip de forma totalmente independente nas minhas horas vagas.
                Por ser um projeto indie em constante evolução, dedico meu tempo livre para construir o gerenciador de tarefas que sempre considerei ideal.
                Se o projeto te ajudar de alguma forma, você pode me apoiar com doações ao lado.
              </p>
              <p>Agradeço o apoio!</p>
            </div>

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
            <a
              href="https://github.com/lucasphill"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-[var(--bg-soft-strong)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-soft)] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md mb-4 w-48 justify-center"
            >
              <Github className="w-4 h-4 text-[var(--text-muted)]" />
              <span>Meu GitHub</span>
            </a>

            <div className="group relative">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-center text-[10px] py-1.5 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-20 font-semibold border border-slate-800">
                Apoio financeiro estará disponível nas próximas semanas! ☕
              </div>

              <button
                disabled
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm opacity-65 cursor-not-allowed select-none shadow-md w-48 justify-center"
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
  );
}
