import { QueryClient } from "@tanstack/react-query";
import { GatewayError } from "../services/gatewayError";

/** The app's single QueryClient. Auth failures are never retried (the gateway logs the user out). */
export const createAppQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        retry: (failureCount, error) =>
          !(error instanceof GatewayError && error.isAuthFailure) && failureCount < 1,
      },
    },
  });
