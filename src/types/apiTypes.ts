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
  type: 'text' | 'number' | 'date' | 'boolean' | 'enum';
  options?: string[]; // Apenas para type 'enum'
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
  createdAt: string;
}

export interface GetTasksWithCustomFieldsDto extends GetTasksDto  {
  customFields: { [key: string]: any }; // Chave-valor para campos personalizados 
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
  name: string;
  options?: string[]; // Apenas para type 'enum'
  type: 'text' | 'number' | 'date' | 'boolean' | 'enum';
}
//#endregion