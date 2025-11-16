import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getWorker, setWorker } from "./workerAuth";

const WorkerResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [worker, setLocalWorker] = useState(null);

  useEffect(() => {
    const w = getWorker();
    if (!w) {
      navigate("/worker/login");
      return;
    }
    setLocalWorker(w);
  }, []);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Fill both fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const payload = {
        workerId: worker.id,
        newPassword,
      };
      await axios.post("http://localhost:8080/api/auth/worker/change-password", payload);
      // update local storage worker object
      const updatedWorker = { ...worker, mustResetPassword: false };
      setWorker(updatedWorker);
      toast.success("Password changed. Redirecting...");
      navigate("/worker/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to change password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4">Reset Password</h1>
        <p className="text-sm text-gray-500 mb-4">Set a new password for security.</p>

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border w-full px-3 py-2 rounded mb-3"
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border w-full px-3 py-2 rounded mb-4"
        />

        <button
          onClick={handleReset}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Set Password
        </button>
      </div>
    </div>
  );
};

export default WorkerResetPassword;
