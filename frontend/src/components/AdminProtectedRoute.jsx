import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const admin = localStorage.getItem("admin");

  // If admin is NOT logged in → redirect to /admin/login
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  // If logged in → allow access
  return children;
};

export default AdminProtectedRoute;
