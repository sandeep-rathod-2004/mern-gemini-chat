import React from "react";

export default function GroupList({ groups, currentGroup, setGroup }) {
  return (
    <ul className="space-y-2">
      {groups.map((group) => (
        <li
          key={group._id}
          onClick={() => setGroup(group._id)}
          className={`cursor-pointer rounded-xl px-4 py-2 transition-all ${
            currentGroup === group._id
              ? "bg-blue-600 text-white shadow-md"
              : "hover:bg-slate-700 text-slate-300"
          }`}
        >
          {group.name}
        </li>
      ))}
    </ul>
  );
}
