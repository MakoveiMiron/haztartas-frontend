import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Ellenőrizzük a token-t

  if (!token) {
    navigate("#/login");
  }

  const user = JSON.parse(localStorage.getItem("user")); // Bejelentkezett felhasználó
  console.log(user.id)

  useEffect(() => {
    if (user) {
      axios
        .get(
          `https://haztartas-backend-production.up.railway.app/api/tasks/${user.id}`
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

      {/* Admin gomb */}
      {user?.isAdmin && (
        <button
          onClick={() => navigate("#/admin")}
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
