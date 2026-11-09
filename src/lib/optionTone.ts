/**
 * Cores para opções de campos de seleção (ex.: Prioridade).
 * Palavras conhecidas recebem a cor semântica; as demais seguem uma paleta
 * fixa pela posição da opção, para que a mesma opção tenha sempre a mesma cor.
 */
export type OptionTone = "red" | "amber" | "emerald" | "sky" | "violet" | "slate";

const TONE_BY_KEYWORD: Array<[RegExp, OptionTone]> = [
  [/^(alta|urgente|cr[ií]tica|high|urgent|critical|bloquead[ao])$/, "red"],
  [/^(m[ée]dia|normal|medium|em andamento|fazendo|doing)$/, "amber"],
  [/^(baixa|low|conclu[ií]d[ao]|feito|done|ok)$/, "emerald"],
];

const FALLBACK_TONES: OptionTone[] = ["sky", "violet", "amber", "emerald", "red", "slate"];

export const getOptionTone = (option: string, index: number): OptionTone => {
  const normalized = option.trim().toLowerCase();
  for (const [pattern, tone] of TONE_BY_KEYWORD) {
    if (pattern.test(normalized)) return tone;
  }
  return FALLBACK_TONES[Math.max(index, 0) % FALLBACK_TONES.length];
};

export const OPTION_TONE_CLASSES: Record<OptionTone, string> = {
  red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
};
