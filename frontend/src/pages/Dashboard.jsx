import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Users,
  ClipboardList,
  Calendar,
  Wrench,
  TrendingUp,
  IndianRupee,
  ArrowDownCircle,
  ArrowUpCircle,
  Trophy,
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
  LineChart,
  Line,
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

  const [taskSummary, setTaskSummary] = useState({
    totalTasks: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });

  const [finance, setFinance] = useState({
    totalSalary: 0,
    totalAdvance: 0,
    balance: 0,
    salaryMonthly: [],
    advanceMonthly: [],
    topPaidWorkers: [],
  });

  const [projectProgress, setProjectProgress] = useState([
    { name: "Completed", value: 0 },
    { name: "In Progress", value: 0 },
    { name: "Pending", value: 0 },
  ]);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

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
        weeklyAttendance: data.weeklyAttendance,
      });

      setProjectProgress([
        { name: "Completed", value: data.completedProjects },
        { name: "In Progress", value: data.activeProjects },
        { name: "Pending", value: data.pendingProjects },
      ]);
    } catch {
      toast.error("❌ Failed to load dashboard summary");
    }

    try {
      const taskRes = await axios.get("http://localhost:8080/api/tasks");
      const tasks = taskRes.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdue = tasks.filter((t) => {
        if (!t.deadline) return false;
        const deadlineDate = new Date(t.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        return deadlineDate < today && t.status !== "Completed";
      }).length;

      setTaskSummary({
        totalTasks: tasks.length,
        pending: tasks.filter((t) => t.status === "Pending").length,
        inProgress: tasks.filter((t) => t.status === "In Progress").length,
        completed: tasks.filter((t) => t.status === "Completed").length,
        overdue,
      });
    } catch {}

    try {
      const resFin = await axios.get("http://localhost:8080/api/payments/summary");
      setFinance(resFin.data);
    } catch {
      toast.error("❌ Finance summary failed");
    }
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, [refreshKey]);

  const weeklyAttendance = summary.weeklyAttendance || [
    { day: "Mon", attendance: 0 },
    { day: "Tue", attendance: 0 },
    { day: "Wed", attendance: 0 },
    { day: "Thu", attendance: 0 },
    { day: "Fri", attendance: 0 },
    { day: "Sat", attendance: 0 },
    { day: "Sun", attendance: 0 },
  ];

  const financeChartData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - i));
    const monthNum = month.getMonth() + 1;

    const sal = finance.salaryMonthly.find((d) => d[0] === monthNum);
    const adv = finance.advanceMonthly.find((d) => d[0] === monthNum);

    return {
      month: month.toLocaleString("default", { month: "short" }),
      salary: sal ? sal[1] : 0,
      advance: adv ? adv[1] : 0,
    };
  });

  return (
    <div className="space-y-10 animate-fadeIn">

      {/* HEADER (Logout removed from here) */}
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
      </div>

      {/* FINANCE SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 shadow rounded-xl border flex items-center gap-4">
          <div className="bg-green-600 text-white p-3 rounded-lg">
            <ArrowDownCircle size={32} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Salary Paid</p>
            <h2 className="text-3xl font-bold text-green-700">₹{finance.totalSalary}</h2>
          </div>
        </div>

        <div className="bg-white p-6 shadow rounded-xl border flex items-center gap-4">
          <div className="bg-red-600 text-white p-3 rounded-lg">
            <ArrowUpCircle size={32} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Advance Given</p>
            <h2 className="text-3xl font-bold text-red-700">₹{finance.totalAdvance}</h2>
          </div>
        </div>

        <div className="bg-white p-6 shadow rounded-xl border flex items-center gap-4">
          <div className="bg-blue-600 text-white p-3 rounded-lg">
            <IndianRupee size={32} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Net Balance</p>
            <h2 className="text-3xl font-bold text-blue-700">₹{finance.balance}</h2>
          </div>
        </div>
      </div>

      {/* MONTHLY FINANCE CHART */}
      <div className="bg-white shadow rounded-xl p-8 border h-96 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Monthly Salary vs Advance (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={financeChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="salary" stroke="#10b981" strokeWidth={3} />
            <Line type="monotone" dataKey="advance" stroke="#ef4444" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* TOP PAID WORKERS */}
      <div className="bg-white shadow rounded-xl p-8 border">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy /> Top Paid Workers
        </h2>

        {finance.topPaidWorkers.length === 0 ? (
          <p className="text-gray-500 italic">No data available</p>
        ) : (
          <table className="w-full text-left table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Worker</th>
                <th className="p-3 border">Total Salary</th>
              </tr>
            </thead>
            <tbody>
              {finance.topPaidWorkers.map((w) => (
                <tr key={w[0]} className="hover:bg-gray-50">
                  <td className="p-3 border">{w[1]}</td>
                  <td className="p-3 border text-green-700 font-bold">₹{w[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* WEEKLY ATTENDANCE + PROJECT STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-xl p-8 border h-96 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Weekly Attendance Overview</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyAttendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attendance" fill="#3b82f6" barSize={40} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-xl p-8 border h-96 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Project Completion Status</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={projectProgress}
                dataKey="value"
                outerRadius={110}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {projectProgress.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TASK STATUS */}
      <div className="bg-white shadow rounded-xl p-8 border h-96 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Task Status Summary</h2>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { name: "Pending", value: taskSummary.pending },
                { name: "In Progress", value: taskSummary.inProgress },
                { name: "Completed", value: taskSummary.completed },
                { name: "Overdue", value: taskSummary.overdue },
              ]}
              outerRadius={110}
              dataKey="value"
            >
              <Cell fill="#fbbf24" />
              <Cell fill="#3b82f6" />
              <Cell fill="#10b981" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center text-gray-400 text-sm pb-6">
        © {new Date().getFullYear()} Construction Site Management Dashboard
      </div>
    </div>
  );
};

export default Dashboard;
