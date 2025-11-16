import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getWorker } from "./workerAuth";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";

const WorkerPayments = () => {
  const worker = getWorker();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/payments/worker/${worker.id}`
      );
      const data = res.data || [];
      setPayments(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Calculate Summary
  const totalSalary = payments
    .filter((p) => p.type === "Salary")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalAdvance = payments
    .filter((p) => p.type === "Advance")
    .reduce((sum, p) => sum + p.amount, 0);

  const balance = totalSalary - totalAdvance;

  return (
    <div className="p-6 space-y-8 animate-fadeIn">
      <h1 className="text-3xl font-bold mb-4">Your Payments</h1>

      {/* Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        {/* Total Salary */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Total Salary Received</h2>
            <ArrowDownCircle className="text-green-600" size={28} />
          </div>
          <p className="text-3xl font-bold mt-2 text-green-700">₹{totalSalary}</p>
        </div>

        {/* Total Advance */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Total Advance Taken</h2>
            <ArrowUpCircle className="text-red-600" size={28} />
          </div>
          <p className="text-3xl font-bold mt-2 text-red-700">₹{totalAdvance}</p>
        </div>

        {/* Balance */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Salary Balance</h2>
            <Wallet className="text-blue-600" size={28} />
          </div>
          <p className="text-3xl font-bold mt-2 text-blue-700">₹{balance}</p>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-xl shadow border overflow-auto mt-6">
        <h2 className="text-xl font-semibold px-4 py-3 border-b bg-gray-50">
          Payment History
        </h2>

        {loading ? (
          <p className="p-4">Loading...</p>
        ) : payments.length === 0 ? (
          <p className="p-4 text-gray-500">No payment records found.</p>
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

export default WorkerPayments;
