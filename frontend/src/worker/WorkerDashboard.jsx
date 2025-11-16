// src/worker/WorkerDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getWorker, clearWorker } from "./workerAuth";
import {
  Calendar,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Globe,
} from "lucide-react";


/* ===========================================================
    🔥 3. WAIT FOR GOOGLE TRANSLATOR IFRAME
   =========================================================== */
const waitForTranslateIframe = () => {
  return new Promise((resolve) => {
    const check = () => {
      const frame = document.querySelector("iframe.goog-te-menu-frame");
      if (frame) resolve(frame);
      else setTimeout(check, 300); // keep checking every 300ms
    };
    check();
  });
};

const WorkerDashboard = () => {
  const worker = getWorker();
  const navigate = useNavigate();

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    totalDays: 0,
  });

  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
  });

  const todayISO = new Date().toISOString().split("T")[0];

  /* ===========================================================
      🔥 4. TRANSLATE BUTTON ACTION
     =========================================================== */
  const translateToHindi = async () => {
    toast.loading("Loading…", { id: "tr" });

    try {
      const waitForFrame = () =>
        new Promise((resolve) => {
          const check = () => {
            const frame = document.querySelector("iframe.goog-te-menu-frame");
            if (frame) return resolve(frame);
            setTimeout(check, 200);
          };
          check();
        });

      const frame = await waitForFrame();
      const frameDoc = frame.contentDocument || frame.contentWindow.document;

      const hindiBtn = frameDoc.querySelector("a[lang='hi']");
      if (!hindiBtn) {
        toast.error("Hindi option not found", { id: "tr" });
        return;
      }

      hindiBtn.click();
      toast.success("हिंदी सक्रिय", { id: "tr" });
    } catch (err) {
      console.error(err);
      toast.error("Translator failed. Refresh once.", { id: "tr" });
    }
  };

  /* ===========================================================
      FETCH ATTENDANCE
     =========================================================== */
  const fetchAttendance = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/attendance/worker/${worker.id}`
      );
      const data = res.data || [];
      setAttendanceRecords(data);

      const present = data.filter((d) => d.status === "Present").length;
      const absent = data.filter((d) => d.status === "Absent").length;

      setAttendanceStats({
        present,
        absent,
        totalDays: data.length,
      });
    } catch (err) {
      toast.error("Failed to load attendance");
    }
  };

  /* ===========================================================
      FETCH TASKS
     =========================================================== */
  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/tasks/worker/${worker.id}`
      );
      const all = res.data || [];
      setTasks(all);

      const completed = all.filter((t) => t.status === "Completed").length;
      const inProgress = all.filter((t) => t.status === "In Progress").length;
      const pending = all.filter((t) => t.status === "Pending").length;

      const today = new Date();
      const todayNorm = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      let overdue = 0;
      all.forEach((t) => {
        if (t.deadline) {
          const dl = new Date(t.deadline);
          if (dl < todayNorm) overdue++;
        }
      });

      setTaskStats({
        total: all.length,
        completed,
        inProgress,
        pending,
        overdue,
      });
    } catch (err) {
      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    if (!worker) {
      navigate("/worker/login");
      return;
    }

    fetchAttendance();
    fetchTasks();
  }, []);

  const todaysAttendance =
    attendanceRecords.find((a) => a.date === todayISO) || null;

  const todaysTasks = tasks.filter((t) => t.deadline === todayISO);

  const handleLogout = () => {
    clearWorker();
    window.location.href = "/worker/login";
  };

  const gotoTasks = () => navigate("/worker/tasks");
  const gotoAttendance = () => navigate("/worker/attendance");

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Hidden translator root */}
      <div id="google_translate_element" style={{ display: "none" }}></div>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {worker.name}</h1>
          <p className="text-sm text-gray-600">Worker Dashboard</p>
        </div>

        <div className="flex items-center gap-2">
          {/* 🔥 HINDI BUTTON */}
          <button
            onClick={translateToHindi}
            className="flex items-center gap-2 border px-3 py-2 rounded bg-yellow-200 hover:bg-yellow-300"
          >
            <Globe size={16} /> हिंदी
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* -------- TODAY SUMMARY -------- */}
      <div className="bg-white rounded-xl shadow p-4 border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Calendar size={22} className="text-blue-600" />
            <div>
              <div className="text-sm text-gray-500">Today</div>
              <div className="font-semibold">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {taskStats.overdue > 0 && (
            <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded">
              <AlertTriangle size={18} />
              <div className="text-sm">
                Overdue tasks: <strong>{taskStats.overdue}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Attendance Today */}
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Attendance Today</div>
            <div className="mt-2 font-semibold">
              {todaysAttendance ? todaysAttendance.status : "Not marked"}
            </div>

            <button
              onClick={gotoAttendance}
              className="w-full mt-3 bg-blue-600 text-white py-2 rounded"
            >
              View Attendance
            </button>
          </div>

          {/* Tasks Today */}
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Tasks Today</div>
            <div className="mt-2 font-semibold">{todaysTasks.length} tasks</div>

            <button
              onClick={gotoTasks}
              className="w-full mt-3 bg-green-600 text-white py-2 rounded"
            >
              View Tasks
            </button>
          </div>

          {/* Quick Stats */}
          <div className="p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              <div className="text-sm text-gray-600">Quick Stats</div>
            </div>

            <div className="mt-2 space-y-1 text-sm">
              <div>Total days: {attendanceStats.totalDays}</div>
              <div>Present: {attendanceStats.present}</div>
              <div>Tasks: {taskStats.total}</div>
              <div>Completed: {taskStats.completed}</div>
            </div>
          </div>
        </div>
      </div>

      {/* -------- PROFILE + STATS -------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="bg-white rounded-xl shadow p-4 border">
          <h3 className="font-semibold mb-2">Profile</h3>
          <div className="text-sm text-gray-700">
            <div>
              <strong>Name:</strong> {worker.name}
            </div>
            <div>
              <strong>Phone:</strong> {worker.phone}
            </div>
            <div>
              <strong>Role:</strong> {worker.role}
            </div>
            <div>
              <strong>Project:</strong> {worker.project?.name || "Not assigned"}
            </div>
            <div>
              <strong>Rate/Day:</strong> ₹{worker.ratePerDay}
            </div>
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-xl shadow p-4 border">
          <h3 className="font-semibold mb-2">Attendance</h3>
          <div className="text-sm">
            <div>Total days: {attendanceStats.totalDays}</div>
            <div>Present: {attendanceStats.present}</div>
            <div>Absent: {attendanceStats.absent}</div>
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-xl shadow p-4 border">
          <h3 className="font-semibold mb-2">Tasks</h3>
          <div className="text-sm">
            <div>Total: {taskStats.total}</div>
            <div>In Progress: {taskStats.inProgress}</div>
            <div>Pending: {taskStats.pending}</div>
            <div>
              Overdue: <span className="text-red-600">{taskStats.overdue}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
