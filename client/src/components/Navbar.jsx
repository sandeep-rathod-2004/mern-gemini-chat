import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 shadow-lg">
      <h1 className="text-lg font-bold tracking-wide">💬 Gemini Chat</h1>
      <div className="flex items-center gap-4">
        <span className="font-medium">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-indigo-600 px-3 py-1 rounded-md font-semibold hover:bg-indigo-100 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
