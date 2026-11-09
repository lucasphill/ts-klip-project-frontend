import type { ReactNode } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerFieldProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  clearable?: boolean;
  /** Personaliza o texto exibido para a data selecionada (ex.: "Hoje"). */
  formatLabel?: (date: Date) => ReactNode;
  /** Substitui o ícone padrão de calendário no botão. */
  icon?: ReactNode;
  /** Texto de ajuda exibido ao passar o mouse e usado como rótulo acessível. */
  title?: string;
  /** Classes extras para o botão de limpar a data. */
  clearButtonClassName?: string;
};

const parseDateValue = (value?: string): Date | undefined => {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return undefined;

  return date;
};

const toDateValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const DatePickerField = ({
  value,
  onChange,
  placeholder = "Selecione uma data",
  disabled = false,
  className,
  buttonClassName,
  clearable = true,
  formatLabel,
  icon,
  title,
  clearButtonClassName,
}: DatePickerFieldProps) => {
  const selectedDate = parseDateValue(value);

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            title={title}
            aria-label={title}
            className={cn("h-10 min-w-0 flex-1 justify-start gap-2 px-3 text-left font-normal", buttonClassName)}
          >
            {icon ?? <CalendarIcon className="h-4 w-4 text-[var(--text-faint)]" />}
            {selectedDate ? (
              <span>{formatLabel ? formatLabel(selectedDate) : format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}</span>
            ) : (
              <span className="text-[var(--text-faint)]">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(nextDate) => onChange(nextDate ? toDateValue(nextDate) : "")}
            locale={ptBR}
            captionLayout="dropdown"
            fromYear={2000}
            toYear={2100}
          />
        </PopoverContent>
      </Popover>

      {clearable && value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          onClick={() => onChange("")}
          aria-label="Limpar data"
          className={cn("shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]", clearButtonClassName)}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
};

export default DatePickerField;
