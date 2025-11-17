// src/components/PaymentsByWorker.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const PaymentsByWorker = ({ workerId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/payments/worker/${workerId}`
      );
      setPayments(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workerId) fetchPayments();
  }, [workerId]);

  // ====== SUMMARY ======
  const totalSalary = payments
    .filter((p) => p.type === "Salary")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalAdvance = payments
    .filter((p) => p.type === "Advance")
    .reduce((sum, p) => sum + p.amount, 0);

  const balance = totalSalary - totalAdvance;

  return (
    <div className="space-y-6">

      {/* ===== Summary Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <div className="bg-green-50 p-4 border rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Salary</p>
          <p className="text-2xl font-bold text-green-700">₹{totalSalary}</p>
        </div>

        <div className="bg-red-50 p-4 border rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Advance</p>
          <p className="text-2xl font-bold text-red-700">₹{totalAdvance}</p>
        </div>

        <div className="bg-blue-50 p-4 border rounded-xl shadow">
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-2xl font-bold text-blue-700">₹{balance}</p>
        </div>

      </div>

      {/* ===== Payment Table ===== */}
      <div className="bg-white rounded-xl shadow border overflow-auto">
        <h3 className="text-lg font-semibold px-4 py-3 border-b bg-gray-50">
          Payment History
        </h3>

        {loading ? (
          <p className="p-4 text-gray-500">Loading...</p>
        ) : payments.length === 0 ? (
          <p className="p-4 text-gray-400 italic">No payments found.</p>
        ) : (
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Amount</th>
                <th className="px-4 py-2 border">Note</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{p.date}</td>
                  <td
                    className={`px-4 py-2 border font-semibold ${
                      p.type === "Salary" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {p.type}
                  </td>
                  <td className="px-4 py-2 border">₹{p.amount}</td>
                  <td className="px-4 py-2 border">
                    {p.note || <span className="text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default PaymentsByWorker;
