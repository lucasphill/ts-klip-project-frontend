import type { AxiosInstance } from "axios";
import { api } from "../services/api";
import type {
  CustomValue,
  CustomValueInput,
  DeleteMode,
  KlipGateway,
  ProjectCustomValues,
  Task,
} from "./klipGateway";
import { toTaskBody } from "./klipGateway";

/** Server envelope. Failures never reach here: the gateway interceptor rejects them. */
interface Envelope<T> {
  data: T;
  message: string;
  status: boolean;
}

interface ServerTask {
  id: string;
  title: string;
  notes?: string | null;
  dueDate?: string | null;
  isCompleted?: boolean;
  parentTaskId?: string | null;
  projectIds?: string[] | null;
  createdAt?: string | null;
  googleCalendarEventId?: string | null;
  customFields?: Record<string, string> | null;
}

interface ServerCustomValue {
  id: string;
  taskId: string;
  customFieldId: string;
  valueText?: string | null;
  valueNumber?: number | null;
  selectedOptionId?: string | null;
}

const toTask = (server: ServerTask): Task => ({
  id: server.id,
  title: server.title,
  notes: server.notes ?? null,
  dueDate: server.dueDate ?? null,
  isCompleted: server.isCompleted ?? false,
  parentTaskId: server.parentTaskId ?? null,
  projectIds: server.projectIds ?? [],
  createdAt: server.createdAt ?? null,
  googleCalendarEventId: server.googleCalendarEventId ?? null,
  customFields: { ...(server.customFields ?? {}) },
});

const toCustomValue = (server: ServerCustomValue): CustomValue => ({
  id: server.id,
  taskId: server.taskId,
  customFieldId: server.customFieldId,
  valueText: server.valueText ?? null,
  valueNumber: server.valueNumber ?? null,
  selectedOptionId: server.selectedOptionId ?? null,
});

const toCustomValueBody = (input: CustomValueInput) => ({
  taskId: input.taskId,
  customFieldId: input.customFieldId,
  valueText: input.valueText ?? null,
  valueNumber: input.valueNumber ?? null,
  selectedOptionId: input.selectedOptionId ?? null,
});

const projectParams = (projectId?: string) => (projectId ? { params: { projectId } } : {});

export const createHttpGateway = (http: AxiosInstance): KlipGateway => {
  const unwrap = async <T>(request: Promise<{ data: Envelope<T> }>): Promise<T> => (await request).data.data;

  return {
    async listTasks() {
      // The custom-fields list lacks createdAt/googleCalendarEventId; /Tasks lacks
      // customFields. Both carry projectIds. Load in parallel and merge by id.
      const [withFields, plain] = await Promise.all([
        unwrap(http.get<Envelope<ServerTask[]>>("/Tasks/with-universal-custom-fields")),
        unwrap(http.get<Envelope<ServerTask[]>>("/Tasks")),
      ]);
      const plainById = new Map((plain ?? []).map((task) => [task.id, task]));
      return (withFields ?? []).map((task) => {
        const extra = plainById.get(task.id);
        return toTask({
          ...task,
          createdAt: extra?.createdAt ?? task.createdAt,
          googleCalendarEventId: extra?.googleCalendarEventId ?? task.googleCalendarEventId,
        });
      });
    },

    async createTask(input) {
      return toTask(await unwrap(http.post<Envelope<ServerTask>>("/Tasks", toTaskBody(input))));
    },

    async updateTask(taskId, input) {
      return toTask(await unwrap(http.put<Envelope<ServerTask>>(`/Tasks/${taskId}`, toTaskBody(input))));
    },

    async deleteTask(taskId, mode: DeleteMode) {
      const data = await unwrap(
        http.delete<Envelope<{ deletedTaskIds?: string[]; detachedTaskIds?: string[] }>>(`/Tasks/${taskId}`, {
          params: { cascade: mode === "cascade" },
        }),
      );
      return {
        deletedTaskIds: data?.deletedTaskIds ?? [taskId],
        detachedTaskIds: data?.detachedTaskIds ?? [],
      };
    },

    async deleteCompleted(projectId) {
      const data = await unwrap(
        http.delete<Envelope<{ deletedTaskIds?: string[] }>>("/Tasks/completed", projectParams(projectId)),
      );
      return { deletedTaskIds: data?.deletedTaskIds ?? [] };
    },

    async createCustomValue(input, projectId) {
      return toCustomValue(
        await unwrap(
          http.post<Envelope<ServerCustomValue>>("/CustomFieldValues", toCustomValueBody(input), projectParams(projectId)),
        ),
      );
    },

    async updateCustomValue(input, projectId) {
      return toCustomValue(
        await unwrap(
          http.put<Envelope<ServerCustomValue>>("/CustomFieldValues", toCustomValueBody(input), projectParams(projectId)),
        ),
      );
    },

    async deleteCustomValue(taskId, customFieldId, projectId) {
      await http.delete<Envelope<boolean>>("/CustomFieldValues", {
        params: { taskId, customFieldId, ...(projectId ? { projectId } : {}) },
      });
    },

    async listProjectCustomValues(projectId) {
      const tasks = await unwrap(
        http.get<Envelope<ServerTask[]>>(`/ProjectsTasks/project/${projectId}/tasks-with-custom-fields`),
      );
      const values: ProjectCustomValues = {};
      for (const task of tasks ?? []) {
        values[task.id] = { ...(task.customFields ?? {}) };
      }
      return values;
    },
  };
};

export const httpGateway: KlipGateway = createHttpGateway(api);
