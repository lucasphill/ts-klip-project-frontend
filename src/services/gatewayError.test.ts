import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_ERROR_MESSAGE,
  GatewayError,
  errorMessage,
  installGatewayInterceptor,
} from "./gatewayError";

type Respond = (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>;

const response = (
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown,
): AxiosResponse => ({ data, status, statusText: String(status), headers: {}, config });

const httpError = (config: InternalAxiosRequestConfig, status: number, data: unknown) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_REQUEST,
    config,
    {},
    response(config, status, data),
  );

const gatewayFor = (respond: Respond, onAuthFailure = vi.fn()) => {
  const instance = axios.create({ adapter: (config) => respond(config) });
  installGatewayInterceptor(instance, { onAuthFailure });
  return { instance, onAuthFailure };
};

const rejectionOf = async (promise: Promise<unknown>): Promise<GatewayError> => {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(GatewayError);
    return error as GatewayError;
  }
  throw new Error("expected the request to fail");
};

describe("gateway interceptor", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("passes successful envelopes through untouched", async () => {
    const { instance } = gatewayFor(async (config) => response(config, 200, { status: true, data: [1] }));

    const res = await instance.get("/tasks");

    expect(res.data).toEqual({ status: true, data: [1] });
  });

  it("turns an HTTP error into a Portuguese GatewayError and logs the server message", async () => {
    const { instance, onAuthFailure } = gatewayFor(async (config) => {
      throw httpError(config, 400, { status: false, message: "Task not found", data: null });
    });

    const error = await rejectionOf(instance.get("/tasks/1"));

    expect(error.status).toBe(400);
    expect(error.isAuthFailure).toBe(false);
    expect(error.serverMessage).toBe("Task not found");
    expect(error.message).toBe(DEFAULT_ERROR_MESSAGE);
    expect(error.message).not.toMatch(/Request failed|Task not found/);
    expect(onAuthFailure).not.toHaveBeenCalled();
    expect(consoleError.mock.calls.flat()).toContain("Task not found");
  });

  it("turns a status:false envelope on a 2xx response into a GatewayError", async () => {
    const { instance } = gatewayFor(async (config) =>
      response(config, 200, { status: false, message: "Project not found.", data: null }),
    );

    const error = await rejectionOf(instance.post("/tasks", {}));

    expect(error.status).toBe(200);
    expect(error.serverMessage).toBe("Project not found.");
    expect(error.message).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it("marks 401 as an auth failure and notifies the caller", async () => {
    const { instance, onAuthFailure } = gatewayFor(async (config) => {
      throw httpError(config, 401, "Não foi possível encontrar o identificador do usuário no token.");
    });

    const error = await rejectionOf(instance.get("/tasks"));

    expect(error.status).toBe(401);
    expect(error.isAuthFailure).toBe(true);
    expect(onAuthFailure).toHaveBeenCalledWith(error);
  });

  it("turns a network failure into a GatewayError without status", async () => {
    const { instance } = gatewayFor(async (config) => {
      throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config);
    });

    const error = await rejectionOf(instance.get("/tasks"));

    expect(error.status).toBeNull();
    expect(error.isAuthFailure).toBe(false);
    expect(error.message).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it("keeps a GatewayError raised before the request (token failure) as is", async () => {
    const instance = axios.create({ adapter: async (config) => response(config, 200, {}) });
    const tokenFailure = new GatewayError({ status: null, isAuthFailure: true, serverMessage: "Login required" });
    instance.interceptors.request.use(() => Promise.reject(tokenFailure));
    installGatewayInterceptor(instance);

    const error = await rejectionOf(instance.get("/tasks"));

    expect(error).toBe(tokenFailure);
    expect(error.isAuthFailure).toBe(true);
  });
});

describe("errorMessage", () => {
  it("always returns the operation's Portuguese text for gateway errors", () => {
    const error = new GatewayError({ status: 400, serverMessage: "Task not found" });

    expect(errorMessage(error, "Erro ao excluir tarefa")).toBe("Erro ao excluir tarefa");
  });

  it("never returns the text of a non-gateway error, and logs it", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const bug = new Error("Cannot read properties of undefined");

    expect(errorMessage(bug, "Erro ao criar tarefa")).toBe("Erro ao criar tarefa");
    expect(consoleError).toHaveBeenCalledWith(bug);

    consoleError.mockRestore();
  });

  it("falls back to a generic Portuguese text", () => {
    expect(errorMessage(new GatewayError({ status: 500 }))).toBe(DEFAULT_ERROR_MESSAGE);
  });
});
