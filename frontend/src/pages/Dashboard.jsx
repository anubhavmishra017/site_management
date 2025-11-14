import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Users,
  ClipboardList,
  Calendar,
  Wrench,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const Dashboard = ({ refreshKey }) => {
  const [summary, setSummary] = useState({
    totalWorkers: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingProjects: 0,
    totalAttendanceRecords: 0,
    totalOvertimeHours: 0,
    averageDailyAttendance: 0,
  });

  // ✅ New Task Summary State
  const [taskSummary, setTaskSummary] = useState({
    totalTasks: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });

  const [projectProgress, setProjectProgress] = useState([
    { name: "Completed", value: 0 },
    { name: "In Progress", value: 0 },
    { name: "Pending", value: 0 },
  ]);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

  // Fetch dashboard summary + tasks summary
  const fetchDashboardSummary = async () => {
    try {
      const { data } = await axios.get("http://localhost:8080/api/dashboard/summary");

      setSummary({
        totalWorkers: data.totalWorkers,
        totalProjects: data.totalProjects,
        activeProjects: data.activeProjects,
        completedProjects: data.completedProjects,
        pendingProjects: data.pendingProjects,
        totalAttendanceRecords: data.totalAttendanceRecords,
        totalOvertimeHours: data.totalOvertimeHours,
        averageDailyAttendance: data.averageDailyAttendance,
      });

      setProjectProgress([
        { name: "Completed", value: data.completedProjects },
        { name: "In Progress", value: data.activeProjects },
        { name: "Pending", value: data.pendingProjects },
      ]);

    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      toast.error("❌ Failed to load dashboard summary");
    }

    // ✅ Fetch Task Summary
    try {
      const taskRes = await axios.get("http://localhost:8080/api/tasks");
      const tasks = taskRes.data || [];

      const today = new Date();
      const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const overdue = tasks.filter(
        (t) => t.deadline && new Date(t.deadline) < todayDate
      ).length;

      setTaskSummary({
        totalTasks: tasks.length,
        pending: tasks.filter((t) => t.status === "Pending").length,
        inProgress: tasks.filter((t) => t.status === "In Progress").length,
        completed: tasks.filter((t) => t.status === "Completed").length,
        overdue,
      });
    } catch (error) {
      console.error("Error fetching task summary:", error);
    }
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, [refreshKey]);

  // Existing Stat Cards + Task Cards added
  const statsCards = [
    { title: "Total Workers", value: summary.totalWorkers, icon: Users, color: "bg-blue-500" },
    { title: "Total Projects", value: summary.totalProjects, icon: ClipboardList, color: "bg-purple-500" },
    { title: "Active Projects", value: summary.activeProjects, icon: ClipboardList, color: "bg-green-500" },
    { title: "Completed Projects", value: summary.completedProjects, icon: ClipboardList, color: "bg-blue-300" },
    { title: "Pending Projects", value: summary.pendingProjects, icon: ClipboardList, color: "bg-yellow-500" },
    { title: "Attendance Records", value: summary.totalAttendanceRecords, icon: Calendar, color: "bg-orange-500" },
    { title: "Overtime Hours", value: summary.totalOvertimeHours, icon: Wrench, color: "bg-red-500" },
    {
      title: "Avg Daily Attendance",
      value: summary.averageDailyAttendance.toFixed(2),
      icon: TrendingUp,
      color: "bg-teal-500",
    },

    // ⭐ NEW TASK CARDS
    {
      title: "Total Tasks",
      value: taskSummary.totalTasks,
      icon: ClipboardList,
      color: "bg-indigo-500",
    },
    {
      title: "Pending Tasks",
      value: taskSummary.pending,
      icon: ClipboardList,
      color: "bg-yellow-500",
    },
    {
      title: "In Progress",
      value: taskSummary.inProgress,
      icon: ClipboardList,
      color: "bg-blue-500",
    },
    {
      title: "Overdue Tasks",
      value: taskSummary.overdue,
      icon: ClipboardList,
      color: "bg-red-600",
    },
  ];

  const weeklyAttendance = summary.weeklyAttendance || [
    { day: "Mon", attendance: 0 },
    { day: "Tue", attendance: 0 },
    { day: "Wed", attendance: 0 },
    { day: "Thu", attendance: 0 },
    { day: "Fri", attendance: 0 },
    { day: "Sat", attendance: 0 },
    { day: "Sun", attendance: 0 },
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2">
          <FileSpreadsheet size={18} /> Generate Report
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white shadow-md rounded-xl p-6 flex items-center gap-4 border hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              <div className={`${item.color} p-3 rounded-lg text-white`}>
                <Icon size={28} />
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-sm">{item.title}</p>
                <h2 className="text-2xl font-bold text-gray-800">
                  {item.value}
                </h2>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Attendance Chart */}
        <div className="bg-white shadow rounded-xl p-8 h-96 border border-dashed flex flex-col">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Weekly Attendance Overview
          </h2>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAttendance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Progress Pie Chart */}
        <div className="bg-white shadow rounded-xl p-8 h-96 border border-dashed flex flex-col">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Project Completion Status
          </h2>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectProgress}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {projectProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ⭐ NEW TASK STATUS PIE CHART */}
      <div className="bg-white shadow rounded-xl p-8 h-96 border border-dashed flex flex-col">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Task Status Summary
        </h2>
        <div className="flex-1 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Pending", value: taskSummary.pending },
                  { name: "In Progress", value: taskSummary.inProgress },
                  { name: "Completed", value: taskSummary.completed },
                  { name: "Overdue", value: taskSummary.overdue },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={110}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                dataKey="value"
              >
                <Cell fill="#fbbf24" /> {/* Pending */}
                <Cell fill="#3b82f6" /> {/* In Progress */}
                <Cell fill="#10b981" /> {/* Completed */}
                <Cell fill="#ef4444" /> {/* Overdue */}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-400 text-sm pt-4">
        © {new Date().getFullYear()} Construction Site Management Dashboard
      </div>
    </div>
  );
};

export default Dashboard;
