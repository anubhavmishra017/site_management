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
  Wallet,
} from "lucide-react";

/* ===========================================================
    🔥 TRANSLATION SYSTEM — IMPROVED VERSION
=========================================================== */

// Apply language to Google Translate dropdown
const applyLanguage = (lang) => {
  const select = document.querySelector(".goog-te-combo");
  if (!select) return false;

  select.value = lang;
  select.dispatchEvent(new Event("change"));
  return true;
};

// Save + apply language
const setLanguage = (lang) => {
  localStorage.setItem("workerLang", lang);

  const ok = applyLanguage(lang);
  if (!ok) {
    toast.error("Translator loading...");
    return;
  }

  if (lang === "hi") toast.success("हिंदी सक्रिय");
  else toast.success("English activated");
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

  const [payments, setPayments] = useState([]);

  const todayISO = new Date().toISOString().split("T")[0];

  /* ===========================================================
      FETCH ATTENDANCE
  ============================================================ */
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
    } catch {
      toast.error("Failed to load attendance");
    }
  };

  /* ===========================================================
      FETCH TASKS (with overdue fix)
  ============================================================ */
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
      const todayClean = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      let overdue = 0;
      all.forEach((t) => {
        if (t.status === "Completed") return; // ignore completed
        if (!t.deadline) return;

        const dl = new Date(t.deadline);
        if (dl < todayClean) overdue++;
      });

      setTaskStats({
        total: all.length,
        completed,
        inProgress,
        pending,
        overdue,
      });
    } catch {
      toast.error("Failed to load tasks");
    }
  };

  /* ===========================================================
      FETCH PAYMENTS (for dashboard preview)
  ============================================================ */
  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/payments/worker/${worker.id}`
      );
      setPayments(res.data || []);
    } catch {
      toast.error("Failed to load payments");
    }
  };

  /* ===========================================================
      ON MOUNT — load data + apply language
  ============================================================ */
  useEffect(() => {
    if (!worker) {
      navigate("/worker/login");
      return;
    }

    fetchAttendance();
    fetchTasks();
    fetchPayments();

    setTimeout(() => {
      const saved = localStorage.getItem("workerLang") || "en";
      applyLanguage(saved);
    }, 1000);
  }, []);

  const todaysAttendance =
    attendanceRecords.find((a) => a.date === todayISO) || null;

  const todaysTasks = tasks.filter((t) => t.deadline === todayISO);

  const totalSalary = payments
    .filter((p) => p.type === "Salary")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalAdvance = payments
    .filter((p) => p.type === "Advance")
    .reduce((sum, p) => sum + p.amount, 0);

  const balance = totalSalary - totalAdvance;

  const handleLogout = () => {
    clearWorker();
    window.location.href = "/worker/login";
  };

  const currentLang =
    localStorage.getItem("workerLang") === "hi" ? "Hindi" : "English";

  return (
    <div className="p-6 space-y-6 animate-fadeIn">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {worker.name}</h1>
          <p className="text-sm text-gray-600">Worker Dashboard</p>
          <p className="text-xs text-gray-500 mt-1">
            Language: <span className="font-semibold">{currentLang}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">

          {/* Hindi */}
          <button
            onClick={() => setLanguage("hi")}
            className="flex items-center gap-2 border px-3 py-2 rounded bg-yellow-200 hover:bg-yellow-300"
          >
            <Globe size={16} /> हिंदी
          </button>

          {/* English */}
          <button
            onClick={() => setLanguage("en")}
            className="flex items-center gap-2 border px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            English
          </button>

          {/* Payments */}
          <button
            onClick={() => navigate("/worker/payments")}
            className="flex items-center gap-2 border px-3 py-2 rounded bg-purple-200 hover:bg-purple-300 text-purple-800"
          >
            💰 Payments
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate("/worker/profile")}
            className="flex items-center gap-2 border px-3 py-2 rounded bg-blue-200 hover:bg-blue-300"
          >
            👤 Profile
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* TODAY SUMMARY */}
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
          {/* Attendance */}
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Attendance Today</div>
            <div className="mt-2 font-semibold">
              {todaysAttendance ? todaysAttendance.status : "Not marked"}
            </div>
            <button
              onClick={() => navigate("/worker/attendance")}
              className="w-full mt-3 bg-blue-600 text-white py-2 rounded"
            >
              View Attendance
            </button>
          </div>

          {/* Today's Tasks */}
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">Tasks Today</div>
            <div className="mt-2 font-semibold">{todaysTasks.length} tasks</div>
            <button
              onClick={() => navigate("/worker/tasks")}
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

      {/* ===========================================================
         PAYMENTS PREVIEW BOX (NEW)
      ============================================================ */}
      <div className="bg-white rounded-xl shadow p-4 border">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Wallet className="text-purple-600" /> Payments Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Salary */}
          <div className="p-4 bg-green-50 border rounded">
            <p className="text-sm text-gray-600">Total Salary</p>
            <p className="text-2xl font-bold text-green-700">₹{totalSalary}</p>
          </div>

          {/* Advance */}
          <div className="p-4 bg-red-50 border rounded">
            <p className="text-sm text-gray-600">Total Advance</p>
            <p className="text-2xl font-bold text-red-700">₹{totalAdvance}</p>
          </div>

          {/* Balance */}
          <div className="p-4 bg-blue-50 border rounded">
            <p className="text-sm text-gray-600">Balance</p>
            <p className="text-2xl font-bold text-blue-700">₹{balance}</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/worker/payments")}
          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          View Payment History →
        </button>
      </div>

      {/* ... (rest unchanged) */}
    </div>
  );
};

export default WorkerDashboard;
