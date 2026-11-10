import AppPreview from "./AppPreview";
import PrimaryCta from "./PrimaryCta";
import { BRAND, content } from "./content";

export default function Hero() {
  const t = content.hero;
  return (
    <section className="flex flex-col items-center px-4 pt-16 pb-16 text-center sm:px-6 sm:pt-24 lg:px-8">
      <div className="max-w-3xl space-y-6">
        <span className="landing-glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: BRAND.orange }} />
          {t.badge}
        </span>

        <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          {t.titleStart}
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.orange})` }}
          >
            {t.titleHighlight}
          </span>
        </h1>

        <p className="mx-auto max-w-xl text-lg font-medium text-[var(--text-primary)] sm:text-xl">{t.subtitle}</p>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-[var(--text-secondary)]">{t.support}</p>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <PrimaryCta />
          <a
            href="#recursos"
            className="landing-glass inline-flex w-full items-center justify-center rounded-xl px-7 py-3.5 text-base font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:w-auto"
          >
            {t.secondary}
          </a>
        </div>
      </div>

      <div className="mt-16 w-full max-w-5xl">
        <AppPreview />
      </div>
    </section>
  );
}
