import { Menu } from "lucide-react";

const Topbar = ({ toggleSidebar }) => {
  return (
    <div className="flex justify-between items-center bg-white shadow px-6 py-3">
      {/* Hamburger for small screens */}
      <button
        className="lg:hidden block text-gray-700"
        onClick={toggleSidebar}
      >
        <Menu size={24} />
      </button>

      <h2 className="text-xl font-semibold">Dashboard</h2>

      <div className="flex items-center gap-4">
        <span className="text-gray-600 hidden sm:block">Admin</span>
        <img
          src="https://i.pravatar.cc/40"
          alt="User Avatar"
          className="rounded-full w-10 h-10"
        />
      </div>
    </div>
  );
};

export default Topbar;
