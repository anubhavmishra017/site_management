import { useState, useEffect, useRef, Fragment } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

/**
 * Enhanced Tasks.jsx
 * - Filters (search / worker / project / status)
 * - Summary cards (counts)
 * - Overdue / due-soon highlighting
 * - Task detail popup
 * - Keeps add/edit/delete/status update logic
 */

const SMALL_DAYS_WARN = 3; // due-soon threshold in days

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // for details modal

  const [newTask, setNewTask] = useState({
    taskName: "",
    description: "",
    status: "Pending",
    deadline: "",
    workerId: "",
    projectId: "",
  });

  // Filters
  const [search, setSearch] = useState("");
  const [filterWorker, setFilterWorker] = useState("All");
  const [filterProject, setFilterProject] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const hasFetched = useRef(false);

  // Fetch tasks, workers, projects
  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskRes, workerRes, projectRes] = await Promise.all([
        axios.get("http://localhost:8080/api/tasks"),
        axios.get("http://localhost:8080/api/workers"),
        axios.get("http://localhost:8080/api/projects"),
      ]);
      setTasks(taskRes.data || []);
      setWorkers(workerRes.data || []);
      setProjects(projectRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to load tasks data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchData();
      hasFetched.current = true;
    }
  }, []);

  // Helper: format date string to yyyy-mm-dd (if needed)
  const formatDateForInput = (d) => {
    if (!d) return "";
    // Accept yyyy-mm-dd or ISO; if already yyyy-mm-dd, return.
    if (d.includes("-")) {
      const parts = d.split("-");
      if (parts.length === 3 && parts[0].length === 4) return d;
      // If dd-mm-yyyy -> convert
      if (parts[0].length === 2) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    // fallback
    try {
      const dt = new Date(d);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    } catch {
      return "";
    }
  };

  // Save (add/update)
  const handleSaveTask = async (e) => {
    e.preventDefault();

    if (!newTask.taskName || !newTask.workerId || !newTask.projectId) {
      toast.error("Please fill Task name, Worker & Project.");
      return;
    }

    try {
      const toastId = toast.loading(isEditMode ? "Updating Task..." : "Adding Task...");

      const payload = {
        taskName: newTask.taskName,
        description: newTask.description,
        status: newTask.status,
        // backend expects worker: {id} and project: {id}
        worker: { id: parseInt(newTask.workerId) },
        project: { id: parseInt(newTask.projectId) },
        // deadline: send null or yyyy-mm-dd
        deadline: newTask.deadline ? formatDateForInput(newTask.deadline) : null,
      };

      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/tasks/${newTask.id}`, payload);
        toast.success("✅ Task updated!", { id: toastId });
      } else {
        await axios.post("http://localhost:8080/api/tasks", payload);
        toast.success("✅ Task added!", { id: toastId });
      }

      setIsModalOpen(false);
      setIsEditMode(false);
      setNewTask({
        taskName: "",
        description: "",
        status: "Pending",
        deadline: "",
        workerId: "",
        projectId: "",
      });

      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save task.");
    }
  };

  // Edit / Open modal
  const handleEdit = (t) => {
    setIsEditMode(true);
    setIsModalOpen(true);
    setNewTask({
      id: t.id,
      taskName: t.taskName || "",
      description: t.description || "",
      status: t.status || "Pending",
      deadline: formatDateForInput(t.deadline),
      workerId: t.worker?.id || "",
      projectId: t.project?.id || "",
    });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      const toastId = toast.loading("Deleting task...");
      await axios.delete(`http://localhost:8080/api/tasks/${id}`);
      toast.success("🗑️ Task deleted", { id: toastId });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete task");
    }
  };

  // Status inline update
  const handleStatusChange = async (task, newStatus) => {
    try {
      const updated = {
        ...task,
        status: newStatus,
        worker: { id: task.worker?.id },
        project: { id: task.project?.id },
        deadline: task.deadline || null,
      };
      await axios.put(`http://localhost:8080/api/tasks/${task.id}`, updated);
      toast.success("Status updated");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update status");
    }
  };

  // Derived counts (summary cards)
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const overdueCount = tasks.filter((t) => {
    if (!t.deadline) return false;
    const dl = new Date(t.deadline);
    const today = new Date();
    // compare only date part
    return dl < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }).length;

  // Filtering logic
  const matchesFilters = (t) => {
    if (filterWorker !== "All" && String(t.worker?.id) !== String(filterWorker)) return false;
    if (filterProject !== "All" && String(t.project?.id) !== String(filterProject)) return false;
    if (filterStatus !== "All" && t.status !== filterStatus) return false;
    if (search && !t.taskName.toLowerCase().includes(search.toLowerCase()) && !(t.description || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  };

  const filteredTasks = tasks.filter(matchesFilters);

  // Overdue / due-soon checks
  const getDeadlineState = (deadline) => {
    if (!deadline) return "none";
    const dl = new Date(deadline);
    const today = new Date();
    const diffMs = dl - new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "overdue";
    if (diffDays <= SMALL_DAYS_WARN) return "due-soon";
    return "ok";
  };

  // Task detail popup
  const openDetails = (task) => {
    setSelectedTask(task);
  };

  return (
    <div className="space-y-6 animate-fadeIn p-4">
      {/* Header + summary cards */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-sm text-gray-500">Manage tasks, deadlines and assignments</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded shadow text-center min-w-[140px]">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-xl font-bold">{totalTasks}</div>
            </div>
            <div className="bg-white p-3 rounded shadow text-center min-w-[140px]">
              <div className="text-xs text-gray-500">Pending</div>
              <div className="text-xl font-bold">{pendingCount}</div>
            </div>
            <div className="bg-white p-3 rounded shadow text-center min-w-[140px]">
              <div className="text-xs text-gray-500">In Progress</div>
              <div className="text-xl font-bold">{inProgressCount}</div>
            </div>
            <div className="bg-white p-3 rounded shadow text-center min-w-[140px]">
              <div className="text-xs text-gray-500">Overdue</div>
              <div className="text-xl font-bold text-red-600">{overdueCount}</div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditMode(false);
              setNewTask({
                taskName: "",
                description: "",
                status: "Pending",
                deadline: "",
                workerId: "",
                projectId: "",
              });
            }}
            className="ml-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow flex flex-wrap gap-3 items-center">
        <input
          placeholder="Search tasks or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-60"
        />
        <select value={filterWorker} onChange={(e) => setFilterWorker(e.target.value)} className="border px-3 py-2 rounded">
          <option value="All">All Workers</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="border px-3 py-2 rounded">
          <option value="All">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border px-3 py-2 rounded">
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <button onClick={() => { setSearch(""); setFilterWorker("All"); setFilterProject("All"); setFilterStatus("All"); }} className="text-sm text-gray-500">Reset</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border overflow-auto">
        {loading ? (
          <div className="p-6 text-gray-600">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500 italic">No tasks found.</div>
        ) : (
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Worker</th>
                <th className="px-4 py-2 border">Project</th>
                <th className="px-4 py-2 border">Deadline</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTasks.map((t) => {
                const dlState = getDeadlineState(t.deadline);
                return (
                  <tr key={t.id} className={`hover:bg-gray-50 ${dlState === "overdue" ? "bg-red-50" : dlState === "due-soon" ? "bg-yellow-50" : ""}`}>
                    <td className="px-4 py-2 border">{t.id}</td>
                    <td className="px-4 py-2 border">{t.taskName}</td>
                    <td className="px-4 py-2 border">{t.worker?.name || "-"}</td>
                    <td className="px-4 py-2 border">{t.project?.name || "-"}</td>
                    <td className="px-4 py-2 border">
                      <div className="flex items-center gap-2">
                        <span>{t.deadline || "-"}</span>
                        {dlState === "overdue" && <span className="text-red-600 text-xs font-semibold">Overdue</span>}
                        {dlState === "due-soon" && <span className="text-yellow-700 text-xs font-semibold">Due soon</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2 border">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { openDetails(t); }} className="text-blue-600 hover:text-blue-800"><Eye size={16} /></button>
                        <button onClick={() => handleEdit(t)} className="text-yellow-600 hover:text-yellow-700"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg relative">
            <button onClick={() => setSelectedTask(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">X</button>
            <h2 className="text-2xl font-bold mb-2">{selectedTask.taskName}</h2>
            <p className="text-sm text-gray-600 mb-3">{selectedTask.description || "No description provided."}</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div><strong>Worker</strong><div>{selectedTask.worker?.name || "-"}</div></div>
              <div><strong>Project</strong><div>{selectedTask.project?.name || "-"}</div></div>
              <div><strong>Deadline</strong><div>{selectedTask.deadline || "-"}</div></div>
              <div><strong>Status</strong><div>{selectedTask.status}</div></div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">X</button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">{isEditMode ? "Edit Task" : "Add New Task"}</h2>
            <form className="space-y-4" onSubmit={handleSaveTask}>
              <input type="text" placeholder="Task Name" value={newTask.taskName} onChange={(e)=>setNewTask({...newTask, taskName: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
              <textarea placeholder="Description" value={newTask.description} onChange={(e)=>setNewTask({...newTask, description: e.target.value})} className="w-full border rounded-lg px-3 py-2"></textarea>
              <input type="date" value={newTask.deadline} onChange={(e)=>setNewTask({...newTask, deadline: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              <select value={newTask.workerId} onChange={(e)=>setNewTask({...newTask, workerId: e.target.value})} className="w-full border rounded-lg px-3 py-2" required>
                <option value="">Select Worker</option>
                {workers.map(w=> <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <select value={newTask.projectId} onChange={(e)=>setNewTask({...newTask, projectId: e.target.value})} className="w-full border rounded-lg px-3 py-2" required>
                <option value="">Select Project</option>
                {projects.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={newTask.status} onChange={(e)=>setNewTask({...newTask, status: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <div className="flex gap-2 justify-end">
                <button type="button" onClick={()=> setIsModalOpen(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded"> {isEditMode ? "Update Task" : "Add Task"} </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
