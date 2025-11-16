import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Workers from "./pages/Workers";
import Projects from "./pages/Projects";
import Attendance from "./pages/Attendance";
import Tasks from "./pages/Tasks";

/* Worker Panel imports */
import WorkerLogin from "./worker/WorkerLogin";
import WorkerResetPassword from "./worker/WorkerResetPassword";
import WorkerDashboard from "./worker/WorkerDashboard";
import ProtectedWorkerRoute from "./worker/ProtectedWorkerRoute";

// ✅ Missing earlier (now added)
import WorkerAttendance from "./worker/WorkerAttendance";
import WorkerPayments from "./worker/WorkerPayments";

function App() {
  return (
    <Router>
      <Routes>
        {/* ----------- WORKER ROUTES ----------- */}
        <Route path="/worker/login" element={<WorkerLogin />} />

        <Route
          path="/worker/reset-password"
          element={<WorkerResetPassword />}
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
          path="/worker/payments"
          element={
            <ProtectedWorkerRoute>
              <WorkerPayments />
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

        {/* ----------- ADMIN ROUTES ----------- */}
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/workers"
          element={
            <Layout>
              <Workers />
            </Layout>
          }
        />

        <Route
          path="/projects"
          element={
            <Layout>
              <Projects />
            </Layout>
          }
        />

        <Route
          path="/attendance"
          element={
            <Layout>
              <Attendance />
            </Layout>
          }
        />

        <Route
          path="/tasks"
          element={
            <Layout>
              <Tasks />
            </Layout>
          }
        />

        <Route path="/test" element={<h1>TEST WORKS</h1>} />

        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
