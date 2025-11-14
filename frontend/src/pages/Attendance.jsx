import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Save, Plus, Calendar, Trash2 } from "lucide-react";

const Attendance = () => {
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]); // ✅ NEW: project list
  const [attendance, setAttendance] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [bulkAttendance, setBulkAttendance] = useState([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [projectFilter, setProjectFilter] = useState("All"); // ✅ NEW
  const [today] = useState(new Date().toISOString().split("T")[0]);

  // 🔵 Fetch workers
  const fetchWorkers = async () => {
    try {
      setLoadingWorkers(true);
      const res = await axios.get("http://localhost:8080/api/workers");
      const data = res.data || [];
      setWorkers(data);

      const initBulk = data.map((w) => ({
        worker: { id: w.id },
        status: "Present",
        overtimeHours: 0,
        date: today,
        project: w.project ? { id: w.project.id } : null,
      }));

      setBulkAttendance(initBulk);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch workers");
    } finally {
      setLoadingWorkers(false);
    }
  };

  // 🔵 Fetch projects (NEW)
  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/projects");
      setProjects(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch projects");
    }
  };

  // 🔵 Fetch attendance
  const fetchAttendance = async (customRange) => {
    try {
      setLoadingAttendance(true);

      const range = customRange || dateRange;
      let url = "http://localhost:8080/api/attendance";

      if (range.from && range.to) {
        url += `?from=${range.from}&to=${range.to}`;
      }

      const res = await axios.get(url);
      const data = res.data || [];

      data.sort((a, b) =>
        (a.worker?.name || "").localeCompare(b.worker?.name || "")
      );

      setAttendance(data);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to fetch attendance");
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
    fetchProjects(); // ✅ NEW
    fetchAttendance({ from: today, to: today });
  }, []);

  // 🟢 BULK attendance
  const handleMarkBulkAttendance = async () => {
    try {
      const toastId = toast.loading("Marking attendance...");

      const toMark = bulkAttendance.filter(
        (w) =>
          !attendance.some(
            (a) => a.worker?.id === w.worker.id && a.date === today
          )
      );

      if (!toMark.length) {
        toast("All workers already have attendance for today!");
        return;
      }

      await axios.post("http://localhost:8080/api/attendance/bulk", toMark);
      toast.success("✅ Attendance marked!", { id: toastId });
      fetchAttendance({ from: today, to: today });
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to mark attendance");
    }
  };

  // 🟢 Update attendance
  const handleUpdateAttendance = async (att) => {
    try {
      const toastId = toast.loading("Updating...");
      await axios.put(`http://localhost:8080/api/attendance/${att.id}`, att);
      toast.success("✅ Attendance updated!", { id: toastId });
      fetchAttendance(dateRange);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update attendance");
    }
  };

  // 🟢 NEW: Delete attendance
  const handleDeleteAttendance = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const toastId = toast.loading("Deleting...");
      await axios.delete(`http://localhost:8080/api/attendance/${id}`);
      toast.success("🗑️ Deleted", { id: toastId });
      fetchAttendance(dateRange);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete");
    }
  };

  // 🟢 Mark individual
  const handleMarkIndividual = async () => {
    if (!selectedWorker) {
      toast.error("Select a worker first");
      return;
    }

    const alreadyMarked = attendance.some(
      (a) => a.worker?.id === selectedWorker.id && a.date === today
    );
    if (alreadyMarked) {
      toast("Attendance already marked!");
      return;
    }

    try {
      const payload = {
        worker: { id: selectedWorker.id },
        status: "Present",
        overtimeHours: 0,
        date: today,
        project: selectedWorker.project
          ? { id: selectedWorker.project.id }
          : null,
      };

      const toastId = toast.loading("Marking attendance...");
      await axios.post("http://localhost:8080/api/attendance", payload);
      toast.success("✅ Attendance marked!", { id: toastId });
      fetchAttendance({ from: today, to: today });
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to mark attendance");
    }
  };

  // 🟢 Apply project filter (NEW)
  const filteredAttendance =
    projectFilter === "All"
      ? attendance
      : attendance.filter((a) => a.project?.name === projectFilter);

  return (
    <div className="space-y-8 p-4">

      {/* ------------------ BULK ATTENDANCE ------------------ */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-bold mb-2">Mark Attendance - {today}</h2>

        {loadingWorkers ? (
          <p>Loading workers...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Worker</th>
                  <th className="px-4 py-2 border">Project</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">OT Hours</th>
                </tr>
              </thead>

              <tbody>
                {bulkAttendance.map((w, idx) => (
                  <tr key={w.worker.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{w.worker.id}</td>
                    <td className="px-4 py-2 border">
                      {workers[idx]?.name || "-"}
                    </td>
                    <td className="px-4 py-2 border">
                      {workers[idx]?.project?.name || "-"}
                    </td>
                    <td className="px-4 py-2 border">
                      <select
                        className="border rounded px-2 py-1"
                        value={w.status}
                        onChange={(e) => {
                          const updated = [...bulkAttendance];
                          updated[idx].status = e.target.value;
                          setBulkAttendance(updated);
                        }}
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </td>

                    <td className="px-4 py-2 border">
                      <input
                        type="number"
                        min="0"
                        className="border rounded px-2 py-1 w-20"
                        value={w.overtimeHours}
                        onChange={(e) => {
                          const updated = [...bulkAttendance];
                          updated[idx].overtimeHours =
                            parseFloat(e.target.value) || 0;
                          setBulkAttendance(updated);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={handleMarkBulkAttendance}
              disabled={attendance.some((a) => a.date === today)}
              className={`mt-3 flex items-center gap-2 px-4 py-2 rounded text-white ${
                attendance.some((a) => a.date === today)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Plus size={16} /> Mark Attendance for All
            </button>
          </div>
        )}
      </div>

      {/* ------------------ INDIVIDUAL ------------------ */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-bold mb-2">Mark Individual Worker</h2>

        <div className="flex items-center gap-2 mb-2">
          <select
            className="border rounded px-2 py-1"
            value={selectedWorker?.id || ""}
            onChange={(e) =>
              setSelectedWorker(
                workers.find((w) => w.id === parseInt(e.target.value))
              )
            }
          >
            <option value="">Select Worker</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.project?.name || "No Project"})
              </option>
            ))}
          </select>

          <button
            onClick={handleMarkIndividual}
            disabled={attendance.some(
              (a) => a.worker?.id === selectedWorker?.id && a.date === today
            )}
            className={`flex items-center gap-2 px-4 py-2 rounded text-white ${
              attendance.some(
                (a) => a.worker?.id === selectedWorker?.id && a.date === today
              )
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Plus size={16} /> Mark Attendance
          </button>
        </div>
      </div>

      {/* ------------------ VIEW ATTENDANCE ------------------ */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-bold mb-2">View Attendance</h2>

        <div className="flex flex-wrap gap-2 mb-3">
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange({ ...dateRange, from: e.target.value })
            }
          />

          <input
            type="date"
            className="border rounded px-2 py-1"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange({ ...dateRange, to: e.target.value })
            }
          />

          <button
            onClick={() => fetchAttendance()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Get Attendance
          </button>

          <button
            onClick={() => {
              setDateRange({ from: today, to: today });
              fetchAttendance({ from: today, to: today });
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-1"
          >
            <Calendar size={16} /> Today
          </button>

          {/* 🔵 NEW: Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {loadingAttendance ? (
          <p>Loading attendance...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Worker</th>
                  <th className="px-4 py-2 border">Project</th>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">OT</th>
                  <th className="px-4 py-2 border">Total Pay</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-3">
                      No attendance records.
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((att) => (
                    <tr key={att.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{att.worker?.id}</td>
                      <td className="px-4 py-2 border">{att.worker?.name}</td>
                      <td className="px-4 py-2 border">
                        {att.project?.name || "-"}
                      </td>
                      <td className="px-4 py-2 border">{att.date}</td>

                      <td className="px-4 py-2 border">
                        <select
                          className="border rounded px-2 py-1"
                          value={att.status}
                          onChange={(e) => {
                            const updated = [...attendance];
                            const idx = updated.findIndex((a) => a.id === att.id);
                            updated[idx].status = e.target.value;
                            setAttendance(updated);
                          }}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </td>

                      <td className="px-4 py-2 border">
                        <input
                          type="number"
                          min="0"
                          className="border rounded px-2 py-1 w-20"
                          value={att.overtimeHours}
                          onChange={(e) => {
                            const updated = [...attendance];
                            const idx = updated.findIndex((a) => a.id === att.id);
                            updated[idx].overtimeHours =
                              parseFloat(e.target.value) || 0;
                            setAttendance(updated);
                          }}
                        />
                      </td>

                      <td className="px-4 py-2 border">{att.totalPay}</td>

                      <td className="px-4 py-2 border flex gap-2">
                        <button
                          onClick={() => handleUpdateAttendance(att)}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-1"
                        >
                          <Save size={14} /> Save
                        </button>

                        {/* 🔴 DELETE BUTTON */}
                        <button
                          onClick={() => handleDeleteAttendance(att.id)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
