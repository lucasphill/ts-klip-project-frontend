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
            className={cn("h-10 min-w-0 flex-1 justify-start gap-2 px-3 text-left font-normal", buttonClassName)}
          >
            <CalendarIcon className="h-4 w-4 text-slate-400" />
            {selectedDate ? (
              <span>{format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}</span>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
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
          className="shrink-0 text-slate-500 hover:text-slate-800"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
};

export default DatePickerField;
