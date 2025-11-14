import { NavLink } from "react-router-dom";
import { Home, Users, ClipboardList, Calendar, Settings } from "lucide-react";

const Sidebar = () => {
  const menuItems = [
  { name: "Dashboard", icon: Home, path: "/" },
  { name: "Workers", icon: Users, path: "/workers" },
  { name: "Projects", icon: ClipboardList, path: "/projects" },
  { name: "Tasks", icon: ClipboardList, path: "/tasks" },
  { name: "Attendance", icon: Calendar, path: "/attendance" },
  { name: "Settings", icon: Settings, path: "/settings" },
];


  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold tracking-wide text-center border-b border-gray-700">
        🏗️ CSM
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
              end
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
