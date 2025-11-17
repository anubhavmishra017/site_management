import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { setWorker } from "./workerAuth";

const WorkerLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!phone || !password) {
      toast.error("Enter phone and password");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:8080/api/auth/worker/login",
        { phone, password }
      );

      // data = { worker: {...}, mustResetPassword: true/false }
      const { worker, mustResetPassword } = data;

      if (!worker) {
        toast.error("Login failed");
        return;
      }

      // 🔥 FIX: Save mustResetPassword to localStorage also
      const workerToStore = {
        ...worker,
        phone,
        mustResetPassword
      };

      setWorker(workerToStore);

      if (mustResetPassword) {
        toast("First-time login — please reset your password");
        navigate("/worker/reset-password");
      } else {
        toast.success("Login successful");
        navigate("/worker/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Invalid phone or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4">Worker Login</h1>

        <input
          type="text"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border w-full px-3 py-2 rounded mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
