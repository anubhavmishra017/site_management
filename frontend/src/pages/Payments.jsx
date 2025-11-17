// src/pages/Payments.jsx
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Search, Trash2 } from "lucide-react";

/**
 * Admin Payments page
 * Fully updated version:
 *  - Summary cards
 *  - Filters
 *  - Payment history table
 *  - Add Payment Modal
 *  - NEW: Auto Salary Generation (All Workers)
 * 
 * Ready to paste.
 */

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [filterWorker, setFilterWorker] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [search, setSearch] = useState("");

  // Add payment modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    workerId: "",
    type: "Salary",
    amount: "",
    note: "",
  });

  const hasFetched = useRef(false);

  /** ===========================
   * FETCH ALL DATA
   * ===========================
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, wRes] = await Promise.all([
        axios.get("http://localhost:8080/api/payments"),
        axios.get("http://localhost:8080/api/workers"),
      ]);
      setPayments(pRes.data || []);
      setWorkers(wRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payments or workers");
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

  /** ===========================
   * SUMMARY CALCULATIONS
   * ===========================
   */
  const totalSalary = payments
    .filter((p) => p.type === "Salary")
    .reduce((s, p) => s + (p.amount || 0), 0);

  const totalAdvance = payments
    .filter((p) => p.type === "Advance")
    .reduce((s, p) => s + (p.amount || 0), 0);

  const balance = totalSalary - totalAdvance;

  /** ===========================
   * FILTERED TABLE
   * ===========================
   */
  const matchesFilters = (p) => {
    if (filterWorker !== "All" && String(p.worker?.id) !== String(filterWorker))
      return false;
    if (filterType !== "All" && p.type !== filterType) return false;

    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      (p.note || "").toLowerCase().includes(q) ||
      (p.worker?.name || "").toLowerCase().includes(q)
    );
  };

  const filtered = payments.filter(matchesFilters);

  /** ===========================
   * ADD PAYMENT
   * ===========================
   */
  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!form.workerId || !form.type || !form.amount) {
      toast.error("Fill worker, type and amount");
      return;
    }
    try {
      const toastId = toast.loading("Adding payment...");
      await axios.post("http://localhost:8080/api/payments/add", {
        workerId: form.workerId,
        type: form.type,
        amount: parseFloat(form.amount),
        note: form.note || "",
      });
      toast.success("Payment added", { id: toastId });
      setIsModalOpen(false);
      setForm({ workerId: "", type: "Salary", amount: "", note: "" });
      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add payment");
    }
  };

  /** ===========================
   * DELETE PAYMENT
   * ===========================
   */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payment?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/payments/${id}`);
      toast.success("Deleted");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete payment");
    }
  };

  /** ===========================
   * SAFE DATE DISPLAY
   * ===========================
   */
  const fmtDate = (d) => {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString();
    } catch {
      return d;
    }
  };

  /** ===========================
   * AUTO SALARY FOR ALL WORKERS
   * ===========================
   */
  const generateSalaryAll = async () => {
    try {
      const toastId = toast.loading("Generating salary for all workers...");
      await axios.post("http://localhost:8080/api/payments/auto-salary/all");
      toast.success("Salary generated for all workers!", { id: toastId });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate salaries");
    }
  };

  return (
    <div className="space-y-6 p-4 animate-fadeIn">

      {/* ================= HEADER + SUMMARY ================= */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-sm text-gray-500">
            Manage payments — salary & advances
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded shadow text-center min-w-[160px]">
              <div className="text-xs text-gray-500">Total Salary</div>
              <div className="text-2xl font-bold">₹{totalSalary}</div>
            </div>
            <div className="bg-white p-4 rounded shadow text-center min-w-[160px]">
              <div className="text-xs text-gray-500">Total Advance</div>
              <div className="text-2xl font-bold">₹{totalAdvance}</div>
            </div>
            <div className="bg-white p-4 rounded shadow text-center min-w-[160px]">
              <div className="text-xs text-gray-500">Balance</div>
              <div className="text-2xl font-bold">₹{balance}</div>
            </div>
          </div>

          {/* 🔥 NEW Auto-Salary Button */}
          <button
            onClick={generateSalaryAll}
            className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Auto Salary (All Workers)
          </button>

          {/* Add Payment */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} /> Add Payment
          </button>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="bg-white p-4 rounded shadow flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 border rounded px-2 py-1">
          <Search size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by worker or note..."
            className="outline-none"
          />
        </div>

        <select
          value={filterWorker}
          onChange={(e) => setFilterWorker(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="All">All Workers</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="All">All Types</option>
          <option value="Salary">Salary</option>
          <option value="Advance">Advance</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setFilterWorker("All");
            setFilterType("All");
          }}
          className="text-sm text-gray-500"
        >
          Reset
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow border overflow-auto">
        {loading ? (
          <div className="p-6 text-gray-600">Loading payments...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500 italic">
            No payments found.
          </div>
        ) : (
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Worker</th>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Amount</th>
                <th className="px-4 py-2 border">Note</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{fmtDate(p.date)}</td>
                  <td className="px-4 py-2 border">{p.worker?.name || "-"}</td>
                  <td className="px-4 py-2 border font-semibold">{p.type}</td>
                  <td className="px-4 py-2 border">₹{p.amount}</td>
                  <td className="px-4 py-2 border">
                    {p.note || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= ADD PAYMENT MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              X
            </button>
            <h2 className="text-xl font-bold mb-2">Add Payment</h2>

            <form onSubmit={handleAddPayment} className="space-y-3">
              <select
                value={form.workerId}
                onChange={(e) =>
                  setForm({ ...form, workerId: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Worker</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} — {w.phone}
                  </option>
                ))}
              </select>

              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Salary">Salary</option>
                <option value="Advance">Advance</option>
              </select>

              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
                placeholder="Amount"
                className="w-full border rounded px-3 py-2"
                required
              />

              <input
                value={form.note}
                onChange={(e) =>
                  setForm({ ...form, note: e.target.value })
                }
                placeholder="Note (optional)"
                className="w-full border rounded px-3 py-2"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Payments;
