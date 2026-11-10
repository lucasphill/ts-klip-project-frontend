import { CalendarDays, FileText, Filter, ListTree, Palette, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import SectionHeading from "./SectionHeading";
import { BRAND, content } from "./content";

const ICONS: Record<string, ReactNode> = {
  fields: <SlidersHorizontal className="h-5 w-5" />,
  projects: <Palette className="h-5 w-5" />,
  subtasks: <ListTree className="h-5 w-5" />,
  notes: <FileText className="h-5 w-5" />,
  filters: <Filter className="h-5 w-5" />,
  inbox: <CalendarDays className="h-5 w-5" />,
};

// Layout da grade bento (desktop): o primeiro card é o destaque.
const SPANS: Record<string, string> = {
  fields: "md:col-span-2 md:row-span-2",
  projects: "md:col-span-2",
  subtasks: "",
  notes: "",
  filters: "md:col-span-2",
  inbox: "md:col-span-2",
};

const SAMPLE_FIELDS = [
  { label: "Prioridade", value: "Alta", color: BRAND.orange },
  { label: "Contexto", value: "Casa", color: BRAND.blue },
  { label: "Energia", value: "Baixa", color: "#9b59b6" },
  { label: "Revisado", value: "✓", color: "#10b981" },
];

export default function FeaturesBento() {
  const t = content.features;
  return (
    <section id="recursos" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} color={BRAND.blue} />

      <div className="mt-14 grid grid-cols-1 gap-4 md:auto-rows-[minmax(170px,auto)] md:grid-cols-4">
        {t.items.map((item, i) => {
          const color = i % 2 === 0 ? BRAND.blue : BRAND.orange;
          const highlight = item.id === "fields";
          return (
            <article
              key={item.id}
              className={`landing-glass group flex flex-col gap-3 rounded-2xl p-6 text-left transition-transform hover:-translate-y-0.5 ${SPANS[item.id]}`}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}1f`, color }}
              >
                {ICONS[item.id]}
              </div>
              <h3 className={`${highlight ? "text-2xl" : "text-lg"} font-semibold tracking-tight`}>{item.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.text}</p>

              {highlight && (
                <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
                  {SAMPLE_FIELDS.map((f) => (
                    <div
                      key={f.label}
                      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)]/70 px-3 py-2"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">{f.label}</p>
                      <p className="text-sm font-semibold" style={{ color: f.color }}>
                        {f.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
