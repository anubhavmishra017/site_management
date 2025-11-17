import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 🔒 Auto-redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("admin") === "true") {
      navigate("/");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!phone || !password) {
      toast.error("Please enter phone and password");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8080/api/admin/login", {
        phone,
        password,
      });

      if (res.data === "LOGIN_SUCCESS") {
        localStorage.setItem("admin", "true");
        toast.success("Admin Login Successful");
        navigate("/");
      }
    } catch (err) {
      toast.error("Invalid phone or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
