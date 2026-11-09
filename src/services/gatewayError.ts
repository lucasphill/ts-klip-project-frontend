import { isAxiosError, type AxiosInstance, type AxiosResponse } from "axios";

/** Shown when a caller does not name its operation. Never shown: axios or server text. */
export const DEFAULT_ERROR_MESSAGE = "Não foi possível concluir a operação. Tente novamente.";

/**
 * The single error type every API failure becomes: HTTP error status,
 * `status: false` in the response envelope, network failure or timeout.
 *
 * `message` is always Portuguese and user-facing. The server's own text
 * (English, technical) is kept in `serverMessage` for logging only.
 */
export class GatewayError extends Error {
  /** HTTP status, or null when no response arrived (network failure, timeout, token failure). */
  readonly status: number | null;
  readonly isAuthFailure: boolean;
  readonly serverMessage: string | null;

  constructor(options: {
    status: number | null;
    serverMessage?: string | null;
    isAuthFailure?: boolean;
    cause?: unknown;
  }) {
    super(DEFAULT_ERROR_MESSAGE, { cause: options.cause });
    this.name = "GatewayError";
    this.status = options.status;
    this.serverMessage = options.serverMessage ?? null;
    this.isAuthFailure = options.isAuthFailure ?? options.status === 401;
  }
}

const readServerMessage = (data: unknown): string | null => {
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const message = record.message ?? record.Message ?? record.title;
    if (typeof message === "string" && message.trim()) return message;
  }
  return null;
};

/** Converts anything a request can reject with into a GatewayError. */
export const toGatewayError = (error: unknown): GatewayError => {
  if (error instanceof GatewayError) return error;

  if (isAxiosError(error)) {
    const status = error.response?.status ?? null;
    return new GatewayError({
      status,
      serverMessage: readServerMessage(error.response?.data) ?? error.message ?? null,
      cause: error,
    });
  }

  return new GatewayError({
    status: null,
    serverMessage: error instanceof Error ? error.message : String(error),
    cause: error,
  });
};

const logGatewayError = (error: GatewayError) => {
  console.error(
    `[api] falha${error.status !== null ? ` (HTTP ${error.status})` : ""}:`,
    error.serverMessage ?? "(sem mensagem do servidor)",
    error.cause ?? "",
  );
};

/**
 * Installs the shared response interceptor: every failure is rejected as a
 * GatewayError and its server message goes to the console.
 */
export const installGatewayInterceptor = (
  instance: AxiosInstance,
  options: { onAuthFailure?: (error: GatewayError) => void } = {},
) => {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const data = response.data as { status?: unknown } | undefined;
      if (data && typeof data === "object" && data.status === false) {
        const error = new GatewayError({ status: response.status, serverMessage: readServerMessage(data) });
        logGatewayError(error);
        throw error;
      }
      return response;
    },
    (rawError: unknown) => {
      const error = toGatewayError(rawError);
      logGatewayError(error);
      if (error.status === 401) options.onAuthFailure?.(error);
      return Promise.reject(error);
    },
  );
};

/**
 * Text for an error toast: always the operation's own Portuguese text, never
 * axios or server text. Errors that did not come through the gateway (bugs)
 * are logged, since the gateway already logged its own.
 */
export const errorMessage = (error: unknown, operationMessage: string = DEFAULT_ERROR_MESSAGE): string => {
  if (!(error instanceof GatewayError)) {
    console.error(error);
  }
  return operationMessage;
};
