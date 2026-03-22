import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import type { DatesSetArg, EventClickArg } from "@fullcalendar/core";
import { CheckCircle2, Circle, Pencil, Plus, Trash2 } from "lucide-react";
import AddTaskModal from "../components/AddTaskModal";
import TaskViewLayout from "../components/TaskViewLayout";
import type { CreateTaskDto, GetTasksDto } from "../types/apiTypes";

const toDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const currentMonth = new Date();
const monthBase = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

const INITIAL_TASKS: GetTasksDto[] = [
  { id: "t1", title: "Planejar sprint mensal", isCompleted: false, dueDate: toDateString(addDays(monthBase, 2)), createdAt: new Date().toISOString() },
  { id: "t2", title: "Review com stakeholders", isCompleted: false, dueDate: toDateString(addDays(monthBase, 7)), createdAt: new Date().toISOString() },
  { id: "t3", title: "Atualizar documentacao", isCompleted: true, dueDate: toDateString(addDays(monthBase, 11)), createdAt: new Date().toISOString() },
  { id: "t4", title: "Entrega da release", isCompleted: false, dueDate: toDateString(addDays(monthBase, 19)), createdAt: new Date().toISOString() },
  { id: "t5", title: "Planejamento do proximo mes", isCompleted: false, dueDate: toDateString(addDays(monthBase, 25)), createdAt: new Date().toISOString() },
];

const WeekViewPage = () => {
  const [tasks, setTasks] = useState<GetTasksDto[]>(INITIAL_TASKS);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<(CreateTaskDto & { id?: string }) | null>(null);
  const [visibleRange, setVisibleRange] = useState<{
    start: Date;
    end: Date;
    title: string;
  }>({
    start: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    end: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    title: currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
  });

  const calendarEvents = useMemo(
    () =>
      tasks
        .filter((task) => Boolean(task.dueDate))
        .map((task) => ({
          id: task.id,
          title: task.title || "Sem titulo",
          date: task.dueDate,
          allDay: true,
          extendedProps: {
            isCompleted: task.isCompleted ?? false,
          },
        })),
    [tasks]
  );

  const monthTasks = useMemo(
    () =>
      tasks
        .filter((task) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(`${task.dueDate}T00:00:00`);
          return dueDate >= visibleRange.start && dueDate < visibleRange.end;
        })
        .sort((left, right) => String(left.dueDate).localeCompare(String(right.dueDate))),
    [tasks, visibleRange]
  );

  const openCreateTaskModal = (dueDate?: string) => {
    setTaskToEdit({
      title: "",
      isCompleted: false,
      dueDate,
      notes: "",
      parentTaskId: "",
    });
    setShowEditTaskModal(true);
  };

  const handleEventClick = (arg: EventClickArg) => {
    const task = tasks.find((item) => item.id === arg.event.id);
    if (!task) return;
    setTaskToEdit({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      isCompleted: task.isCompleted,
      notes: task.notes,
      parentTaskId: task.parentTaskId,
    });
    setShowEditTaskModal(true);
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    setVisibleRange({
      start: arg.start,
      end: arg.end,
      title: arg.view.title,
    });
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((previous) =>
      previous.map((task) => (task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    setTasks((previous) => previous.filter((task) => task.id !== taskId));
  };

  const handleSaveTask = (task: CreateTaskDto & { id?: string }) => {
    if (task.id) {
      setTasks((previous) =>
        previous.map((currentTask) =>
          currentTask.id === task.id
            ? {
              ...currentTask,
              ...task,
              dueDate: task.dueDate,
              isCompleted: task.isCompleted ?? false,
            }
            : currentTask
        )
      );
      return;
    }

    const createdTask: GetTasksDto = {
      id: `t-${Date.now()}`,
      title: task.title,
      dueDate: task.dueDate,
      isCompleted: task.isCompleted ?? false,
      notes: task.notes,
      parentTaskId: task.parentTaskId,
      createdAt: new Date().toISOString(),
    };
    setTasks((previous) => [...previous, createdTask]);
  };

  return (
    <>
      <TaskViewLayout
        title="Calendario"
        description="Visualize suas tarefas no mes e clique nos eventos para editar rapidamente."
        canAddCustomField={false}
      >
        <section className="flex min-h-0 flex-1 flex-col overflow-auto bg-white p-4 sm:p-6">
          <div className="surface-panel rounded-2xl bg-white p-3 sm:p-4">
            <FullCalendar
              plugins={[dayGridPlugin]}
              locale={ptBrLocale}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "",
              }}
              buttonText={{ today: "Hoje" }}
              events={calendarEvents}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              dayMaxEvents={3}
              fixedWeekCount={false}
              height="auto"
              eventClassNames={(arg) =>
                arg.event.extendedProps.isCompleted
                  ? ["klip-fc-event", "is-completed"]
                  : ["klip-fc-event", "is-pending"]
              }
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                meridiem: false,
              }}
            />
          </div>

          <div className="mt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Tarefas do periodo</h2>
                <p className="text-sm text-slate-500">{visibleRange.title}</p>
              </div>
              <button
                onClick={() => openCreateTaskModal(toDateString(new Date()))}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
                Nova tarefa
              </button>
            </div>

            {monthTasks.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                Nenhuma tarefa com prazo neste periodo.
              </div>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {monthTasks.map((task) => (
                  <article key={task.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="mt-0.5 text-slate-400 transition-colors hover:text-emerald-600"
                        title="Alternar status"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-semibold ${task.isCompleted ? "text-slate-400 line-through" : "text-slate-900"}`}>
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Prazo: {task.dueDate || "Sem data"}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setTaskToEdit({
                            id: task.id,
                            title: task.title,
                            dueDate: task.dueDate,
                            isCompleted: task.isCompleted,
                            notes: task.notes,
                            parentTaskId: task.parentTaskId,
                          });
                          setShowEditTaskModal(true);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        title="Editar tarefa"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-100 hover:text-rose-700"
                        title="Excluir tarefa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <AddTaskModal
          isOpen={showEditTaskModal}
          onClose={() => {
            setShowEditTaskModal(false);
            setTaskToEdit(null);
          }}
          onSave={handleSaveTask}
          task={taskToEdit}
        />
      </TaskViewLayout>
    </>
  );
};

export default WeekViewPage;
