import { useState, type CSSProperties, type FC, type ReactNode } from "react";
import { Calendar, CheckCircle2, Hash, List, Plus, Type, X } from "lucide-react";
import AddCustomFieldModal from "./AddCustomFieldModal";
import type {
  CreateCustomFieldDefinitionDto,
  GetCustomFieldDefinitionDto,
} from "../types/apiTypes";

type TaskViewLayoutProps = {
  title?: string;
  color?: string;
  description: string;
  canAddCustomField: boolean;
  customFields?: GetCustomFieldDefinitionDto[];
  onCreateCustomField?: (field: CreateCustomFieldDefinitionDto) => void | Promise<void>;
  onRemoveCustomField?: (field: GetCustomFieldDefinitionDto) => void | Promise<void>;
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

const getFieldIcon = (type: GetCustomFieldDefinitionDto["type"]) => {
  switch (type) {
    case "number":
      return <Hash className="h-3.5 w-3.5" />;
    case "enum":
      return <List className="h-3.5 w-3.5" />;
    case "date":
      return <Calendar className="h-3.5 w-3.5" />;
    case "boolean":
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    case "text":
    default:
      return <Type className="h-3.5 w-3.5" />;
  }
};

const TaskViewLayout: FC<TaskViewLayoutProps & { children: ReactNode }> = ({
  title,
  color,
  description,
  canAddCustomField,
  customFields = [],
  onCreateCustomField,
  onRemoveCustomField,
  children,
}) => {
  const [isCreatingField, setIsCreatingField] = useState(false);
  const colorDot = getColorDotProps(color);

  const handleCreateField = async (field: CreateCustomFieldDefinitionDto) => {
    if (onCreateCustomField) {
      await onCreateCustomField(field);
    }
    setIsCreatingField(false);
  };

  const handleRemoveField = async (field: GetCustomFieldDefinitionDto) => {
    if (!onRemoveCustomField) return;
    if (!confirm(`Tem certeza que deseja remover o campo "${field.name}" deste projeto?`)) return;
    await onRemoveCustomField(field);
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900">
              <span className="truncate">{title || "Todas as tarefas"}</span>
              {colorDot && <span className={`h-3 w-3 shrink-0 rounded-full ${colorDot.className}`} style={colorDot.style} />}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>

          {canAddCustomField && (
            <button
              onClick={() => setIsCreatingField((previous) => !previous)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Adicionar campo
            </button>
          )}
        </div>

        {customFields.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {customFields.map((field) => (
              <span
                key={field.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {getFieldIcon(field.type)}
                {field.name}
                {canAddCustomField && onRemoveCustomField && (
                  <button
                    onClick={() => void handleRemoveField(field)}
                    className="rounded-full p-0.5 text-slate-500 hover:bg-rose-100 hover:text-rose-700"
                    title={`Remover campo ${field.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </header>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</section>

      <AddCustomFieldModal
        isOpen={isCreatingField}
        onClose={() => setIsCreatingField(false)}
        onCreate={handleCreateField}
      />
    </>
  );
};

export default TaskViewLayout;
