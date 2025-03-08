import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom"; // Use Navigate for redirects
import axios from "axios";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Check for token

  // If no token exists, redirect to login
  if (!token) {
    navigate("/user/login");
  }

  const user = JSON.parse(localStorage.getItem("user")); // Get the logged-in user

  useEffect(() => {
    if (user) {
      axios
        .get(
          `https://haztartas-backend-production.up.railway.app/api/tasks?userId=${user.id}`
        )
        .then((response) => {
          setTasks(response.data);
        })
        .catch((error) => {
          console.error("Error fetching tasks:", error);
        });
    }
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Mai feladataid</h1>

      {/* Admin button */}
      {user?.isAdmin && (
        <button
          onClick={() => navigate("/user/admin")} // Use "/admin" for a relative path
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Admin Panel
        </button>
      )}

      <ul className="mt-4">
        {tasks.map((task) => (
          <li key={task.id} className="p-2 border-b flex justify-between">
            {task.name}
            <button className="bg-green-500 text-white px-2 py-1 rounded">
              Kész
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
