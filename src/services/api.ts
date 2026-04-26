import axios, { AxiosError } from "axios";
import type {
  CreateCustomFieldDefinitionDto,
  CreateCustomFieldValueDto,
  CreateProjectDto,
  CreateTaskDto,
  GetCustomFieldDefinitionDto,
  GetProjectsDto,
  GetTasksDto,
  GetTasksWithCustomFieldsDto,
  HealthResponseDto,
  ResponseModelDto,
} from "../types/apiTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5030/api';

let auth0Client: any | null = null;

export const setAuth0Client = (client: any) => {
  auth0Client = client;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});


// Retorna config do axios ou rejeita a promise
// Se auth0Client existe → adiciona Authorization header
// Se não existe → retorna config como está
api.interceptors.request.use(async (config) => {
    if (auth0Client) {
      try {
        const token = await auth0Client.getAccessTokenSilently({
          audience: import.meta.env.VITE_API_AUTH0_AUDIENCE, // defina no .env
        });
        config.headers = config.headers || {};
        // Axios v1 headers podem ser um objeto especial; usar indexer:
        (config.headers as any).Authorization = `Bearer ${token}`;
      } catch (error: any) {
        console.error('Failed to get access token:', error);
        const errorMessage = error?.message || error?.error_description || '';
        if (errorMessage.includes('Missing Refresh Token') || errorMessage.includes('Login required')) {
          console.warn('Authentication issue detected. Forcing logout.');
          auth0Client?.logout?.({ logoutParams: { returnTo: window.location.origin } });
        }
        return Promise.reject(error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Se a resposta for 401 mostra no console o erro e faz logout do usuário
api.interceptors.response.use(
  (response) => {
    if (response.data.status === false) {
      console.error('API returned false response:', response);
      throw new Error("API returned false");
    }
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error('Authentication error:', error);
      if (auth0Client) {
        auth0Client.logout({ logoutParams: { returnTo: window.location.origin } });
      }
    }
    if (error.response && (error.response.status < 200 || error.response.status > 299)) {
      console.error('API requisition error:', error);
    }
    return Promise.reject(error);
  },
);

export const healthApi = {
  getHealth: async () => {
    const response = await api.get<HealthResponseDto>('/health');
    return response.data;
  }
}

export const customFieldDefinitionsApi = {
  create: async (data: CreateCustomFieldDefinitionDto) => {
    const response = await api.post<ResponseModelDto<unknown>>('/CustomFieldDefinitions', data);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get<ResponseModelDto<GetCustomFieldDefinitionDto[]>>('/CustomFieldDefinitions');
    return response.data;
  },
  update: async (customFieldDefinitionId: string, data: CreateCustomFieldDefinitionDto) => {
    const response = await api.put<ResponseModelDto<unknown>>(`/CustomFieldDefinitions/${customFieldDefinitionId}`, data);
    return response.data;
  },
  remove: async (customFieldDefinitionId: string) => {
    const response = await api.delete<ResponseModelDto<unknown>>(`/CustomFieldDefinitions/${customFieldDefinitionId}`);
    return response.data;
  },
};

export const customFieldValuesApi = {
  create: async (data: CreateCustomFieldValueDto, projectId: string) => {
    const response = await api.post<ResponseModelDto<unknown>>(
      `/CustomFieldValues/${projectId}`,
      data,
    );
    return response.data;
  },
  update: async (data: CreateCustomFieldValueDto, projectId: string) => {
    const response = await api.put<ResponseModelDto<unknown>>(
      `/CustomFieldValues/${projectId}`,
      data,
    );
    return response.data;
  },
  remove: async (customFieldValueId: string, projectId?: string) => {
    const response = await api.delete<ResponseModelDto<unknown>>(`/CustomFieldValues/${customFieldValueId}`, {
      params: { projectId },
    });
    return response.data;
  },
};

export const projectsApi = {
  create: async (data: CreateProjectDto) => {
    const response = await api.post<ResponseModelDto<unknown>>('/Projects', data);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get<ResponseModelDto<GetProjectsDto[]>>('/Projects');
    return response.data;
  },
  update: async (projectId: string, data: CreateProjectDto) => {
    const response = await api.put<ResponseModelDto<unknown>>(`/Projects/${projectId}`, data);
    return response.data;
  },
  remove: async (projectId: string) => {
    const response = await api.delete<ResponseModelDto<unknown>>(`/Projects/${projectId}`);
    return response.data;
  },
};

export const projectsCustomFieldDefinitionsApi = {
  assign: async (projectId?: string, customFieldDefinitionId?: string) => {
    const response = await api.post<ResponseModelDto<unknown>>(
      '/ProjectsCustomFieldDefinitions/assign',
      undefined,
      { params: { projectId, customFieldDefinitionId } }
    );
    return response.data;
  },
  getByProject: async (projectId: string) => {
    const response = await api.get<ResponseModelDto<GetCustomFieldDefinitionDto[]>>(
      `/ProjectsCustomFieldDefinitions/project/${projectId}/custom-field-definitions`
    );
    return response.data;
  },
  unassign: async (projectId?: string, customFieldDefinitionId?: string) => {
    const response = await api.delete<ResponseModelDto<unknown>>(
      '/ProjectsCustomFieldDefinitions/unassign',
      { params: { projectId, customFieldDefinitionId } }
    );
    return response.data;
  },
};

export const projectsTasksApi = {
  assign: async (projectId?: string, taskId?: string) => {
    const response = await api.post<ResponseModelDto<unknown>>(
      '/ProjectsTasks/assign',
      undefined,
      { params: { projectId, taskId } }
    );
    return response.data;
  },
  getByProject: async (projectId: string) => {
    const response = await api.get<ResponseModelDto<GetTasksDto[]>>(
      `/ProjectsTasks/project/${projectId}/tasks`
    );
    return response.data;
  },
  getWithCustomFieldsByProject: async (projectId: string) => {
    const response = await api.get<ResponseModelDto<GetTasksWithCustomFieldsDto[]>>(
      `/ProjectsTasks/project/${projectId}/tasks-with-custom-fields`
    );
    return response.data;
  },
  unassign: async (projectId?: string, taskId?: string) => {
    const response = await api.delete<ResponseModelDto<unknown>>(
      '/ProjectsTasks/unassign',
      { params: { projectId, taskId } }
    );
    return response.data;
  },
};

export const tasksApi = {
  create: async (data: CreateTaskDto) => {
    const response = await api.post<ResponseModelDto<GetTasksDto>>('/Tasks', data);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get<ResponseModelDto<GetTasksDto[]>>('/Tasks');
    return response.data;
  },
  update: async (taskId: string, data: CreateTaskDto) => {
    const response = await api.put<ResponseModelDto<unknown>>(`/Tasks/${taskId}`, data);
    return response.data;
  },
  remove: async (taskId: string) => {
    const response = await api.delete<ResponseModelDto<unknown>>(`/Tasks/${taskId}`);
    return response.data;
  },
};

export default api;
