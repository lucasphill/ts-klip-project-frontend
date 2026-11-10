export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  color,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color }}>
        {eyebrow}
      </p>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">{subtitle}</p>
    </div>
  );
}
