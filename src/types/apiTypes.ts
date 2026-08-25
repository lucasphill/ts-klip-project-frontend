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
  parentTaskId?: string | null;
}

export interface CreateProjectGroupDto {
  name: string;
  color?: string;
  icon?: string;
  orderIndex?: number;
}

export interface ReorderProjectGroupsDto {
  groupIdsInOrder: string[];
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
  groupId?: string | null;
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

export interface CreateApiKeyDto {
  name: string;
}
//#endregion

//#region Get Models
export interface GetTasksDto {
  dueDate?: string;
  id: string;
  isCompleted?: boolean;
  notes?: string;
  parentTaskId?: string | null;
  parent_task_id?: string | null;
  title: string;
  createdAt?: string;
  googleCalendarEventId?: string | null;
  google_calendar_event_id?: string | null;
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
  groupId?: string | null;
  group_id?: string | null;
  isArchived?: boolean;
  is_archived?: boolean;
  archivedAt?: string | null;
  archived_at?: string | null;
}

export interface GetProjectGroupDto {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  orderIndex: number;
  order_index?: number;
  createdAt: string;
  created_at?: string;
  projects: GetProjectsDto[];
}

export interface GetCustomFieldDefinitionDto {
  createdAt: string;
  id: string;
  isUniversal?: boolean;
  name: string;
  options?: string | string[] | null;
  type: CustomFieldType;
}

export interface GetApiKeyDto {
  id: string;
  name: string;
  keyValue: string;
  createdAt: string;
}

export interface GoogleCalendarStatusDto {
  isConnected: boolean;
  accountEmail: string | null;
  connectedAtUtc: string | null;
}

export interface GoogleAuthUrlResponseDto {
  authUrl: string;
}

export interface DeleteCompletedTasksResponseDto {
  deletedCount: number;
  deletedTaskIds: string[];
}
//#endregion

