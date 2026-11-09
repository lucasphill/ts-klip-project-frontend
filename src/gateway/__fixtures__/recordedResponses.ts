// Response bodies in the exact shape the backend serializes (ASP.NET, camelCase,
// ResponseModel envelope). Ids shortened for readability.

export const T1 = "11111111-1111-1111-1111-111111111111";
export const T2 = "22222222-2222-2222-2222-222222222222";
export const P1 = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
export const P2 = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
export const F1 = "ffffffff-ffff-ffff-ffff-ffffffffffff";

export const recorded = {
  tasksWithUniversalCustomFields: {
    data: [
      {
        id: T1,
        title: "Comprar café",
        notes: null,
        dueDate: "2026-11-10T00:00:00",
        isCompleted: false,
        parentTaskId: null,
        projectIds: [P1, P2],
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
        customFields: {},
      },
    ],
    message: "Tasks with custom fields retrieved successfully.",
    status: true,
    timestamp: "2026-11-09T14:00:00Z",
  },

  tasks: {
    data: [
      {
        id: T1,
        title: "Comprar café",
        notes: null,
        dueDate: "2026-11-10T00:00:00",
        isCompleted: false,
        parentTaskId: null,
        createdAt: "2026-11-01T09:00:00",
        googleCalendarEventId: "gcal-123",
        projectIds: [P1, P2],
      },
      {
        id: T2,
        title: "Moer grãos",
        notes: "**fino**",
        dueDate: null,
        isCompleted: true,
        parentTaskId: T1,
        createdAt: "2026-11-02T09:00:00",
        googleCalendarEventId: null,
        projectIds: [],
      },
    ],
    message: "Tasks retrieved successfully",
    status: true,
    timestamp: "2026-11-09T14:00:00Z",
  },

  createdTask: {
    data: {
      id: T1,
      title: "Comprar café",
      notes: null,
      dueDate: "2026-11-10T00:00:00",
      isCompleted: false,
      parentTaskId: null,
      createdAt: "2026-11-09T14:00:00",
      googleCalendarEventId: "gcal-123",
      projectIds: [P1],
    },
    message: "Task created",
    status: true,
    timestamp: "2026-11-09T14:00:00Z",
  },

  deleteCascade: {
    data: { deletedTaskIds: [T1, T2], detachedTaskIds: [] },
    message: "Task deleted successfully",
    status: true,
    timestamp: "2026-11-09T14:00:00Z",
  },

  deleteCompleted: {
    data: { deletedCount: 1, deletedTaskIds: [T2] },
    message: "Completed tasks deleted successfully",
    status: true,
    timestamp: "2026-11-09T14:00:00Z",
  },

  createdCustomValue: {
    data: { id: "v-1", taskId: T1, customFieldId: F1, valueText: "Alta", valueNumber: null, selectedOptionId: null },
    message: "Custom field value created successfully.",
    status: true,
    timestamp: "2026-11-09T14:00:00Z",
  },

  deleteCustomValueNothing: {
    data: false,
    message: "No custom field value to delete.",
    status: true,
    timestamp: "2026-11-09T14:00:00Z",
  },

  projectTasksWithCustomFields: {
    data: [
      { id: T1, title: "Comprar café", notes: null, dueDate: null, isCompleted: false, parentTaskId: null, projectIds: [P1], customFields: { Prioridade: "Alta", Orçamento: "1500" } },
    ],
    message: "Tasks with custom fields retrieved successfully.",
    status: true,
    timestamp: "2026-11-09T14:00:00Z",
  },

  taskNotFound: {
    data: null,
    message: "Task not found",
    status: false,
    timestamp: "2026-11-09T14:00:00Z",
  },

  unauthorized: "Não foi possível encontrar o identificador do usuário no token.",
};
