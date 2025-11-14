import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  UserPlus,
  Search,
  X,
  Loader2,
  RefreshCcw,
  Edit,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const Workers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const hasFetched = useRef(false); // ✅ Prevent double-fetch in StrictMode

  const [newWorker, setNewWorker] = useState({
    name: "",
    phone: "",
    ratePerDay: "",
    address: "",
    policeVerified: false,
    joinedDate: new Date().toISOString().split("T")[0], // ✅ default today
    aadhaarNumber: "",
    role: "", // ✅ Added role field
  });

  // ✅ Fetch all workers
  const fetchWorkers = async (showToast = false) => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8080/api/workers");
      setWorkers(res.data);
      if (showToast) toast.success("✅ Workers refreshed successfully!");
    } catch (error) {
      console.error("Error fetching workers:", error);
      toast.error("❌ Failed to load workers. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial Fetch (runs once)
  useEffect(() => {
    if (!hasFetched.current) {
      fetchWorkers(false);
      hasFetched.current = true;
    }
  }, []);

  // ✅ Add or Update worker
  const handleSaveWorker = async (e) => {
    e.preventDefault();
    if (!newWorker.name || !newWorker.phone || !newWorker.ratePerDay) {
      toast.error("Please fill Name, Phone, and Rate fields!");
      return;
    }

    try {
      const toastId = toast.loading(
        isEditMode ? "Updating worker..." : "Adding worker..."
      );

      if (isEditMode && selectedWorker) {
        await axios.put(
          `http://localhost:8080/api/workers/${selectedWorker.id}`,
          newWorker
        );
        toast.success("✅ Worker updated successfully!", { id: toastId });
      } else {
        await axios.post("http://localhost:8080/api/workers", newWorker);
        toast.success("✅ Worker added successfully!", { id: toastId });
      }

      setNewWorker({
        name: "",
        phone: "",
        ratePerDay: "",
        address: "",
        policeVerified: false,
        joinedDate: new Date().toISOString().split("T")[0],
        aadhaarNumber: "",
        role: "", // reset role
      });
      setIsModalOpen(false);
      setIsEditMode(false);
      fetchWorkers();
    } catch (error) {
      console.error("Error saving worker:", error);
      toast.error("❌ Failed to save worker.");
    }
  };

  // ✅ Edit worker
  const handleEdit = (worker) => {
    setSelectedWorker(worker);
    setNewWorker({
      name: worker.name || "",
      phone: worker.phone || "",
      ratePerDay: worker.ratePerDay || "",
      address: worker.address || "",
      policeVerified: worker.policeVerified || false,
      joinedDate: worker.joinedDate || new Date().toISOString().split("T")[0],
      aadhaarNumber: worker.aadhaarNumber || "",
      role: worker.role || "", // load role for edit
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // ✅ Delete worker
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this worker?")) return;

    try {
      const toastId = toast.loading("Deleting worker...");
      await axios.delete(`http://localhost:8080/api/workers/${id}`);
      toast.success("🗑️ Worker deleted successfully!", { id: toastId });
      fetchWorkers();
    } catch (error) {
      console.error("Error deleting worker:", error);
      toast.error("❌ Failed to delete worker.");
    }
  };

  // ✅ Search filter
  const filteredWorkers = workers.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Workers</h1>
        <div className="flex gap-3">
          <button
            onClick={() => fetchWorkers(true)}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditMode(false);
              setNewWorker({
                name: "",
                phone: "",
                ratePerDay: "",
                address: "",
                policeVerified: false,
                joinedDate: new Date().toISOString().split("T")[0],
                aadhaarNumber: "",
                role: "", // reset role
              });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <UserPlus size={18} />
            Add Worker
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3 border">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search workers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-gray-700"
        />
      </div>

      {/* Loader or Table */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden border">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
              <tr>
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Phone</th>
                <th className="py-3 px-6">Rate/Day</th>
                <th className="py-3 px-6">Address</th>
                <th className="py-3 px-6">Project</th>
                <th className="py-3 px-6">Role</th> {/* ✅ Added role column */}
                <th className="py-3 px-6">Police Verified</th>
                <th className="py-3 px-6">Joined Date</th>
                <th className="py-3 px-6">Aadhaar</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.length > 0 ? (
                filteredWorkers.map((w) => (
                  <tr
                    key={w.id}
                    className="border-t hover:bg-gray-50 transition text-gray-700"
                  >
                    <td className="py-3 px-6">{w.id}</td>
                    <td className="py-3 px-6 font-medium">{w.name || "—"}</td>
                    <td className="py-3 px-6">{w.phone || "—"}</td>
                    <td className="py-3 px-6">
                      {w.ratePerDay ? `₹${w.ratePerDay}` : "—"}
                    </td>
                    <td className="py-3 px-6">{w.address || "—"}</td>
                    <td className="py-3 px-6">
                      {w.project ? w.project.name : "—"}
                    </td>
                    <td className="py-3 px-6">{w.role || "—"}</td> {/* ✅ show role */}
                    <td className="py-3 px-6">
                      {w.policeVerified ? (
                        <span className="text-green-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-red-500 font-semibold">No</span>
                      )}
                    </td>
                    <td className="py-3 px-6">{w.joinedDate || "—"}</td>
                    <td className="py-3 px-6">{w.aadhaarNumber || "—"}</td>
                    <td className="py-3 px-6 text-center flex justify-center gap-3">
                      <button
                        onClick={() => handleEdit(w)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center py-6 text-gray-400 italic"
                  >
                    No workers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Worker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {isEditMode ? "Edit Worker" : "Add New Worker"}
            </h2>
            <form className="space-y-4" onSubmit={handleSaveWorker}>
              <input
                type="text"
                placeholder="Full Name"
                value={newWorker.name}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, name: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newWorker.phone}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, phone: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Rate Per Day"
                value={newWorker.ratePerDay}
                onChange={(e) =>
                  setNewWorker({
                    ...newWorker,
                    ratePerDay: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Address"
                value={newWorker.address}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, address: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Aadhaar Number"
                value={newWorker.aadhaarNumber}
                onChange={(e) =>
                  setNewWorker({
                    ...newWorker,
                    aadhaarNumber: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* ✅ Role Input */}
              <input
                type="text"
                placeholder="Role"
                value={newWorker.role}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, role: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* ✅ Joined Date Picker */}
              <input
                type="date"
                value={newWorker.joinedDate}
                onChange={(e) =>
                  setNewWorker({
                    ...newWorker,
                    joinedDate: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newWorker.policeVerified}
                  onChange={(e) =>
                    setNewWorker({
                      ...newWorker,
                      policeVerified: e.target.checked,
                    })
                  }
                />
                <label className="text-gray-700 text-sm">Police Verified</label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {isEditMode ? "Update Worker" : "Save Worker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
