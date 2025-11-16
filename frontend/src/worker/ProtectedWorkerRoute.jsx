import { Navigate } from "react-router-dom";
import { getWorker } from "./workerAuth";

const ProtectedWorkerRoute = ({ children }) => {
  const worker = getWorker();

  if (!worker) {
    return <Navigate to="/worker/login" replace />;
  }

  // if worker must reset password before accessing dashboard
  if (worker.mustResetPassword) {
    return <Navigate to="/worker/reset-password" replace />;
  }

  return children;
};

export default ProtectedWorkerRoute;
