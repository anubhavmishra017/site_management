// src/worker/WorkerAttendance.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getWorker } from "./workerAuth";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";

const WorkerAttendance = () => {
  const worker = getWorker();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    from: "",
    to: "",
  });

  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
  });

  const lang = localStorage.getItem("workerLang") || "en";

  const t = (en, hi) => (lang === "hi" ? hi : en);

  // Fetch worker attendance
  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const url = `http://localhost:8080/api/attendance/worker/${worker.id}`;
      const res = await axios.get(url);

      const data = res.data || [];

      // Calculate summary
      const present = data.filter((r) => r.status === "Present").length;
      const absent = data.filter((r) => r.status === "Absent").length;

      setSummary({
        total: data.length,
        present,
        absent,
      });

      setRecords(data);
    } catch (err) {
      console.error(err);
      toast.error(t("Failed to load attendance", "उपस्थिति लोड नहीं हो सकी"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Apply date filter (client-side)
  const filteredRecords = records.filter((r) => {
    const d = new Date(r.date);
    const f = filter.from ? new Date(filter.from) : null;
    const tD = filter.to ? new Date(filter.to) : null;

    if (f && d < f) return false;
    if (tD && d > tD) return false;
    return true;
  });

  return (
    <div className="p-4 space-y-8 animate-fadeIn">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Calendar size={30} className="text-blue-600" />
        <h1 className="text-3xl font-bold">
          {t("Your Attendance", "आपकी उपस्थिति")}
        </h1>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white shadow p-4 rounded border text-center">
          <p className="text-gray-500 text-sm">{t("Total Days", "कुल दिन")}</p>
          <h2 className="text-2xl font-bold">{summary.total}</h2>
        </div>

        <div className="bg-white shadow p-4 rounded border text-center">
          <p className="text-gray-500 text-sm">{t("Present", "उपस्थित")}</p>
          <h2 className="text-2xl font-bold text-green-600">
            {summary.present}
          </h2>
        </div>

        <div className="bg-white shadow p-4 rounded border text-center">
          <p className="text-gray-500 text-sm">{t("Absent", "अनुपस्थित")}</p>
          <h2 className="text-2xl font-bold text-red-600">{summary.absent}</h2>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-lg shadow border flex flex-wrap gap-3 items-center">

        <input
          type="date"
          value={filter.from}
          onChange={(e) => setFilter({ ...filter, from: e.target.value })}
          className="border px-3 py-2 rounded"
        />

        <input
          type="date"
          value={filter.to}
          onChange={(e) => setFilter({ ...filter, to: e.target.value })}
          className="border px-3 py-2 rounded"
        />

        <button
          onClick={fetchAttendance}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {t("Refresh", "रीफ्रेश")}
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-auto">
        {loading ? (
          <p className="p-4">{t("Loading...", "लोड हो रहा है...")}</p>
        ) : filteredRecords.length === 0 ? (
          <p className="p-4 text-gray-500 italic">
            {t("No attendance found", "कोई उपस्थिति नहीं मिली")}
          </p>
        ) : (
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">{t("Date", "तारीख")}</th>
                <th className="px-4 py-2 border">{t("Status", "स्थिति")}</th>
                <th className="px-4 py-2 border">{t("Overtime", "ओवरटाइम")}</th>
                <th className="px-4 py-2 border">{t("Project", "प्रोजेक्ट")}</th>
                <th className="px-4 py-2 border">{t("Pay", "भुगतान")}</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">

                  {/* Date */}
                  <td className="px-4 py-2 border">{r.date}</td>

                  {/* Status */}
                  <td className="px-4 py-2 border">
                    {r.status === "Present" ? (
                      <span className="flex items-center gap-1 text-green-600 font-semibold">
                        <CheckCircle size={16} /> {t("Present", "उपस्थित")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 font-semibold">
                        <XCircle size={16} /> {t("Absent", "अनुपस्थित")}
                      </span>
                    )}
                  </td>

                  {/* Overtime */}
                  <td className="px-4 py-2 border">{r.overtimeHours}</td>

                  {/* Project */}
                  <td className="px-4 py-2 border">
                    {r.project?.name || "-"}
                  </td>

                  {/* Pay */}
                  <td className="px-4 py-2 border">{r.totalPay}</td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default WorkerAttendance;
