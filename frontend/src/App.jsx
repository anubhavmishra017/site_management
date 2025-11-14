import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";

import Workers from "./pages/Workers";
import Projects from "./pages/Projects";
import Attendance from "./pages/Attendance";
import Tasks from "./pages/Tasks";

// Worker Pages
import WorkerLogin from "./worker/WorkerLogin";
import WorkerDashboard from "./worker/WorkerDashboard";

function App() {
  return (
    <Router>
      <Routes>

        {/* Admin Routes */}
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

        {/* -------- WORKER PANEL ROUTES -------- */}
        <Route path="/worker/login" element={<WorkerLogin />} />
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;
