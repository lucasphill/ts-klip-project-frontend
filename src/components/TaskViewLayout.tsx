import { type CSSProperties, type FC, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

type TaskViewLayoutProps = {
  title?: string;
  color?: string;
  description: string;
};

const getColorDotProps = (color?: string): { className: string; style?: CSSProperties } | null => {
  if (!color) return null;

  if (color.startsWith("bg-")) {
    return { className: color };
  }

  return {
    className: "",
    style: { backgroundColor: color },
  };
};

const TaskViewLayout: FC<TaskViewLayoutProps & { children: ReactNode }> = ({
  title,
  color,
  description,
  children,
}) => {
  const colorDot = getColorDotProps(color);

  return (
    <>
      <header className="border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur md:py-4 sm:px-6 [@media(max-height:600px)]:hidden">
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="flex items-center gap-3 text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              <span className="truncate">{title || "Todas as tarefas"}</span>
              {colorDot && <span className={`h-3 w-3 shrink-0 rounded-full ${colorDot.className}`} style={colorDot.style} />}
            </h1>
            <p className="mt-1 text-sm text-slate-500 hidden sm:block">{description}</p>
          </div>

          <Link
            to="/settings/custom-fields"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-2 md:px-3 md:py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            title="Gerenciar campos"
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">Gerenciar campos</span>
          </Link>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</section>
    </>
  );
};

export default TaskViewLayout;
