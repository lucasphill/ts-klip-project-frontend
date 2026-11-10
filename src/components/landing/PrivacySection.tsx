import { KeyRound, Lock, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import SectionHeading from "./SectionHeading";
import { BRAND, content } from "./content";

const ICONS: Record<string, ReactNode> = {
  personal: <UserRound className="h-5 w-5" />,
  encrypted: <Lock className="h-5 w-5" />,
  control: <KeyRound className="h-5 w-5" />,
};

export default function PrivacySection() {
  const t = content.privacy;
  return (
    <section id="privacidade" className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} color={BRAND.orange} />
      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        {t.items.map((item) => (
          <div key={item.id} className="landing-glass flex gap-4 rounded-2xl p-6 text-left">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${BRAND.orange}1f`, color: BRAND.orange }}
            >
              {ICONS[item.id]}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
        Saiba mais na{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-[var(--text-primary)]">
          Política de Privacidade
        </a>
        .
      </p>
    </section>
  );
}
