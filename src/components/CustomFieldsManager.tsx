import { useEffect, useState, type FC } from "react";
import { toast } from "sonner";
import {
  Calendar,
  CheckCircle2,
  Globe2,
  Hash,
  Link2,
  List,
  Pencil,
  Plus,
  Trash2,
  Type,
  Unlink,
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
  isUniversal: Boolean(field.isUniversal),
  options: normalizeFieldOptions(field.options),
});

const areSameOptions = (left: string[], right: string[]) =>
  left.length === right.length && left.every((o, i) => o === right[i]);

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

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
  number: "Numero",
  enum: "Selecao",
  date: "Data",
  boolean: "Booleano",
};

type CustomFieldsManagerProps = {
  projects: GetProjectsDto[];
};

const CustomFieldsManager: FC<CustomFieldsManagerProps> = ({ projects }) => {
  const [tab, setTab] = useState<"universal" | "project">("universal");

  const [allFields, setAllFields] = useState<GetCustomFieldDefinitionDto[]>([]);
  const [isLoadingFields, setIsLoadingFields] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState<GetCustomFieldDefinitionDto | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projectFields, setProjectFields] = useState<GetCustomFieldDefinitionDto[]>([]);
  const [isLoadingProjectFields, setIsLoadingProjectFields] = useState(false);
  const [showCreateAndLinkModal, setShowCreateAndLinkModal] = useState(false);

  const universalFields = allFields.filter((field) => field.isUniversal);
  const projectSpecificFields = allFields.filter((field) => !field.isUniversal);
  const unassignedFields = projectSpecificFields.filter(
    (field) => !projectFields.some((projectField) => projectField.id === field.id)
  );
  const formScope = fieldToEdit ? (fieldToEdit.isUniversal ? "universal" : "project") : "universal";

  const loadAllFields = async () => {
    setIsLoadingFields(true);
    try {
      const res = await customFieldDefinitionsApi.getAll();
      setAllFields((res.data ?? []).map(normalizeCustomField));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao carregar campos personalizados"));
    } finally {
      setIsLoadingFields(false);
    }
  };

  const loadProjectFields = async (projectId: string) => {
    setIsLoadingProjectFields(true);
    try {
      const res = await projectsCustomFieldDefinitionsApi.getByProject(projectId);
      setProjectFields((res.data ?? []).map(normalizeCustomField));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao carregar campos do projeto"));
    } finally {
      setIsLoadingProjectFields(false);
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

    void loadProjectFields(selectedProjectId);
  }, [selectedProjectId]);

  const buildDefinitionPayload = (
    data: CreateCustomFieldDefinitionDto,
    isUniversal: boolean
  ): CreateCustomFieldDefinitionDto => {
    const opts = normalizeFieldOptions(data.options);
    return {
      ...data,
      isUniversal,
      options: opts.length > 0 ? opts.join(",") : undefined,
    };
  };

  const handleCreate = async (data: CreateCustomFieldDefinitionDto) => {
    try {
      await customFieldDefinitionsApi.create(buildDefinitionPayload(data, true));
      toast.success(`Campo "${data.name}" criado`);
      await loadAllFields();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao criar campo"));
      throw err;
    }
  };

  const handleUpdate = async (data: CreateCustomFieldDefinitionDto) => {
    if (!fieldToEdit) return;

    try {
      await customFieldDefinitionsApi.update(
        fieldToEdit.id,
        buildDefinitionPayload(data, fieldToEdit.isUniversal)
      );
      toast.success(`Campo "${data.name}" atualizado`);
      await loadAllFields();
      if (selectedProjectId) {
        await loadProjectFields(selectedProjectId);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao atualizar campo"));
      throw err;
    }
  };

  const handleDelete = async (field: GetCustomFieldDefinitionDto) => {
    if (!confirm(`Excluir o campo "${field.name}"? Esta acao nao pode ser desfeita.`)) return;

    try {
      await customFieldDefinitionsApi.remove(field.id);
      setAllFields((prev) => prev.filter((f) => f.id !== field.id));
      setProjectFields((prev) => prev.filter((f) => f.id !== field.id));
      toast.success(`Campo "${field.name}" excluido`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao excluir campo"));
    }
  };

  const openEdit = (field: GetCustomFieldDefinitionDto) => {
    setFieldToEdit(field);
    setShowFormModal(true);
  };

  const handleAssign = async (fieldId: string) => {
    if (!selectedProjectId) return;
    const field = projectSpecificFields.find((f) => f.id === fieldId);
    if (!field) return;

    try {
      await projectsCustomFieldDefinitionsApi.assign(selectedProjectId, fieldId);
      setProjectFields((prev) => [...prev, field]);
      toast.success("Campo vinculado ao projeto");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao vincular campo"));
    }
  };

  const handleUnassign = async (field: GetCustomFieldDefinitionDto) => {
    if (!selectedProjectId || field.isUniversal) return;
    if (!confirm(`Desvincular o campo "${field.name}" deste projeto?`)) return;

    try {
      await projectsCustomFieldDefinitionsApi.unassign(selectedProjectId, field.id);
      setProjectFields((prev) => prev.filter((f) => f.id !== field.id));
      toast.success("Campo desvinculado do projeto");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao desvincular campo"));
    }
  };

  const handleCreateAndLink = async (data: CreateCustomFieldDefinitionDto) => {
    if (!selectedProjectId) return;
    const opts = normalizeFieldOptions(data.options);

    try {
      await customFieldDefinitionsApi.create(buildDefinitionPayload(data, false));
      const allRes = await customFieldDefinitionsApi.getAll();
      const normalized = (allRes.data ?? []).map(normalizeCustomField);
      const matched = normalized
        .filter((field) =>
          !field.isUniversal &&
          field.name.trim().toLowerCase() === data.name.trim().toLowerCase() &&
          field.type === data.type &&
          areSameOptions(normalizeFieldOptions(field.options), opts)
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (!matched) throw new Error("Nao foi possivel localizar o campo criado.");

      await projectsCustomFieldDefinitionsApi.assign(selectedProjectId, matched.id);
      setAllFields(normalized);
      await loadProjectFields(selectedProjectId);
      toast.success(`Campo "${data.name}" criado e vinculado`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Erro ao criar e vincular campo"));
      throw err;
    }
  };

  const renderOptions = (field: GetCustomFieldDefinitionDto) => {
    const opts = normalizeFieldOptions(field.options);

    if (opts.length === 0) {
      return <span className="text-[var(--text-faint)]">-</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {opts.map((option) => (
          <span
            key={option}
            className="rounded-md bg-[var(--bg-soft-strong)] px-2 py-0.5 text-xs text-[var(--text-secondary)]"
          >
            {option}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 flex w-fit gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-soft)] p-1">
        {(["universal", "project"] as const).map((currentTab) => (
          <button
            key={currentTab}
            onClick={() => setTab(currentTab)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === currentTab
                ? "border border-[var(--border-subtle)] bg-[var(--bg-panel)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {currentTab === "universal" ? "Campos universais" : "Por projeto"}
          </button>
        ))}
      </div>

      {tab === "universal" && (
        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Campos universais</h3>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Campos disponiveis para todas as tarefas, com ou sem projeto.
              </p>
            </div>
            <button
              onClick={() => { setFieldToEdit(null); setShowFormModal(true); }}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[var(--brand)] px-3 text-xs font-medium text-white transition-colors hover:bg-[var(--brand-strong)]"
            >
              <Plus className="h-3.5 w-3.5" /> Novo campo
            </button>
          </div>

          {isLoadingFields ? (
            <div className="py-10 text-center text-sm text-[var(--text-muted)]">Carregando campos...</div>
          ) : universalFields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--border-subtle)] py-12 text-center">
              <div className="mb-2 flex justify-center text-[var(--text-faint)]">
                <Globe2 className="h-8 w-8" />
              </div>
              <p className="text-sm text-[var(--text-muted)]">Nenhum campo universal criado ainda.</p>
              <button
                onClick={() => { setFieldToEdit(null); setShowFormModal(true); }}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)] hover:underline"
              >
                <Plus className="h-4 w-4" /> Criar primeiro campo universal
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-soft)]">
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Nome</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Tipo</th>
                    <th className="hidden px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] sm:table-cell">Opcoes</th>
                    <th className="w-24 px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {universalFields.map((field) => (
                    <tr key={field.id} className="bg-[var(--bg-panel)] transition-colors hover:bg-[var(--bg-soft)]">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                          <span className="text-[var(--text-muted)]"><FieldTypeIcon type={field.type} /></span>
                          {field.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{typeLabel[field.type] ?? field.type}</td>
                      <td className="hidden px-4 py-3 sm:table-cell">{renderOptions(field)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(field)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft-strong)] hover:text-[var(--text-primary)]"
                            title="Editar"
                            aria-label={`Editar campo ${field.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => void handleDelete(field)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Excluir"
                            aria-label={`Excluir campo ${field.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "project" && (
        <div>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Campos por projeto</h3>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Gerencie campos especificos do projeto; campos universais aparecem herdados.
              </p>
            </div>
            <select
              className="field h-9 w-full bg-[var(--field-bg)] px-3 text-sm sm:w-56"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">Selecione um projeto...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
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
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="flex flex-col overflow-hidden rounded-lg border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-soft)] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">No projeto</span>
                    <span className="rounded-full bg-[var(--bg-soft-strong)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                      {projectFields.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCreateAndLinkModal(true)}
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-[var(--brand)] px-2.5 text-xs font-medium text-white transition-colors hover:bg-[var(--brand-strong)]"
                  >
                    <Plus className="h-3 w-3" /> Criar e vincular
                  </button>
                </div>

                {projectFields.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center py-10 text-center">
                    <p className="text-xs text-[var(--text-faint)]">Nenhum campo disponivel neste projeto.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-[var(--border-subtle)]">
                    {projectFields.map((field) => (
                      <li
                        key={field.id}
                        className="flex items-center gap-3 bg-[var(--bg-panel)] px-4 py-2.5 transition-colors hover:bg-[var(--bg-soft)]"
                      >
                        <span className="text-[var(--text-muted)]"><FieldTypeIcon type={field.type} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="block truncate text-sm font-medium text-[var(--text-primary)]">{field.name}</span>
                            {field.isUniversal && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--bg-soft-strong)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                                <Globe2 className="h-3 w-3" /> Universal
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-[var(--text-faint)]">{typeLabel[field.type] ?? field.type}</span>
                        </span>
                        {field.isUniversal ? (
                          <span className="text-xs text-[var(--text-faint)]">Herdado</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(field)}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-soft-strong)] hover:text-[var(--text-primary)]"
                              title="Editar"
                              aria-label={`Editar campo ${field.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => void handleUnassign(field)}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Desvincular"
                              aria-label={`Desvincular campo ${field.name}`}
                            >
                              <Unlink className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col overflow-hidden rounded-lg border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--bg-soft)] px-4 py-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Especificos disponiveis</span>
                  <span className="rounded-full bg-[var(--bg-soft-strong)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                    {unassignedFields.length}
                  </span>
                </div>

                {unassignedFields.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center py-10 text-center">
                    <p className="text-xs text-[var(--text-faint)]">
                      {projectSpecificFields.length === 0
                        ? "Nenhum campo especifico criado ainda."
                        : "Todos os campos especificos ja estao vinculados."}
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-[var(--border-subtle)]">
                    {unassignedFields.map((field) => (
                      <li
                        key={field.id}
                        className="flex items-center gap-3 bg-[var(--bg-panel)] px-4 py-2.5 transition-colors hover:bg-[var(--bg-soft)]"
                      >
                        <span className="text-[var(--text-muted)]"><FieldTypeIcon type={field.type} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-[var(--text-primary)]">{field.name}</span>
                          <span className="text-xs text-[var(--text-faint)]">{typeLabel[field.type] ?? field.type}</span>
                        </span>
                        <button
                          onClick={() => void handleAssign(field.id)}
                          className="flex h-8 shrink-0 items-center gap-1 rounded-md border border-[var(--border-subtle)] px-2 text-xs font-medium text-[var(--text-muted)] transition-all hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:text-white"
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
          )}
        </div>
      )}

      <CustomFieldFormModal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setFieldToEdit(null); }}
        onSave={fieldToEdit ? handleUpdate : handleCreate}
        initialData={fieldToEdit}
        scope={formScope}
      />
      <CustomFieldFormModal
        isOpen={showCreateAndLinkModal}
        onClose={() => setShowCreateAndLinkModal(false)}
        onSave={handleCreateAndLink}
        scope="project"
      />
    </div>
  );
};

export default CustomFieldsManager;
