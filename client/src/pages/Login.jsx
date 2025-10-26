import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });

      if (res.data.success) {
        // ✅ Proper token storage (no quotes)
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate("/chat");
      } else {
        setError("Email not registered. Please register first.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-900 to-purple-900">
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Welcome Back 👋</h2>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-xl bg-white/20 text-white placeholder-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-xl bg-white/20 text-white placeholder-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
            required
          />
          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-indigo-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition duration-300"
          >
            Login
          </button>
        </form>
        <p className="text-center text-white mt-4">
          Don’t have an account?{" "}
          <Link to="/register" className="underline font-semibold text-yellow-200 hover:text-yellow-100">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
