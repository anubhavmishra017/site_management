import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import "./index.css";
import AdminLogin from "./pages/AdminLogin";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

/* ===== ADMIN (lazy loaded) ===== */
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Workers = lazy(() => import("./pages/Workers"));
const Projects = lazy(() => import("./pages/Projects"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Payments = lazy(() => import("./pages/Payments"));
const Settings = lazy(() => import("./pages/Settings"));

/* ===== WORKER PANEL IMPORTS ===== */
import WorkerLogin from "./worker/WorkerLogin";
import WorkerResetPassword from "./worker/WorkerResetPassword";
import WorkerDashboard from "./worker/WorkerDashboard";
import WorkerAttendance from "./worker/WorkerAttendance";
import WorkerTasks from "./worker/WorkerTasks";
import WorkerPayments from "./worker/WorkerPayments";
import WorkerProfile from "./worker/WorkerProfile";
import ProtectedWorkerRoute from "./worker/ProtectedWorkerRoute";

/* ===== Loading Screen ===== */
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen text-gray-500 text-lg">
      Loading...
    </div>
  );
}

/* ===== Error Boundary ===== */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("Error caught in boundary:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen text-red-600 text-xl">
          Something went wrong while loading this page.
        </div>
      );
    }
    return this.props.children;
  }
}

/* ===== ROOT RENDERING ===== */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>

          <Routes>
            {/* ================= ADMIN ROUTES (PROTECTED) ================= */}
            <Route
              path="/"
              element={
                <AdminProtectedRoute>
                  <Layout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="workers" element={<Workers />} />
              <Route path="projects" element={<Projects />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="settings" element={<Settings />} />
              <Route path="payments" element={<Payments />} />
            </Route>

            {/* ================= WORKER ROUTES ================= */}
            <Route path="/worker/login" element={<WorkerLogin />} />

            <Route path="/worker/reset-password" element={<WorkerResetPassword />} />

            <Route
              path="/worker/profile"
              element={
                <ProtectedWorkerRoute>
                  <WorkerProfile />
                </ProtectedWorkerRoute>
              }
            />

            <Route
              path="/worker/dashboard"
              element={
                <ProtectedWorkerRoute>
                  <WorkerDashboard />
                </ProtectedWorkerRoute>
              }
            />

            <Route
              path="/worker/attendance"
              element={
                <ProtectedWorkerRoute>
                  <WorkerAttendance />
                </ProtectedWorkerRoute>
              }
            />

            <Route
              path="/worker/tasks"
              element={
                <ProtectedWorkerRoute>
                  <WorkerTasks />
                </ProtectedWorkerRoute>
              }
            />

            <Route
              path="/worker/payments"
              element={
                <ProtectedWorkerRoute>
                  <WorkerPayments />
                </ProtectedWorkerRoute>
              }
            />

            {/* ================= ADMIN LOGIN ================= */}
            <Route path="/admin/login" element={<AdminLogin />} />
          </Routes>

        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>

    <Toaster position="top-right" reverseOrder={false} />
  </React.StrictMode>
);
