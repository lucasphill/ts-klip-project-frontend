import React, { useState, useEffect } from 'react';
import { Plus, Settings, Tag, FileText, Hash, List, Trash2, Save } from 'lucide-react';

/**
 * App para Gerenciamento de Custom Fields baseada no DBML fornecido.
 */
export default function Teste3() {
  // --- Estados para Definições (Tabela custom_field_definitions) ---
  const [definitions, setDefinitions] = useState([
    { id: '1', name: 'Prioridade', type: 'enum', options: ['Baixa', 'Média', 'Alta'] },
    { id: '2', name: 'Horas Estimadas', type: 'number', options: [] },
    { id: '3', name: 'Link de Documentação', type: 'text', options: [] }
  ]);

  // --- Estados para Valores da Tarefa de Exemplo (Tabela custom_field_values) ---
  const [taskValues, setTaskValues] = useState({
    '1': { selected_option_id: 'Média' },
    '2': { value_number: 5 },
    '3': { value_text: 'https://docs.exemplo.com' }
  });

  // Estado para criação de nova definição
  const [isCreating, setIsCreating] = useState(false);
  const [newDef, setNewDef] = useState({ name: '', type: 'text', optionsString: '' });

  // --- Handlers ---
  const addDefinition = () => {
    if (!newDef.name) return;
    const options = newDef.optionsString ? newDef.optionsString.split(',').map(s => s.trim()) : [];
    const id = Math.random().toString(36).substr(2, 9);
    setDefinitions([...definitions, { ...newDef, id, options }]);
    setNewDef({ name: '', type: 'text', optionsString: '' });
    setIsCreating(false);
  };

  const updateTaskValue = (defId, valueObj) => {
    setTaskValues(prev => ({
      ...prev,
      [defId]: valueObj
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* COLUNA ESQUERDA: Configuração de Campos (Definitions) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Definições de Campos
              </h2>
              <p className="text-sm text-gray-500">Tabela: custom_field_definitions</p>
            </div>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {isCreating && (
              <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in duration-300">
                <h3 className="font-semibold mb-3 text-blue-900 text-sm uppercase tracking-wider">Novo Campo</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nome do campo (ex: Squad)"
                    className="w-full p-2 border rounded border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newDef.name}
                    onChange={e => setNewDef({ ...newDef, name: e.target.value })}
                  />
                  <select
                    className="w-full p-2 border rounded border-blue-200 bg-white"
                    value={newDef.type}
                    onChange={e => setNewDef({ ...newDef, type: e.target.value })}
                  >
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                    <option value="enum">Enum (Seleção)</option>
                  </select>
                  {newDef.type === 'enum' && (
                    <input
                      type="text"
                      placeholder="Opções separadas por vírgula"
                      className="w-full p-2 border rounded border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newDef.optionsString}
                      onChange={e => setNewDef({ ...newDef, optionsString: e.target.value })}
                    />
                  )}
                  <div className="flex gap-2">
                    <button onClick={addDefinition} className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700">Criar</button>
                    <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Cancelar</button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {definitions.map(def => (
                <div key={def.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-300 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded text-gray-500">
                      {def.type === 'text' && <FileText size={18} />}
                      {def.type === 'number' && <Hash size={18} />}
                      {def.type === 'enum' && <List size={18} />}
                    </div>
                    <div>
                      <p className="font-medium">{def.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{def.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDefinitions(definitions.filter(d => d.id !== def.id))}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COLUNA DIREITA: Editor da Tarefa (Values) */}
        <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-800 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-400" />
              Tarefa: Exemplo de Implementação
            </h2>
            <p className="text-sm text-gray-400 mt-1">ID da Tarefa: 7d2f-4a1b-...</p>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <label className="text-xs font-bold text-gray-400 uppercase">Título da Tarefa</label>
              <h1 className="text-2xl font-bold text-gray-900">Implementar API de Custom Fields</h1>
              <p className="text-gray-500 mt-2">Seguindo o modelo DBML anexo para suporte a multi-homing e campos personalizados.</p>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-gray-700 border-b pb-2 flex items-center gap-2">
                Campos Personalizados
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Tabela: custom_field_values</span>
              </h3>

              {definitions.length === 0 && (
                <p className="text-center py-8 text-gray-400 italic">Nenhum campo personalizado disponível para esta tarefa.</p>
              )}

              {definitions.map(def => {
                const value = taskValues[def.id] || {};

                return (
                  <div key={def.id} className="animate-in slide-in-from-right-2 duration-300">
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">{def.name}</label>

                    {def.type === 'text' && (
                      <input
                        type="text"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                        placeholder="Insira o texto..."
                        value={value.value_text || ''}
                        onChange={e => updateTaskValue(def.id, { value_text: e.target.value })}
                      />
                    )}

                    {def.type === 'number' && (
                      <input
                        type="number"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                        placeholder="0"
                        value={value.value_number || ''}
                        onChange={e => updateTaskValue(def.id, { value_number: Number(e.target.value) })}
                      />
                    )}

                    {def.type === 'enum' && (
                      <div className="flex flex-wrap gap-2">
                        {def.options?.map(opt => (
                          <button
                            key={opt}
                            onClick={() => updateTaskValue(def.id, { selected_option_id: opt })}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${value.selected_option_id === opt
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-12 pt-6 border-t flex justify-end">
              <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-transform active:scale-95">
                <Save size={18} />
                Guardar Tarefa
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* FOOTER INFO */}
      <footer className="max-w-6xl mx-auto mt-8 p-4 text-center">
        <div className="inline-flex items-center gap-6 text-xs text-gray-400 bg-white px-6 py-2 rounded-full shadow-sm border">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Definições: {definitions.length}</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Valores Preenchidos: {Object.keys(taskValues).length}</span>
        </div>
      </footer>
    </div>
  );
}