import { useState, type CSSProperties, type FC, type ReactNode } from "react";
import { Calendar, CheckCircle2, Hash, List, Type, X } from "lucide-react";
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
      return <Hash className="w-3 h-3" />;
    case "enum":
      return <List className="w-3 h-3" />;
    case "date":
      return <Calendar className="w-3 h-3" />;
    case "boolean":
      return <CheckCircle2 className="w-3 h-3" />;
    case "text":
    default:
      return <Type className="w-3 h-3" />;
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

  return (
    <>
      {/* HEADER */}
      <header className="border-b border-slate-200 px-6 bg-white shrink-0">
        <div className="min-h-20 py-4 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              {title || 'Todas as Tarefas'}
              {colorDot && (
                <span
                  className={`w-3 h-3 rounded-full ${colorDot.className}`}
                  style={colorDot.style}
                />
              )}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
            {customFields.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {customFields.map((field) => (
                  <span
                    key={field.id}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {getFieldIcon(field.type)}
                    {field.name}
                    {canAddCustomField && onRemoveCustomField && (
                      <button
                        onClick={() => void onRemoveCustomField(field)}
                        className="rounded-full p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title={`Remover campo ${field.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {canAddCustomField && (
            <button
              onClick={() => setIsCreatingField(prev => !prev)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            >
              <span className="text-lg">+</span>
              Adicionar campo
            </button>
          )}
        </div>

        <AddCustomFieldModal
          isOpen={isCreatingField}
          onClose={() => setIsCreatingField(false)}
          onCreate={handleCreateField}
        />
      </header>

      <div className="flex-1 overflow-auto bg-white">
        {children}
      </div>

    </>
  );
};

export default TaskViewLayout;
