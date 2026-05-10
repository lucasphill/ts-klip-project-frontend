import type {
  CreateCustomFieldValueDto,
  CustomFieldValue,
  GetCustomFieldDefinitionDto,
} from "../types/apiTypes";

type TaskWithCustomFields = {
  id: string;
  customFields?: Record<string, CustomFieldValue>;
};

export const normalizeFieldOptions = (options?: string | string[] | null): string[] => {
  if (Array.isArray(options)) {
    return options.map((option) => option.trim()).filter(Boolean);
  }

  return String(options ?? "")
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean);
};

export const normalizeFieldKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

export const normalizeCustomFieldDefinition = (
  field: GetCustomFieldDefinitionDto
): GetCustomFieldDefinitionDto => ({
  ...field,
  options: normalizeFieldOptions(field.options),
});

export const getCustomFieldValueByDefinition = (
  task: TaskWithCustomFields | undefined,
  field: GetCustomFieldDefinitionDto | undefined
): CustomFieldValue => {
  if (!task || !field) return "";

  if (task.customFields?.[field.id] !== undefined) {
    return task.customFields[field.id];
  }

  if (task.customFields?.[field.name] !== undefined) {
    return task.customFields[field.name];
  }

  if (task.customFields) {
    const normalizedTargetKey = normalizeFieldKey(field.name);
    const matchingEntry = Object.entries(task.customFields).find(
      ([key]) => normalizeFieldKey(key) === normalizedTargetKey
    );

    if (matchingEntry) {
      return matchingEntry[1];
    }
  }

  return "";
};

export const buildCustomFieldValuePayload = (
  taskId: string,
  customFieldId: string,
  fieldType: GetCustomFieldDefinitionDto["type"],
  value: CustomFieldValue
): CreateCustomFieldValueDto => {
  const payload: CreateCustomFieldValueDto = {
    taskId,
    customFieldId,
  };

  if (fieldType === "number") {
    payload.valueNumber =
      value === undefined || value === null || value === "" ? undefined : Number(value);
    return payload;
  }

  payload.valueText = value === undefined || value === null ? "" : String(value);
  return payload;
};
