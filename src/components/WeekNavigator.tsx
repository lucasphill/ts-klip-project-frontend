import type { FC } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentWeekStart: Date;
  currentWeekEnd: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  formatDate: (date: Date) => string;
  currentMonth: Date;
  weeksInMonth: { start: Date; end: Date }[];
  onSelectWeek: (start: Date) => void;
};

const WeekNavigator: FC<Props> = ({
  currentWeekStart,
  currentWeekEnd,
  onPrev,
  onNext,
  onToday,
  formatDate,
  currentMonth,
  weeksInMonth,
  onSelectWeek,
}) => {
  return (
    <section className="border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          onClick={onPrev}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
          title="Semana anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
          {formatDate(currentWeekStart)} - {formatDate(currentWeekEnd)}
        </div>
        <button
          onClick={onNext}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
          title="Proxima semana"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={onToday}
          className="ml-auto inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition-colors hover:bg-slate-50"
        >
          Hoje
        </button>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {weeksInMonth.map((week, index) => {
            const isActive = currentWeekStart >= week.start && currentWeekStart <= week.end;
            return (
              <button
                key={`${week.start.toISOString()}-${index}`}
                onClick={() => onSelectWeek(week.start)}
                className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                  isActive
                    ? "border-[#2f6fb2]/35 bg-[#2f6fb2]/10 text-[#1f4e7a]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <p className="text-xs font-semibold">Semana {index + 1}</p>
                <p className="mt-0.5 text-[11px]">{formatDate(week.start)} - {formatDate(week.end)}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WeekNavigator;
