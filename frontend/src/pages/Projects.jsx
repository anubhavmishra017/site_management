import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Eye, X, Plus, Edit, Trash2 } from "lucide-react";

const Projects = ({ refreshDashboard }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    location: "",
    startDate: "",
    endDate: "",
    managerName: "",
    status: "Active",
    description: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const hasFetched = useRef(false);

  // Fetch all projects
  const fetchProjects = async (showToast = false) => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8080/api/projects");
      setProjects(res.data);
      if (showToast) toast.success("✅ Projects loaded successfully!");
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("❌ Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchProjects(true);
      hasFetched.current = true;
    }
  }, []);

  // Open Project Details Modal
  const openDetails = (project) => setSelectedProject(project);

  // Delete Project
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const toastId = toast.loading("Deleting project...");
      await axios.delete(`http://localhost:8080/api/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("🗑️ Project deleted successfully!", { id: toastId });
      refreshDashboard?.();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("❌ Failed to delete project.");
    }
  };

  // Save / Update Project
  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!newProject.name || !newProject.location || !newProject.managerName) {
      toast.error("Please fill all mandatory fields!");
      return;
    }

    try {
      const toastId = toast.loading(isEditMode ? "Updating project..." : "Adding project...");
      if (isEditMode) {
        const res = await axios.put(`http://localhost:8080/api/projects/${newProject.id}`, newProject);
        setProjects((prev) => prev.map((p) => (p.id === newProject.id ? res.data : p)));
        toast.success("✅ Project updated successfully!", { id: toastId });
      } else {
        const res = await axios.post("http://localhost:8080/api/projects", newProject);
        setProjects((prev) => [...prev, res.data]);
        toast.success("✅ Project added successfully!", { id: toastId });
      }

      setIsModalOpen(false);
      setIsEditMode(false);
      setNewProject({
        name: "",
        location: "",
        startDate: "",
        endDate: "",
        managerName: "",
        status: "Active",
        description: "",
      });
      refreshDashboard?.();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("❌ Failed to save project.");
    }
  };

  // Open Edit Modal
  const handleEdit = (project) => {
    setNewProject(project);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Inline status update — persistent + refresh dashboard
  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const toastId = toast.loading("Updating status...");
      const { data: updatedProject } = await axios.patch(
        `http://localhost:8080/api/projects/${projectId}/status`,
        { status: newStatus }
      );
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updatedProject : p)));
      toast.success("✅ Status updated!", { id: toastId });
      refreshDashboard?.();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("❌ Failed to update status.");
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.managerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList size={28} /> Projects
        </h1>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEditMode(false);
            setNewProject({
              name: "",
              location: "",
              startDate: "",
              endDate: "",
              managerName: "",
              status: "Active",
              description: "",
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Add Project
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name, location, manager..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/2 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-1/4 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Loader / Projects Grid */}
      {loading ? (
        <div className="flex justify-center py-10 text-gray-600 text-lg">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex justify-center py-10 text-gray-500 text-lg italic">No projects found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg border transition"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-800">{p.name}</h2>
                {/* Status Dropdown */}
                <select
                  value={p.status}
                  onChange={(e) => handleStatusChange(p.id, e.target.value)}
                  className={`text-xs font-semibold px-2 py-1 rounded-full border-none outline-none cursor-pointer ${
                    p.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : p.status === "Completed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <p className="text-gray-500 text-sm mt-1">{p.location}</p>
              <p className="text-gray-700 mt-2 line-clamp-2">
                {p.description || "No description provided."}
              </p>
              <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <p>📅 {p.startDate}</p>
                <p>👷 {p.managerName}</p>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => openDetails(p)} className="text-blue-600 hover:text-blue-800">
                  <Eye size={18} />
                </button>
                <button onClick={() => handleEdit(p)} className="text-yellow-600 hover:text-yellow-700">
                  <Edit size={18} />
                </button>
                <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-lg relative"
            >
              <button onClick={() => setSelectedProject(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedProject.name}</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>📍 Location:</strong> {selectedProject.location}</p>
                <p><strong>👷 Manager:</strong> {selectedProject.managerName}</p>
                <p><strong>📅 Start Date:</strong> {selectedProject.startDate}</p>
                <p><strong>🏁 End Date:</strong> {selectedProject.endDate}</p>
                <p><strong>🧾 Description:</strong> {selectedProject.description || "No description provided."}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">{isEditMode ? "Edit Project" : "Add New Project"}</h2>
            <form className="space-y-4" onSubmit={handleSaveProject}>
              <input type="text" placeholder="Project Name" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
              <input type="text" placeholder="Location" value={newProject.location} onChange={(e) => setNewProject({ ...newProject, location: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
              <input type="text" placeholder="Manager Name" value={newProject.managerName} onChange={(e) => setNewProject({ ...newProject, managerName: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
              <input type="date" value={newProject.startDate} onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              <input type="date" value={newProject.endDate} onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              <select value={newProject.status} onChange={(e) => setNewProject({ ...newProject, status: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
              <textarea placeholder="Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition w-full">{isEditMode ? "Update Project" : "Add Project"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
