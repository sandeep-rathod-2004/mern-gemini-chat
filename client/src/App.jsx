import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

function App() {
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser) setUser(savedUser);
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <Routes>
      {/* Default route: redirect to chat if logged in */}
      <Route
        path="/"
        element={user ? <Navigate to="/chat" /> : <Navigate to="/login" />}
      />

      {/* Login & Register routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/chat" /> : <Login setUser={setUser} />}
      />
      <Route
        path="/register"
        element={
          user ? <Navigate to="/chat" /> : <Register setUser={setUser} />
        }
      />

      {/* Protected Chat route */}
      <Route
        path="/chat"
        element={user ? <Chat /> : <Navigate to="/login" />}
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
