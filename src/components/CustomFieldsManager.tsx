import { useEffect, useState, type FC } from "react";
import { toast } from "sonner";
import {
  Calendar, CheckCircle2, Hash, Link2, List, Pencil, Plus, Trash2, Type, Unlink,
} from "lucide-react";
import {
  customFieldDefinitionsApi,
  projectsCustomFieldDefinitionsApi,
} from "../services/api";
import type {
  CreateCustomFieldDefinitionDto,
  GetCustomFieldDefinitionDto,
  GetProjectsDto,
} from "../types/apiTypes";
import CustomFieldFormModal from "./CustomFieldFormModal";

const normalizeFieldOptions = (options?: string | string[] | null): string[] => {
  if (Array.isArray(options)) return options.map((o) => o.trim()).filter(Boolean);
  return String(options ?? "").split(",").map((o) => o.trim()).filter(Boolean);
};

const normalizeCustomField = (field: GetCustomFieldDefinitionDto): GetCustomFieldDefinitionDto => ({
  ...field,
  options: normalizeFieldOptions(field.options),
});

const areSameOptions = (left: string[], right: string[]) =>
  left.length === right.length && left.every((o, i) => o === right[i]);

const FieldTypeIcon: FC<{ type: GetCustomFieldDefinitionDto["type"] }> = ({ type }) => {
  switch (type) {
    case "number": return <Hash className="h-3.5 w-3.5" />;
    case "enum": return <List className="h-3.5 w-3.5" />;
    case "date": return <Calendar className="h-3.5 w-3.5" />;
    case "boolean": return <CheckCircle2 className="h-3.5 w-3.5" />;
    default: return <Type className="h-3.5 w-3.5" />;
  }
};

const typeLabel: Record<string, string> = {
  text: "Texto",
  number: "Número",
  enum: "Seleção",
  date: "Data",
  boolean: "Booleano",
};

type CustomFieldsManagerProps = {
  projects: GetProjectsDto[];
};

