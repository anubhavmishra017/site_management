import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    const workerId = localStorage.getItem("workerId");

    if (!workerId) {
      navigate("/worker/login");
      return;
    }

    // Later we will fetch worker details from backend
    setWorker({ id: workerId, name: "Worker " + workerId });
  }, []);

  const cards = [
    { title: "My Tasks", path: "/worker/tasks" },
    { title: "Attendance", path: "/worker/attendance" },
    { title: "Salary & Advance", path: "/worker/salary" },
    { title: "Translate to Hindi 🇮🇳", path: "/worker/hindi" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Hello, {worker?.name}</h1>

      <p className="text-gray-600 mb-6">Welcome to your worker panel</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(card.path)}
            className="bg-white shadow p-6 rounded-xl cursor-pointer hover:bg-blue-50 transition"
          >
            <h2 className="text-xl font-semibold">{card.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerDashboard;
