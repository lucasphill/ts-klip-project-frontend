import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { httpGateway } from "../gateway/httpGateway";
import type { Task } from "../gateway/klipGateway";
import { createTaskOperations, tasksQueryOptions, type Notifier, type TaskOperations } from "./taskOperations";

const toastNotifier: Notifier = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
};

const EMPTY: Task[] = [];

/**
 * React handle on Task operations: the shared task list (every view filters it)
 * plus stable commands. `isLoading` is true only on the first load, so the
 * table never turns into a spinner on revalidation.
 */
export const useTaskOperations = (): TaskOperations & {
  tasks: Task[];
  isLoading: boolean;
} => {
  const queryClient = useQueryClient();
  const query = useQuery(tasksQueryOptions(httpGateway));
  const commands = useMemo(
    () => createTaskOperations({ gateway: httpGateway, queryClient, notify: toastNotifier }),
    [queryClient],
  );

  return {
    ...commands,
    tasks: query.data ?? EMPTY,
    isLoading: query.isPending,
  };
};
