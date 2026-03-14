import type { FC } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentWeekStart: Date;
  currentWeekEnd: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  formatDate: (d: Date) => string;
  currentMonth: Date;
  weeksInMonth: { start: Date; end: Date }[];
  onSelectWeek: (start: Date) => void;
};

const WeekNavigator: FC<Props> = ({ currentWeekStart, currentWeekEnd, onPrev, onNext, onToday, formatDate, currentMonth, weeksInMonth, onSelectWeek }) => {
  return (
    <>
      <div className="p-4 flex items-center gap-3">
        <button
          onClick={onPrev}
          className="hover:bg-slate-100 rounded-md transition-colors"
          title="Semana anterior"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <span className="text-sm text-slate-600 font-medium min-w-[200px] text-center">
          {formatDate(currentWeekStart)} - {formatDate(currentWeekEnd)}
        </span>
        <button
          onClick={onNext}
          className="hover:bg-slate-100 rounded-md transition-colors"
          title="Próxima semana"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
        <button
          onClick={onToday}
          className="ml-2 px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
        >
          Hoje
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="mt-2 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {weeksInMonth.map((week, idx) => {
            const isActive = currentWeekStart >= week.start && currentWeekStart <= week.end;
            return (
              <button
                key={`${week.start.toISOString()}-${idx}`}
                onClick={() => onSelectWeek(week.start)}
                className={`text-left p-2 rounded-md border text-xs transition-colors ${isActive
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
              >
                <div className="font-semibold">Semana {idx + 1}</div>
                <div className="text-[10px]">{formatDate(week.start)} - {formatDate(week.end)}</div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default WeekNavigator;