const CustomFieldsManager: FC<CustomFieldsManagerProps> = ({ projects }) => {
  const [tab, setTab] = useState<"universal" | "project">("universal");

  // Universal fields state
  const [allFields, setAllFields] = useState<GetCustomFieldDefinitionDto[]>([]);
  const [isLoadingFields, setIsLoadingFields] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState<GetCustomFieldDefinitionDto | null>(null);

  // Project fields state
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projectFields, setProjectFields] = useState<GetCustomFieldDefinitionDto[]>([]);
  const [isLoadingProjectFields, setIsLoadingProjectFields] = useState(false);
  const [showCreateAndLinkModal, setShowCreateAndLinkModal] = useState(false);

  const loadAllFields = async () => {
    setIsLoadingFields(true);
    try {
      const res = await customFieldDefinitionsApi.getAll();
      setAllFields((res.data ?? []).map(normalizeCustomField));
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao carregar campos personalizados");
    } finally {
      setIsLoadingFields(false);
    }
  };

  useEffect(() => {
    void loadAllFields();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setProjectFields([]);
      return;
    }
    setIsLoadingProjectFields(true);
    projectsCustomFieldDefinitionsApi
      .getByProject(selectedProjectId)
      .then((res) => setProjectFields((res.data ?? []).map(normalizeCustomField)))
      .catch((err: any) => toast.error(err?.message ?? "Erro ao carregar campos do projeto"))
      .finally(() => setIsLoadingProjectFields(false));
  }, [selectedProjectId]);

  // -- Universal CRUD --

  const handleCreate = async (data: CreateCustomFieldDefinitionDto) => {
    const opts = normalizeFieldOptions(data.options);
    try {
      await customFieldDefinitionsApi.create({
        ...data,
        options: opts.length > 0 ? opts.join(",") : undefined,
      });
      toast.success(`Campo "${data.name}" criado`);
      await loadAllFields();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao criar campo");
      throw err;
    }
  };

  const handleUpdate = async (data: CreateCustomFieldDefinitionDto) => {
    if (!fieldToEdit) return;
    const opts = normalizeFieldOptions(data.options);
    try {
      await customFieldDefinitionsApi.update(fieldToEdit.id, {
        ...data,
        options: opts.length > 0 ? opts.join(",") : undefined,
      });
      toast.success(`Campo "${data.name}" atualizado`);
      await loadAllFields();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao atualizar campo");
      throw err;
    }
  };

  const handleDelete = async (field: GetCustomFieldDefinitionDto) => {
    if (!confirm(`Excluir o campo "${field.name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await customFieldDefinitionsApi.remove(field.id);
      setAllFields((prev) => prev.filter((f) => f.id !== field.id));
      toast.success(`Campo "${field.name}" excluído`);
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao excluir campo");
    }
  };

  const openEdit = (field: GetCustomFieldDefinitionDto) => {
    setFieldToEdit(field);
    setShowFormModal(true);
  };

  // -- Project assignment --

  const unassignedFields = allFields.filter((f) => !projectFields.some((pf) => pf.id === f.id));

  const handleAssign = async (fieldId: string) => {
    if (!selectedProjectId) return;
    try {
      await projectsCustomFieldDefinitionsApi.assign(selectedProjectId, fieldId);
      const field = allFields.find((f) => f.id === fieldId);
      if (field) setProjectFields((prev) => [...prev, field]);
      toast.success("Campo vinculado ao projeto");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao vincular campo");
    }
  };

  const handleUnassign = async (field: GetCustomFieldDefinitionDto) => {
    if (!selectedProjectId) return;
    if (!confirm(`Desvincular o campo "${field.name}" deste projeto?`)) return;
    try {
      await projectsCustomFieldDefinitionsApi.unassign(selectedProjectId, field.id);
      setProjectFields((prev) => prev.filter((f) => f.id !== field.id));
      toast.success("Campo desvinculado do projeto");
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao desvincular campo");
    }
  };

  const handleCreateAndLink = async (data: CreateCustomFieldDefinitionDto) => {
    if (!selectedProjectId) return;
    const opts = normalizeFieldOptions(data.options);
    const payload = { ...data, options: opts.length > 0 ? opts.join(",") : undefined };
    try {
      await customFieldDefinitionsApi.create(payload);
      const allRes = await customFieldDefinitionsApi.getAll();
      const normalized = (allRes.data ?? []).map(normalizeCustomField);
      const matched = normalized
        .filter((f) =>
          f.name.trim().toLowerCase() === data.name.trim().toLowerCase() &&
          f.type === data.type &&
          areSameOptions(normalizeFieldOptions(f.options), opts)
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      if (!matched) throw new Error("Não foi possível localizar o campo criado.");
      await projectsCustomFieldDefinitionsApi.assign(selectedProjectId, matched.id);
      setAllFields(normalized);
      setProjectFields((prev) => [...prev.filter((f) => f.id !== matched.id), matched]);
      toast.success(`Campo "${data.name}" criado e vinculado`);
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao criar e vincular campo");
      throw err;
    }
  };

  return (
    <div>
      {/* Inner tab switcher */}
      <div className="mb-6 flex gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-soft)] p-1 w-fit">
        {(["universal", "project"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-[var(--bg-panel)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t === "universal" ? "Campos universais" : "Por projeto"}
          </button>
        ))}
      </div>

      {/* ── Universal tab ── */}
      {tab === "universal" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Campos universais</h3>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Campos disponíveis para vincular a qualquer projeto.
              </p>
            </div>
            <button
              onClick={() => { setFieldToEdit(null); setShowFormModal(true); }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3 text-xs font-medium text-white transition-colors hover:bg-[var(--brand-strong)]"
            >
              <Plus className="h-3.5 w-3.5" /> Novo campo
            </button>
          </div>

          {isLoadingFields ? (
            <div className="py-10 text-center text-sm text-[var(--text-muted)]">Carregando campos...</div>
          ) : allFields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border-subtle)] py-12 text-center">
              <div className="mb-2 flex justify-center text-[var(--text-faint)]">
                <Hash className="h-8 w-8" />
              </div>
              <p className="text-sm text-[var(--text-muted)]">Nenhum campo criado ainda.</p>
              <button
                onClick={() => { setFieldToEdit(null); setShowFormModal(true); }}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)] hover:underline"
              >
                <Plus className="h-4 w-4" /> Criar primeiro campo
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-soft)]">
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Nome</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Tipo</th>
                    <th className="hidden px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] sm:table-cell">Opções</th>
                    <th className="w-20 px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {allFields.map((field) => {
                    const opts = normalizeFieldOptions(field.options);
                    return (
                      <tr key={field.id} className="group bg-[var(--bg-panel)] transition-colors hover:bg-[var(--bg-soft)]">
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                            <span className="text-[var(--text-muted)]"><FieldTypeIcon type={field.type} /></span>
                            {field.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-muted)]">{typeLabel[field.type] ?? field.type}</td>
                        <td className="hidden px-4 py-3 sm:table-cell">
                          {opts.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {opts.map((o) => (
                                <span key={o} className="rounded-md bg-[var(--bg-soft-strong)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">{o}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[var(--text-faint)]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => openEdit(field)}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft-strong)] hover:text-[var(--text-primary)]"
                              title="Editar"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => void handleDelete(field)}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Excluir"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Por projeto tab ── */}
      {tab === "project" && (
        <div>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Campos por projeto</h3>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">Selecione um projeto para gerenciar seus campos.</p>
            </div>
            <select
              className="field h-9 w-full bg-[var(--field-bg)] px-3 text-sm sm:w-56"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">Selecione um projeto...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {!selectedProjectId ? (
            <div className="rounded-lg border border-dashed border-[var(--border-subtle)] py-12 text-center">
              <p className="text-sm text-[var(--text-muted)]">Selecione um projeto para visualizar seus campos.</p>
            </div>
          ) : isLoadingProjectFields ? (
            <div className="py-10 text-center text-sm text-[var(--text-muted)]">Carregando...</div>
          ) : (
            <>
              {/* Split view */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                {/* Left: Linked fields */}
                <div className="flex flex-col overflow-hidden rounded-lg border border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-soft)] px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Vinculados</span>
                      <span className="rounded-full bg-[var(--bg-soft-strong)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                        {projectFields.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowCreateAndLinkModal(true)}
                      className="inline-flex h-7 items-center gap-1 rounded-md bg-[var(--brand)] px-2.5 text-xs font-medium text-white transition-colors hover:bg-[var(--brand-strong)]"
                    >
                      <Plus className="h-3 w-3" /> Criar e vincular
                    </button>
                  </div>

                  {projectFields.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center py-10 text-center">
                      <p className="text-xs text-[var(--text-faint)]">Nenhum campo vinculado.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-[var(--border-subtle)]">
                      {projectFields.map((field) => (
                        <li
                          key={field.id}
                          className="group flex items-center gap-3 bg-[var(--bg-panel)] px-4 py-2.5 transition-colors hover:bg-[var(--bg-soft)]"
                        >
                          <span className="text-[var(--text-muted)]"><FieldTypeIcon type={field.type} /></span>
                          <span className="flex-1 min-w-0">
                            <span className="block truncate text-sm font-medium text-[var(--text-primary)]">{field.name}</span>
                            <span className="text-xs text-[var(--text-faint)]">{typeLabel[field.type] ?? field.type}</span>
                          </span>
                          <button
                            onClick={() => void handleUnassign(field)}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                            title="Desvincular"
                          >
                            <Unlink className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Right: Available fields */}
                <div className="flex flex-col overflow-hidden rounded-lg border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-soft)] px-4 py-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Disponíveis</span>
                    <span className="rounded-full bg-[var(--bg-soft-strong)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                      {unassignedFields.length}
                    </span>
                  </div>

                  {unassignedFields.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center py-10 text-center">
                      <p className="text-xs text-[var(--text-faint)]">
                        {allFields.length === 0
                          ? "Nenhum campo criado ainda."
                          : "Todos os campos já estão vinculados."}
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-[var(--border-subtle)]">
                      {unassignedFields.map((field) => (
                        <li
                          key={field.id}
                          className="group flex items-center gap-3 bg-[var(--bg-panel)] px-4 py-2.5 transition-colors hover:bg-[var(--bg-soft)]"
                        >
                          <span className="text-[var(--text-muted)]"><FieldTypeIcon type={field.type} /></span>
                          <span className="flex-1 min-w-0">
                            <span className="block truncate text-sm font-medium text-[var(--text-primary)]">{field.name}</span>
                            <span className="text-xs text-[var(--text-faint)]">{typeLabel[field.type] ?? field.type}</span>
                          </span>
                          <button
                            onClick={() => void handleAssign(field.id)}
                            className="flex h-6 shrink-0 items-center gap-1 rounded-md border border-[var(--border-subtle)] px-2 text-xs font-medium text-[var(--text-muted)] opacity-0 transition-all group-hover:opacity-100 hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:text-white"
                            title="Vincular ao projeto"
                          >
                            <Link2 className="h-3 w-3" /> Vincular
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <CustomFieldFormModal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setFieldToEdit(null); }}
        onSave={fieldToEdit ? handleUpdate : handleCreate}
        initialData={fieldToEdit}
      />
      <CustomFieldFormModal
        isOpen={showCreateAndLinkModal}
        onClose={() => setShowCreateAndLinkModal(false)}
        onSave={handleCreateAndLink}
      />
    </div>
  );
};

export default CustomFieldsManager;
