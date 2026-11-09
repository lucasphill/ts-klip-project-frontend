import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { GatewayError, installGatewayInterceptor } from "../services/gatewayError";
import { createHttpGateway } from "./httpGateway";
import { F1, P1, P2, T1, T2, recorded } from "./__fixtures__/recordedResponses";

interface Route {
  method: string;
  url: string;
  status?: number;
  body: unknown;
}

/** An axios instance answering from recorded responses, recording each request. */
const serverWith = (routes: Route[], onAuthFailure = vi.fn()) => {
  const requests: InternalAxiosRequestConfig[] = [];
  const instance = axios.create({
    adapter: async (config) => {
      requests.push(config);
      const route = routes.find((r) => r.method === config.method && r.url === config.url);
      if (!route) throw new Error(`no recorded response for ${config.method} ${config.url}`);
      const response: AxiosResponse = {
        data: route.body,
        status: route.status ?? 200,
        statusText: "",
        headers: {},
        config,
      };
      if (response.status >= 400) {
        throw new AxiosError("Request failed", AxiosError.ERR_BAD_REQUEST, config, {}, response);
      }
      return response;
    },
  });
  installGatewayInterceptor(instance, { onAuthFailure });
  return { gateway: createHttpGateway(instance), requests, onAuthFailure };
};

const bodyOf = (config: InternalAxiosRequestConfig) => JSON.parse(String(config.data));

describe("httpGateway", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => consoleError.mockRestore());

  it("lists unwrapped canonical tasks, merging both task endpoints", async () => {
    const { gateway } = serverWith([
      { method: "get", url: "/Tasks/with-universal-custom-fields", body: recorded.tasksWithUniversalCustomFields },
      { method: "get", url: "/Tasks", body: recorded.tasks },
    ]);

    const tasks = await gateway.listTasks();

    expect(tasks).toEqual([
      {
        id: T1,
        title: "Comprar café",
        notes: null,
        dueDate: "2026-11-10T00:00:00",
        isCompleted: false,
        parentTaskId: null,
        projectIds: [P1, P2],
        createdAt: "2026-11-01T09:00:00",
        googleCalendarEventId: "gcal-123",
        customFields: { Prioridade: "Alta" },
      },
      {
        id: T2,
        title: "Moer grãos",
        notes: "**fino**",
        dueDate: null,
        isCompleted: true,
        parentTaskId: T1,
        projectIds: [],
        createdAt: "2026-11-02T09:00:00",
        googleCalendarEventId: null,
        customFields: {},
      },
    ]);
  });

  it("creates a task with projectIds and returns the created entity", async () => {
    const { gateway, requests } = serverWith([{ method: "post", url: "/Tasks", body: recorded.createdTask }]);

    const task = await gateway.createTask({ title: "  Comprar café ", dueDate: "2026-11-10", projectIds: [P1, P1] });

    expect(bodyOf(requests[0])).toEqual({
      title: "Comprar café",
      notes: null,
      dueDate: "2026-11-10T00:00:00",
      isCompleted: false,
      parentTaskId: null,
      projectIds: [P1],
    });
    expect(task.id).toBe(T1);
    expect(task.projectIds).toEqual([P1]);
    expect(task.googleCalendarEventId).toBe("gcal-123");
  });

  it("always sends the full task on update, null for cleared fields, and omits projectIds when not given", async () => {
    const { gateway, requests } = serverWith([{ method: "put", url: `/Tasks/${T1}`, body: recorded.createdTask }]);

    await gateway.updateTask(T1, { title: "Comprar café", notes: "", dueDate: "", isCompleted: true, parentTaskId: "" });

    expect(bodyOf(requests[0])).toEqual({
      title: "Comprar café",
      notes: null,
      dueDate: null,
      isCompleted: true,
      parentTaskId: null,
    });
  });

  it("deletes with the cascade flag and returns the affected ids", async () => {
    const { gateway, requests } = serverWith([{ method: "delete", url: `/Tasks/${T1}`, body: recorded.deleteCascade }]);

    const result = await gateway.deleteTask(T1, "cascade");

    expect(requests[0].params).toEqual({ cascade: true });
    expect(result).toEqual({ deletedTaskIds: [T1, T2], detachedTaskIds: [] });
  });

  it("deletes completed tasks within a project", async () => {
    const { gateway, requests } = serverWith([
      { method: "delete", url: "/Tasks/completed", body: recorded.deleteCompleted },
    ]);

    const result = await gateway.deleteCompleted(P1);

    expect(requests[0].params).toEqual({ projectId: P1 });
    expect(result).toEqual({ deletedTaskIds: [T2] });
  });

  it("creates a custom value and deletes one by task and field", async () => {
    const { gateway, requests } = serverWith([
      { method: "post", url: "/CustomFieldValues", body: recorded.createdCustomValue },
      { method: "delete", url: "/CustomFieldValues", body: recorded.deleteCustomValueNothing },
    ]);

    const value = await gateway.createCustomValue({ taskId: T1, customFieldId: F1, valueText: "Alta" }, P1);
    await gateway.deleteCustomValue(T1, F1);

    expect(requests[0].params).toEqual({ projectId: P1 });
    expect(value).toEqual({ id: "v-1", taskId: T1, customFieldId: F1, valueText: "Alta", valueNumber: null, selectedOptionId: null });
    expect(requests[1].params).toEqual({ taskId: T1, customFieldId: F1 });
  });

  it("lists a project's custom values by task", async () => {
    const { gateway } = serverWith([
      {
        method: "get",
        url: `/ProjectsTasks/project/${P1}/tasks-with-custom-fields`,
        body: recorded.projectTasksWithCustomFields,
      },
    ]);

    expect(await gateway.listProjectCustomValues(P1)).toEqual({ [T1]: { Prioridade: "Alta", Orçamento: "1500" } });
  });

  it("maps a status:false envelope to GatewayError", async () => {
    const { gateway } = serverWith([
      { method: "put", url: `/Tasks/${T1}`, status: 400, body: recorded.taskNotFound },
    ]);

    const error = await gateway
      .updateTask(T1, { title: "x", notes: null, dueDate: null, isCompleted: false, parentTaskId: null })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(GatewayError);
    expect((error as GatewayError).status).toBe(400);
    expect((error as GatewayError).serverMessage).toBe("Task not found");
  });

  it("maps 401 to an auth failure", async () => {
    const { gateway, onAuthFailure } = serverWith([
      { method: "get", url: "/Tasks/with-universal-custom-fields", status: 401, body: recorded.unauthorized },
      { method: "get", url: "/Tasks", status: 401, body: recorded.unauthorized },
    ]);

    const error = await gateway.listTasks().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(GatewayError);
    expect((error as GatewayError).isAuthFailure).toBe(true);
    expect(onAuthFailure).toHaveBeenCalled();
  });
});
