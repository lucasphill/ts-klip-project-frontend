import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "../gateway/klipGateway";
import { createMemoryGateway, type MemorySeed } from "../gateway/memoryGateway";
import {
  TASKS_QUERY_KEY,
  createTaskOperations,
  projectCustomValuesQueryKey,
  tasksQueryOptions,
} from "./taskOperations";

const setup = async (seed: MemorySeed) => {
  const gateway = createMemoryGateway(seed);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const notify = { success: vi.fn(), error: vi.fn() };
  const ops = createTaskOperations({ gateway, queryClient, notify });
  await queryClient.fetchQuery(tasksQueryOptions(gateway));
  const cached = () => queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY) ?? [];
  const cachedTask = (id: string) => cached().find((t) => t.id === id);
  return { gateway, queryClient, notify, ops, cached, cachedTask };
};

describe("Task operations", () => {
  it("detach delete leaves the direct subtasks as top-level tasks", async () => {
    const { ops, cached, cachedTask } = await setup({
      tasks: [
        { id: "parent", title: "Parent" },
        { id: "child", title: "Child", parentTaskId: "parent" },
        { id: "grandchild", title: "Grandchild", parentTaskId: "child" },
      ],
    });

    const result = await ops.deleteTask("parent", "detach");

    expect(result.ok).toBe(true);
    expect(cached().map((t) => t.id).sort()).toEqual(["child", "grandchild"]);
    expect(cachedTask("child")?.parentTaskId).toBeNull();
    expect(cachedTask("grandchild")?.parentTaskId).toBe("child");
  });

  it("cascade delete removes the whole subtree from the cache", async () => {
    const { ops, cached, notify } = await setup({
      tasks: [
        { id: "parent", title: "Parent" },
        { id: "child", title: "Child", parentTaskId: "parent" },
        { id: "grandchild", title: "Grandchild", parentTaskId: "child" },
        { id: "other", title: "Other" },
      ],
    });

    await ops.deleteTask("parent", "cascade");

    expect(cached().map((t) => t.id)).toEqual(["other"]);
    expect(notify.success).toHaveBeenCalledWith("Tarefa e subtarefas excluídas");
  });

  it("a failed toggle rolls back and resolves to { ok: false } with a Portuguese toast", async () => {
    const { ops, gateway, cachedTask, notify } = await setup({ tasks: [{ id: "t", title: "T" }] });
    gateway.failNext();

    const pending = ops.toggle("t");
    await Promise.resolve();
    const result = await pending;

    expect(result.ok).toBe(false);
    expect(cachedTask("t")?.isCompleted).toBe(false);
    expect(notify.error).toHaveBeenCalledWith("Erro ao atualizar status");
  });

  it("toggle applies optimistically before the server answers", async () => {
    const { ops, cachedTask } = await setup({ tasks: [{ id: "t", title: "T" }] });

    const pending = ops.toggle("t");
    await vi.waitFor(() => expect(cachedTask("t")?.isCompleted).toBe(true));
    expect((await pending).ok).toBe(true);
    expect(cachedTask("t")?.isCompleted).toBe(true);
  });

  it("create with projects stores the server's task, already linked", async () => {
    const { ops, cachedTask } = await setup({ projects: [{ id: "p1" }, { id: "p2" }] });

    const result = await ops.create({ title: "Nova", dueDate: "2026-11-10", projectIds: ["p1", "p2"] });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const cached = cachedTask(result.task.id);
    expect(cached?.projectIds).toEqual(["p1", "p2"]);
    expect(cached?.googleCalendarEventId).not.toBeNull();
  });

  it("create waits for the server: a failure adds nothing", async () => {
    const { ops, gateway, cached, notify } = await setup({});
    gateway.failNext();

    const result = await ops.create({ title: "Nova" });

    expect(result.ok).toBe(false);
    expect(cached()).toEqual([]);
    expect(notify.error).toHaveBeenCalledWith("Erro ao criar tarefa");
  });

  it("clearing a custom value deletes the record instead of writing an empty string", async () => {
    const { ops, gateway, cachedTask } = await setup({
      fields: [{ id: "f", name: "Prioridade", isUniversal: true }],
      tasks: [{ id: "t", title: "T" }],
      values: [{ taskId: "t", customFieldId: "f", valueText: "Alta", valueNumber: null, selectedOptionId: null }],
    });
    const field = { id: "f", name: "Prioridade", type: "text" as const };

    const result = await ops.setCustomValue("t", field, "");

    expect(result.ok).toBe(true);
    expect(gateway.snapshot().values).toEqual([]);
    expect(cachedTask("t")?.customFields).toEqual({});
  });

  it("setting a custom value over a leftover empty record still works", async () => {
    const { ops, gateway, cachedTask } = await setup({
      fields: [{ id: "f", name: "Prioridade", isUniversal: true }],
      tasks: [{ id: "t", title: "T" }],
      values: [{ taskId: "t", customFieldId: "f", valueText: "", valueNumber: null, selectedOptionId: null }],
    });

    const result = await ops.setCustomValue("t", { id: "f", name: "Prioridade", type: "text" }, "Alta");

    expect(result.ok).toBe(true);
    expect(gateway.snapshot().values.map((v) => v.valueText)).toEqual(["Alta"]);
    expect(cachedTask("t")?.customFields).toEqual({ Prioridade: "Alta" });
  });

  it("a failed custom value write is rolled back", async () => {
    const { ops, gateway, cachedTask } = await setup({
      fields: [{ id: "f", name: "Prioridade", isUniversal: true }],
      tasks: [{ id: "t", title: "T" }],
      values: [{ taskId: "t", customFieldId: "f", valueText: "Alta", valueNumber: null, selectedOptionId: null }],
    });
    gateway.failNext();

    const result = await ops.setCustomValue("t", { id: "f", name: "Prioridade", type: "text" }, "Baixa");

    expect(result.ok).toBe(false);
    expect(cachedTask("t")?.customFields).toEqual({ Prioridade: "Alta" });
  });

  it("project custom values are written to that project's query", async () => {
    const { ops, gateway, queryClient } = await setup({
      projects: [{ id: "p1" }],
      fields: [{ id: "f", name: "Orçamento", enabledInProjectIds: ["p1"] }],
      tasks: [{ id: "t", title: "T", projectIds: ["p1"] }],
    });
    queryClient.setQueryData(projectCustomValuesQueryKey("p1"), await gateway.listProjectCustomValues("p1"));

    await ops.setCustomValue("t", { id: "f", name: "Orçamento", type: "number" }, 1500, { projectId: "p1" });

    expect(queryClient.getQueryData(projectCustomValuesQueryKey("p1"))).toEqual({ t: { Orçamento: 1500 } });
    expect(gateway.snapshot().values.map((v) => v.valueNumber)).toEqual([1500]);
  });

  it("delete completed keeps completed tasks that still have an incomplete subtask", async () => {
    const { ops, cached } = await setup({
      tasks: [
        { id: "done", title: "Done", isCompleted: true },
        { id: "doneParent", title: "Done parent", isCompleted: true },
        { id: "openChild", title: "Open child", parentTaskId: "doneParent" },
      ],
    });

    const result = await ops.deleteCompleted();

    expect(result.ok && result.deletedTaskIds).toEqual(["done"]);
    expect(cached().map((t) => t.id).sort()).toEqual(["doneParent", "openChild"]);
  });

  it("setProjects replaces the links optimistically and accepts the server version", async () => {
    const { ops, gateway, cachedTask } = await setup({
      projects: [{ id: "p1" }, { id: "p2" }],
      tasks: [{ id: "t", title: "T", projectIds: ["p1"] }],
    });

    const result = await ops.setProjects("t", ["p2"]);

    expect(result.ok).toBe(true);
    expect(cachedTask("t")?.projectIds).toEqual(["p2"]);
    expect(gateway.snapshot().links).toEqual([{ projectId: "p2", taskId: "t" }]);
  });

  it("update keeps universal custom values the server does not send back", async () => {
    const { ops, cachedTask } = await setup({
      fields: [{ id: "f", name: "Prioridade", isUniversal: true }],
      tasks: [{ id: "t", title: "T" }],
      values: [{ taskId: "t", customFieldId: "f", valueText: "Alta", valueNumber: null, selectedOptionId: null }],
    });

    await ops.update("t", { title: "Renomeada", notes: "   " });

    expect(cachedTask("t")).toMatchObject({ title: "Renomeada", notes: null, customFields: { Prioridade: "Alta" } });
  });

  it("an update that changes nothing does not call the server", async () => {
    const { ops, gateway } = await setup({ tasks: [{ id: "t", title: "T" }] });
    gateway.failNext();

    const result = await ops.update("t", { title: "T" });

    expect(result.ok).toBe(true);
  });
});
