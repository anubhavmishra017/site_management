import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getWorker } from "./workerAuth";
import { CalendarDays, Clock, CheckCircle } from "lucide-react";

const WorkerTasks = () => {
  const worker = getWorker();
  const workerId = worker?.id;

  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todayTasks, setTodayTasks] = useState([]);

  // --------------------------
  // FETCH TASKS FOR THIS WORKER
  // --------------------------
  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/tasks/worker/${workerId}`
      );
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    if (workerId) fetchTasks();
  }, [workerId]);

  // --------------------------
  // UPDATE TASK STATUS
  // --------------------------
  const updateStatus = async (taskId, status) => {
    try {
      await axios.patch(`http://localhost:8080/api/tasks/${taskId}/status`, {
        status,
      });
      toast.success("Task updated");
      fetchTasks();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update");
    }
  };

  // --------------------------
  // TODAY'S TASKS
  // --------------------------
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTodayTasks(tasks.filter((t) => t.deadline === today));
  }, [tasks]);

  // --------------------------
  // DEADLINE COLOR LOGIC (FIXED)
  // --------------------------
  const getDeadlineState = (deadline, status) => {
    if (status === "Completed") return "ok"; // 🔥 FIX ADDED

    if (!deadline) return "none";
    const dl = new Date(deadline);
    const today = new Date();
    const diff = dl - new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return "overdue";
    if (days <= 2) return "soon";
    return "ok";
  };

  // --------------------------
  // CALENDAR GRID GENERATION
  // --------------------------
  const generateCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const daysArray = [];
    for (let i = 0; i < firstDay; i++) daysArray.push(null);
    for (let d = 1; d <= totalDays; d++) daysArray.push(d);

    return daysArray;
  };

  const changeMonth = (offset) => {
    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + offset,
      1
    );
    setSelectedDate(newDate);
  };

  // --------------------------
  // TASKS OF SELECTED DATE
  // --------------------------
  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const selectedDayTasks = tasks.filter((t) => t.deadline === selectedDateStr);

  // --------------------------
  // KANBAN COLUMNS
  // --------------------------
  const pending = tasks.filter((t) => t.status === "Pending");
  const progress = tasks.filter((t) => t.status === "In Progress");
  const completed = tasks.filter((t) => t.status === "Completed");

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Your Tasks</h1>

      {/* TODAY TASKS */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Clock size={20} /> Today's Work
        </h2>

        {todayTasks.length === 0 ? (
          <p className="text-gray-500">No tasks due today.</p>
        ) : (
          todayTasks.map((t) => {
            const state = getDeadlineState(t.deadline, t.status); // 🔥 FIX ADDED
            return (
              <div key={t.id} className="border rounded-lg p-3 mb-3 bg-gray-50">
                <div className="font-bold">{t.taskName}</div>
                <div className="text-sm text-gray-600">
                  {t.project?.name}
                </div>
                <div className="text-sm mt-1">
                  Deadline:{" "}
                  <span
                    className={
                      state === "overdue"
                        ? "text-red-600"
                        : state === "soon"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }
                  >
                    {t.deadline}
                  </span>
                </div>

                {t.status === "Pending" && (
                  <button
                    onClick={() => updateStatus(t.id, "In Progress")}
                    className="w-full mt-3 bg-green-600 text-white py-2 rounded text-lg"
                  >
                    Start
                  </button>
                )}

                {t.status === "In Progress" && (
                  <button
                    onClick={() => updateStatus(t.id, "Completed")}
                    className="w-full mt-3 bg-blue-600 text-white py-2 rounded text-lg"
                  >
                    Done
                  </button>
                )}

                {t.status === "Completed" && (
                  <div className="mt-3 text-green-700 font-bold">
                    ✔ Completed
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CALENDAR */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <CalendarDays size={20} /> Calendar
        </h2>

        <div className="flex justify-between mb-2">
          <button onClick={() => changeMonth(-1)}>◀</button>
          <div className="font-bold">
            {selectedDate.toLocaleString("default", { month: "long" })}{" "}
            {selectedDate.getFullYear()}
          </div>
          <button onClick={() => changeMonth(1)}>▶</button>
        </div>

        <div className="grid grid-cols-7 text-center text-sm">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="font-bold py-1">
              {d}
            </div>
          ))}

          {generateCalendar().map((d, idx) =>
            d ? (
              <div
                key={idx}
                onClick={() => {
                  const newDate = new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    d
                  );
                  setSelectedDate(newDate);
                }}
                className={`py-2 border cursor-pointer ${
                  selectedDate.getDate() === d ? "bg-blue-100" : ""
                }`}
              >
                {d}
              </div>
            ) : (
              <div key={idx} className="py-2 border"></div>
            )
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">
            Tasks on {selectedDateStr}:
          </h3>

          {selectedDayTasks.length === 0 ? (
            <p className="text-gray-500">No tasks.</p>
          ) : (
            selectedDayTasks.map((t) => (
              <div key={t.id} className="border rounded p-2 mb-2">
                {t.taskName} — {t.status}
              </div>
            ))
          )}
        </div>
      </div>

      {/* KANBAN VIEW */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle size={20} /> All Tasks
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Pending */}
          <div className="p-3 border rounded">
            <h3 className="font-bold mb-2 text-yellow-700">Pending</h3>
            {pending.length === 0 && <p>No tasks</p>}
            {pending.map((t) => (
              <div key={t.id} className="bg-yellow-50 border rounded p-2 mb-2">
                <div className="font-semibold">{t.taskName}</div>
                <button
                  onClick={() => updateStatus(t.id, "In Progress")}
                  className="mt-2 w-full bg-green-600 text-white py-1 rounded"
                >
                  Start
                </button>
              </div>
            ))}
          </div>

          {/* In Progress */}
          <div className="p-3 border rounded">
            <h3 className="font-bold mb-2 text-blue-700">In Progress</h3>
            {progress.length === 0 && <p>No tasks</p>}
            {progress.map((t) => (
              <div key={t.id} className="bg-blue-50 border rounded p-2 mb-2">
                <div className="font-semibold">{t.taskName}</div>
                <button
                  onClick={() => updateStatus(t.id, "Completed")}
                  className="mt-2 w-full bg-blue-600 text-white py-1 rounded"
                >
                  Done
                </button>
              </div>
            ))}
          </div>

          {/* Completed */}
          <div className="p-3 border rounded">
            <h3 className="font-bold mb-2 text-green-700">Completed</h3>
            {completed.length === 0 && <p>No tasks</p>}
            {completed.map((t) => (
              <div key={t.id} className="bg-green-50 border rounded p-2 mb-2">
                <div className="font-semibold">{t.taskName}</div>
                <div className="text-green-700 font-bold mt-2">✔ Done</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerTasks;
