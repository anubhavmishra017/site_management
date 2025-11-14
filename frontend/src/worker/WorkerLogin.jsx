import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const WorkerLogin = () => {
  const navigate = useNavigate();
  const [workerId, setWorkerId] = useState("");

  const handleLogin = () => {
    if (!workerId) {
      toast.error("Enter your Worker ID");
      return;
    }

    // For now just redirect
    // In future: verify from backend
    localStorage.setItem("workerId", workerId);
    toast.success("Login successful!");
    navigate("/worker/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4">Worker Login</h1>

        <input
          type="text"
          placeholder="Enter Worker ID"
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          className="border w-full px-3 py-2 rounded mb-4"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default WorkerLogin;
