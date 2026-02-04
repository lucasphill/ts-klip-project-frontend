import { useState, type FC, type ReactNode } from "react";
import AddCustomFieldModal from "./AddCustomFieldModal";

type TaskViewLayoutProps = {
  title?: string;
  color?: string;
  description: string;
  canAddCustomField: boolean;
};

const TaskViewLayout: FC<TaskViewLayoutProps & { children: ReactNode }> = ({ title, color, description, canAddCustomField, children }) => {
  const [isCreatingField, setIsCreatingField] = useState(false);

  const handleCreateField = (field: { name: string; type: string; optionsString?: string }) => {
    console.log("Criando campo: ", field);
    setIsCreatingField(false);
  };

  return (
    <>
      {/* HEADER */}
      <header className="border-b border-slate-200 px-6 bg-white shrink-0">
        <div className="h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              {title || 'Todas as Tarefas'}
              {color && <span className={`w-3 h-3 rounded-full ${color}`} />}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
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