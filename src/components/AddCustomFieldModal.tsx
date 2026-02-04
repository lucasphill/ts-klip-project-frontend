import { useState } from "react";
import type { FC } from "react";

type Field = {
  name: string;
  type: string;
  optionsString?: string;
};

const AddCustomFieldModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (field: Field) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const [field, setField] = useState<Field>({ name: "", type: "text", optionsString: "" });

  if (!isOpen) return null;

  const submit = () => {
    if (!field.name.trim()) return;
    onCreate(field);
    setField({ name: "", type: "text", optionsString: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-widest">Criar campo personalizado</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Nome do campo"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={field.name}
            onChange={(e) => setField({ ...field, name: e.target.value })}
          />

          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
            value={field.type}
            onChange={(e) => setField({ ...field, type: e.target.value })}
          >
            <option value="text">Texto</option>
            <option value="number">Número</option>
            <option value="enum">Enum (Seleção)</option>
          </select>

          {field.type === "enum" ? (
            <input
              type="text"
              placeholder="Opções (ex: Alta, Média, Baixa)"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={field.optionsString}
              onChange={(e) => setField({ ...field, optionsString: e.target.value })}
            />
          ) : (
            <div className="hidden md:block" />
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 justify-end">
          <button
            onClick={submit}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            Criar campo
          </button>
          <button
            onClick={() => {
              onClose();
              setField({ name: "", type: "text", optionsString: "" });
            }}
            className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-md"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomFieldModal;
