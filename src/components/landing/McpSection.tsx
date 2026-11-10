import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { BRAND, content } from "./content";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Mini chat animado: digita o pedido, mostra a resposta, alterna entre exemplos. */
function McpChat() {
  const frames = content.mcp.chat;
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const target = frames[step].prompt;
    if (reduced) {
      setTyped(target);
      setDone(true);
      return;
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    setTyped("");
    setDone(false);
    const tick = () => {
      if (i < target.length) {
        i += 1;
        setTyped(target.slice(0, i));
        timer = setTimeout(tick, 35);
      } else {
        setDone(true);
        timer = setTimeout(() => setStep((s) => (s + 1) % frames.length), 5000);
      }
    };
    timer = setTimeout(tick, 700);
    return () => clearTimeout(timer);
  }, [step, reduced, frames]);

  return (
    <div className="landing-glass rounded-2xl p-2 shadow-xl">
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-5 text-left">
        <div className="mb-4 flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 text-xs text-[var(--text-muted)]">
          <Sparkles className="h-3.5 w-3.5" style={{ color: BRAND.orange }} />
          Seu assistente de IA · conectado ao Klip
        </div>
        <div className="flex min-h-[200px] flex-col gap-3 text-sm">
          <div
            className="ml-auto max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-white"
            style={{ backgroundColor: BRAND.blue }}
          >
            {typed}
            {!done && <span className="ml-0.5 inline-block w-1 animate-pulse">|</span>}
          </div>
          {done && (
            <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-[var(--border-subtle)] bg-[var(--bg-soft)] px-4 py-2.5 text-[var(--text-primary)]">
              {frames[step].reply}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function McpSection() {
  const t = content.mcp;
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-5 text-left">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${BRAND.orange}1f`, color: BRAND.orange }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t.eyebrow}
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.title}</h2>
          <p className="leading-relaxed text-[var(--text-secondary)]">{t.subtitle}</p>
          <ol className="space-y-3 pt-2">
            {t.steps.map((s, i) => (
              <li key={s} className="flex items-center gap-3 text-sm">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: `${BRAND.blue}1f`, color: BRAND.blue }}
                >
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <McpChat />
      </div>
    </section>
  );
}
