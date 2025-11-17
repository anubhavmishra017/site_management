import Sidebar from "./Sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map current path to page title
  const pageTitles = {
    "/": "Dashboard",
    "/workers": "Workers",
    "/projects": "Projects",
    "/tasks": "Tasks",
    "/attendance": "Attendance",
    "/payments": "Payments",
    "/settings": "Settings",
  };

  const currentTitle = pageTitles[location.pathname] || "Construction Site Management";

  // ✅ REAL LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("admin"); // remove admin auth
    toast.success("Logged out successfully");
    navigate("/admin/login"); // redirect to login page
  };

  return (
    // 🔥 This wrapper prevents Google Translate from touching Admin Panel
    <div className="notranslate">
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">

          {/* Topbar */}
          <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold">{currentTitle}</h1>

            <div className="flex items-center space-x-4">

              {/* ✅ FIXED LOGOUT BUTTON */}
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                onClick={handleLogout}
              >
                Logout
              </button>

              <div className="flex items-center space-x-2">
                <span className="font-medium">Admin</span>
                <img
                  src="https://i.pravatar.cc/40"
                  alt="Admin"
                  className="w-10 h-10 rounded-full border"
                />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
