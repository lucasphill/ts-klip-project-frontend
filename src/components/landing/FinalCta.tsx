import PrimaryCta from "./PrimaryCta";
import { content } from "./content";

export default function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="landing-glass relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 0%, #66ACCB, transparent 55%), radial-gradient(circle at 80% 100%, #EE805B, transparent 55%)" }}
        />
        <div className="relative space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.finalCta.title}</h2>
          <p className="text-[var(--text-secondary)]">{content.finalCta.subtitle}</p>
          <div className="pt-4">
            <PrimaryCta />
          </div>
        </div>
      </div>
    </section>
  );
}
