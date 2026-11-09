import { describe, expect, it } from "vitest";
import { GatewayError } from "../services/gatewayError";
import { createMemoryGateway } from "./memoryGateway";

const update = { notes: null, dueDate: null, isCompleted: false, parentTaskId: null };

const ids = (tasks: Array<{ id: string }>) => tasks.map((t) => t.id).sort();

describe("memoryGateway", () => {
  describe("Cascade delete and Detach delete", () => {
    const tree = () =>
      createMemoryGateway({
        projects: [{ id: "p1" }],
        fields: [{ id: "f1", name: "Prioridade", isUniversal: true }],
        tasks: [
          { id: "root", title: "Root", projectIds: ["p1"] },
          { id: "a", title: "A", parentTaskId: "root" },
          { id: "b", title: "B", parentTaskId: "root" },
          { id: "a1", title: "A1", parentTaskId: "a" },
          { id: "a11", title: "A11", parentTaskId: "a1" },
          { id: "other", title: "Other" },
        ],
        values: [{ taskId: "a1", customFieldId: "f1", valueText: "Alta", valueNumber: null, selectedOptionId: null }],
      });

    it("cascade removes the whole subtree, its links and values", async () => {
      const gateway = tree();

      const result = await gateway.deleteTask("root", "cascade");

      expect(result.deletedTaskIds.sort()).toEqual(["a", "a1", "a11", "b", "root"]);
      expect(result.detachedTaskIds).toEqual([]);
      expect(ids(await gateway.listTasks())).toEqual(["other"]);
      expect(gateway.snapshot().links).toEqual([]);
      expect(gateway.snapshot().values).toEqual([]);
    });

    it("detach removes only the task and turns its direct subtasks into top-level tasks", async () => {
      const gateway = tree();

      const result = await gateway.deleteTask("root", "detach");

      expect(result).toEqual({ deletedTaskIds: ["root"], detachedTaskIds: ["a", "b"] });
      const byId = new Map((await gateway.listTasks()).map((t) => [t.id, t]));
      expect(byId.has("root")).toBe(false);
      expect(byId.get("a")?.parentTaskId).toBeNull();
      expect(byId.get("b")?.parentTaskId).toBeNull();
      expect(byId.get("a1")?.parentTaskId).toBe("a");
    });

    it("rejects deleting an unknown task", async () => {
      await expect(tree().deleteTask("nope", "cascade")).rejects.toBeInstanceOf(GatewayError);
    });
  });

  describe("Delete completed", () => {
    const gatewayWith = () =>
      createMemoryGateway({
        projects: [{ id: "p1" }],
        tasks: [
          { id: "done", title: "Done", isCompleted: true, projectIds: ["p1"] },
          { id: "doneParent", title: "Done parent", isCompleted: true },
          { id: "openChild", title: "Open child", parentTaskId: "doneParent" },
          { id: "doneGrandparent", title: "Done grandparent", isCompleted: true },
          { id: "doneMiddle", title: "Done middle", isCompleted: true, parentTaskId: "doneGrandparent" },
          { id: "openLeaf", title: "Open leaf", parentTaskId: "doneMiddle" },
          { id: "doneElsewhere", title: "Done elsewhere", isCompleted: true },
          { id: "open", title: "Open" },
        ],
      });

    it("keeps completed tasks that still have an incomplete subtask anywhere beneath them", async () => {
      const gateway = gatewayWith();

      const result = await gateway.deleteCompleted();

      expect(result.deletedTaskIds.sort()).toEqual(["done", "doneElsewhere"]);
      expect(ids(await gateway.listTasks())).toEqual([
        "doneGrandparent",
        "doneMiddle",
        "doneParent",
        "open",
        "openChild",
        "openLeaf",
      ]);
    });

    it("within a project only deletes that project's tasks", async () => {
      const gateway = gatewayWith();

      expect(await gateway.deleteCompleted("p1")).toEqual({ deletedTaskIds: ["done"] });
      await expect(gateway.deleteCompleted("unknown")).rejects.toBeInstanceOf(GatewayError);
    });
  });

  describe("Project membership", () => {
    it("creates a task already linked to its projects", async () => {
      const gateway = createMemoryGateway({ projects: [{ id: "p1" }, { id: "p2" }] });

      const task = await gateway.createTask({ title: " Nova ", projectIds: ["p1", "p2"] });

      expect(task.title).toBe("Nova");
      expect(task.projectIds).toEqual(["p1", "p2"]);
    });

    it("rejects an unknown project and saves nothing", async () => {
      const gateway = createMemoryGateway({ projects: [{ id: "p1" }] });

      await expect(gateway.createTask({ title: "x", projectIds: ["p1", "ghost"] })).rejects.toBeInstanceOf(GatewayError);
      expect(await gateway.listTasks()).toEqual([]);
    });

    it("update without projectIds keeps links; an array replaces them", async () => {
      const gateway = createMemoryGateway({
        projects: [{ id: "p1" }, { id: "p2" }],
        tasks: [{ id: "t", title: "T", projectIds: ["p1"] }],
      });

      expect((await gateway.updateTask("t", { title: "T2", ...update })).projectIds).toEqual(["p1"]);
      expect((await gateway.updateTask("t", { title: "T2", ...update, projectIds: ["p2"] })).projectIds).toEqual(["p2"]);
      expect((await gateway.updateTask("t", { title: "T2", ...update, projectIds: [] })).projectIds).toEqual([]);
    });

    it("hides tasks of archived projects, like the backend list", async () => {
      const gateway = createMemoryGateway({
        projects: [{ id: "archived", isArchived: true }],
        tasks: [
          { id: "hidden", title: "Hidden", projectIds: ["archived"] },
          { id: "visible", title: "Visible" },
        ],
      });

      expect(ids(await gateway.listTasks())).toEqual(["visible"]);
    });
  });

  describe("custom-field values", () => {
    const gatewayWith = () =>
      createMemoryGateway({
        projects: [{ id: "p1" }],
        fields: [
          { id: "uni", name: "Prioridade", isUniversal: true },
          { id: "proj", name: "Orçamento", enabledInProjectIds: ["p1"] },
        ],
        tasks: [{ id: "t", title: "T", projectIds: ["p1"] }],
      });

    it("creates, updates and deletes a value by task and field", async () => {
      const gateway = gatewayWith();

      await gateway.createCustomValue({ taskId: "t", customFieldId: "uni", valueText: "Alta" });
      expect((await gateway.listTasks())[0].customFields).toEqual({ Prioridade: "Alta" });

      await gateway.updateCustomValue({ taskId: "t", customFieldId: "uni", valueText: "Baixa" });
      expect((await gateway.listTasks())[0].customFields).toEqual({ Prioridade: "Baixa" });

      await gateway.deleteCustomValue("t", "uni");
      expect((await gateway.listTasks())[0].customFields).toEqual({});
      expect(gateway.snapshot().values).toEqual([]);
    });

    it("deleting a missing value is not an error", async () => {
      await expect(gatewayWith().deleteCustomValue("t", "uni")).resolves.toBeUndefined();
    });

    it("lists project values (all fields, numbers as text) and checks the field is enabled", async () => {
      const gateway = gatewayWith();

      await gateway.createCustomValue({ taskId: "t", customFieldId: "proj", valueNumber: 1500 }, "p1");

      expect(await gateway.listProjectCustomValues("p1")).toEqual({ t: { Orçamento: "1500" } });
      expect((await gateway.listTasks())[0].customFields).toEqual({});
      await expect(
        gateway.createCustomValue({ taskId: "t", customFieldId: "uni", valueText: "x" }, "p1"),
      ).rejects.toBeInstanceOf(GatewayError);
    });

    it("rejects a second create for the same task and field", async () => {
      const gateway = gatewayWith();
      await gateway.createCustomValue({ taskId: "t", customFieldId: "uni", valueText: "Alta" });

      await expect(
        gateway.createCustomValue({ taskId: "t", customFieldId: "uni", valueText: "Baixa" }),
      ).rejects.toBeInstanceOf(GatewayError);
    });
  });

  it("failNext makes exactly the next call fail with a GatewayError", async () => {
    const gateway = createMemoryGateway({ tasks: [{ id: "t", title: "T" }] });

    gateway.failNext();

    await expect(gateway.updateTask("t", { title: "x", ...update, isCompleted: true })).rejects.toBeInstanceOf(
      GatewayError,
    );
    expect((await gateway.listTasks())[0].isCompleted).toBe(false);
  });

  it("sets a calendar event id when the task has a due date, like the server", async () => {
    const gateway = createMemoryGateway();

    const task = await gateway.createTask({ title: "Com data", dueDate: "2026-11-10" });

    expect(task.dueDate).toBe("2026-11-10T00:00:00");
    expect(task.googleCalendarEventId).not.toBeNull();
  });
});
