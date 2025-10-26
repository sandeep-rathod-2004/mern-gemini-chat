import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";

const API_URL = import.meta.env.VITE_API_URL;

export default function Chat() {
  const navigate = useNavigate();
  const rawToken = localStorage.getItem("token") || "";
  const token = rawToken.replace(/"/g, ""); // Safe parsing
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser?.id || null;
  const userName = storedUser?.name || "Anonymous";

  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [joinGroupId, setJoinGroupId] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const socketRef = useRef(null);

  /* ---------- Redirect if not logged in ---------- */
  useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
      return;
    }
    fetchGroups();
  }, []);

  /* ---------- Fetch Groups ---------- */
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data || []);
    } catch (err) {
      console.error("fetch groups error:", err);
      setGroups([]);
    }
  };

  /* ---------- Socket Setup ---------- */
  useEffect(() => {
    if (!token) return;
    const socket = io(API_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => console.log("🟢 Socket connected:", socket.id));
    socket.on("disconnect", () =>
      console.log("🔴 Socket disconnected:", socket.id)
    );

    socket.on("previousMessages", (msgs) => setMessages(msgs || []));
    socket.on("newMessage", (msg) => {
      if (msg.groupId === currentGroup?._id) setMessages((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, [token, currentGroup]);

  /* ---------- Join Group ---------- */
  useEffect(() => {
    if (!socketRef.current || !currentGroup) return;
    socketRef.current.emit("joinRoom", { groupId: currentGroup._id });
  }, [currentGroup]);

  /* ---------- Send Message ---------- */
  const handleSend = (text) => {
    if (socketRef.current && currentGroup && text?.trim()) {
      socketRef.current.emit("sendMessage", {
        groupId: currentGroup._id,
        text,
      });
    }
  };

  /* ---------- Create Group ---------- */
  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    try {
      const slug = groupName.toLowerCase().replace(/\s+/g, "-");
      const res = await axios.post(
        `${API_URL}/api/groups`,
        { name: groupName, slug },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data) {
        setGroups((prev) => [...prev, res.data]);
        setCurrentGroup(res.data);
        setGroupName("");
        setInfoMessage(`✅ Created group "${res.data.name}". ID: ${res.data._id}`);
        setTimeout(() => setInfoMessage(""), 5000);
      }
    } catch (err) {
      console.error("create group error:", err);
    }
  };

  /* ---------- Join by Name or ID ---------- */
  const handleJoinGroup = async () => {
    if (!joinGroupId.trim()) return;
    try {
      const res = await axios.get(`${API_URL}/api/groups`);
      const input = joinGroupId.trim().toLowerCase();
      const group =
        res.data.find((g) => g.slug === input) ||
        res.data.find((g) => g._id === input);
      if (group) setCurrentGroup(group);
      else alert("❌ Group not found.");
      setJoinGroupId("");
    } catch (err) {
      console.error("join group error:", err);
    }
  };

  /* ---------- Copy Group ID ---------- */
  const handleCopyGroupId = async () => {
    if (!infoMessage.includes("ID:")) return;
    const id = infoMessage.split("ID:")[1].trim();
    await navigator.clipboard.writeText(id);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  /* ---------- Render ---------- */
  if (!token || !userId) {
    return <div className="text-white p-4">Redirecting to login...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden border-t border-slate-700">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 border-r border-slate-700 p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Groups</h2>
          <ul className="space-y-2 mb-4">
            {groups.length > 0 ? (
              groups.map((group) => (
                <li
                  key={group._id}
                  onClick={() => setCurrentGroup(group)}
                  className={`cursor-pointer rounded-xl px-4 py-2 transition-all ${
                    currentGroup?._id === group._id
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  {group.name} ({group.slug})
                </li>
              ))
            ) : (
              <li className="text-slate-400 italic">No groups available</li>
            )}
          </ul>

          <input
            type="text"
            placeholder="New group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="p-2 rounded mb-2 text-black"
          />
          <button
            onClick={handleCreateGroup}
            className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded mb-4"
          >
            Create Group
          </button>

          <input
            type="text"
            placeholder="Join by name or ID"
            value={joinGroupId}
            onChange={(e) => setJoinGroupId(e.target.value)}
            className="p-2 rounded mb-2 text-black"
          />
          <button
            onClick={handleJoinGroup}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
          >
            Join Group
          </button>

          {infoMessage && (
            <div className="mt-4 p-3 text-sm bg-slate-700 rounded-lg text-green-400 flex items-center justify-between">
              <span className="flex-1 mr-2">{infoMessage}</span>
              <button
                onClick={handleCopyGroupId}
                className="ml-2 bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded text-xs text-white"
              >
                {copySuccess ? "✅ Copied!" : "📋 Copy"}
              </button>
            </div>
          )}
        </aside>

        {/* Main Chat */}
        <main className="flex-1 flex flex-col bg-slate-900/80 backdrop-blur-md">
          <div className="px-6 py-3 border-b border-slate-700 flex items-center justify-between bg-slate-800/70">
            <h1 className="text-lg font-semibold">
              {currentGroup
                ? `${currentGroup.name} (${currentGroup.slug})`
                : "No group selected"}
            </h1>
            <p className="text-sm text-slate-400">💬 {userName}</p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-slate-900 text-white">
            <MessageList messages={messages || []} userId={userId} />
          </div>

          {currentGroup && (
            <div className="p-4 border-t border-slate-700 bg-slate-800/60">
              <MessageInput onSend={handleSend} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
