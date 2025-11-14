import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();

  // Map current path to page title
  const pageTitles = {
    "/": "Dashboard",
    "/workers": "Workers",
    "/projects": "Projects",
    "/tasks": "Tasks",
    "/attendance": "Attendance",
    "/settings": "Settings",
  };

  const currentTitle = pageTitles[location.pathname] || "Construction Site Management";

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">{currentTitle}</h1>

          <div className="flex items-center space-x-4">
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
              onClick={() => alert('Logout functionality coming soon!')}
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
  );
};

export default Layout;
