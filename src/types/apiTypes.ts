//#region Response Model
export interface ResponseModelDto<T> {
  data: T;
  message: string;
  status: boolean;
  timestamp: string;
}

export interface HealthResponseDto {
  status: string;
  version: string;
}
//#endregion

export type CustomFieldType = 'text' | 'number' | 'date' | 'boolean' | 'enum';
export type CustomFieldValue = string | number | boolean | null | undefined;

//#region Create Models
export interface CreateTaskDto{
  title: string;
  dueDate?: string;
  isCompleted?: boolean;
  notes?: string;
  parentTaskId?: string;
}

export interface CreateProjectDto{
  name: string;
  description?: string;
  color?: string;
}

export interface CreateCustomFieldDefinitionDto {
  name: string;
  type: CustomFieldType;
  isUniversal?: boolean;
  options?: string | string[]; // API aceita string; frontend pode manipular como array
}

export interface CreateCustomFieldValueDto {
  taskId: string;
  customFieldId: string;
  valueText?: string;
  valueNumber?: number;
  selectedOptionId?: string;
}
//#endregion

//#region Get Models
export interface GetTasksDto {
  dueDate?: string;
  id: string;
  isCompleted?: boolean;
  notes?: string;
  parentTaskId?: string;
  title: string;
  createdAt?: string;
}

export interface GetTasksWithCustomFieldsDto extends GetTasksDto  {
  customFields?: Record<string, CustomFieldValue>;
}

export interface GetProjectsDto {
  color?: string;
  createdAt: string;
  description?: string;
  id: string;
  name: string;
}

export interface GetCustomFieldDefinitionDto {
  createdAt: string;
  id: string;
  isUniversal?: boolean;
  name: string;
  options?: string | string[] | null;
  type: CustomFieldType;
}
//#endregion
