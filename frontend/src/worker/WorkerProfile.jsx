// src/worker/WorkerProfile.jsx
import { getWorker } from "./workerAuth";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  CalendarDays,
  Briefcase,
  ShieldCheck,
} from "lucide-react";

import PaymentsByWorker from "../components/PaymentsByWorker"; // ⬅ Added

const WorkerProfile = () => {
  const navigate = useNavigate();
  const worker = getWorker();

  if (!worker) {
    navigate("/worker/login");
    return null;
  }

  // Format join date nicely
  const formatDate = (date) => {
    if (!date) return "NA";
    try {
      return new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  return (
    <div className="p-6 space-y-10 animate-fadeIn">
      
      {/* PROFILE CARD */}
      <div className="bg-white shadow rounded-xl p-6 border">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          {/* Profile Avatar */}
          <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
            {worker.name?.slice(0, 1).toUpperCase()}
          </div>

          <div>
            <h1 className="text-2xl font-bold">Worker Profile</h1>
            <p className="text-gray-500 text-sm">Your personal details</p>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

          <div className="flex items-start gap-2">
            <User size={18} className="text-blue-600 mt-1" />
            <div>
              <strong>Name:</strong>
              <div>{worker.name}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone size={18} className="text-green-600 mt-1" />
            <div>
              <strong>Phone:</strong>
              <div>{worker.phone}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Briefcase size={18} className="text-purple-600 mt-1" />
            <div>
              <strong>Role:</strong>
              <div>{worker.role}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Briefcase size={18} className="text-orange-600 mt-1" />
            <div>
              <strong>Rate Per Day:</strong>
              <div>₹{worker.ratePerDay}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Briefcase size={18} className="text-blue-600 mt-1" />
            <div>
              <strong>Project:</strong>
              <div>{worker.project?.name || "Not assigned"}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <User size={18} className="text-gray-700 mt-1" />
            <div>
              <strong>Aadhaar Number:</strong>
              <div>{worker.aadhaarNumber || worker.aadharNumber || "NA"}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin size={18} className="text-red-600 mt-1" />
            <div>
              <strong>Address:</strong>
              <div>{worker.address || "NA"}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CalendarDays size={18} className="text-blue-600 mt-1" />
            <div>
              <strong>Joined Date:</strong>
              <div>{formatDate(worker.joinedDate)}</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <ShieldCheck
              size={18}
              className={
                worker.policeVerified
                  ? "text-green-600 mt-1"
                  : "text-red-600 mt-1"
              }
            />
            <div>
              <strong>Police Verified:</strong>
              <div>{worker.policeVerified ? "✔ Yes" : "✖ No"}</div>
            </div>
          </div>

        </div>

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/worker/dashboard")}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ← Back to Dashboard
        </button>

      </div>

      {/* ===================== PAYMENTS SECTION ===================== */}
      <div className="bg-white shadow rounded-xl p-6 border mt-4">
        <h2 className="text-xl font-semibold mb-3">Payments</h2>
        <PaymentsByWorker workerId={worker.id} />
      </div>

    </div>
  );
};

export default WorkerProfile;
