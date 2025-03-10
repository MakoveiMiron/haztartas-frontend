import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DAYS_OF_WEEK = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [completedDays, setCompletedDays] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login", { replace: true });
  }

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      axios
        .get(`https://haztartas-backend-production.up.railway.app/api/tasks/get/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setTasks(response.data);

          const initialCompletedDays = {};
          response.data.forEach((task) => {
            initialCompletedDays[task.id] = task.days.reduce((acc, day) => {
              acc[day] = false;
              return acc;
            }, {});
          });

          setCompletedDays(initialCompletedDays);
        })
        .catch((error) => {
          console.error("Error fetching tasks:", error);
        });
    }
  }, []);

  const handleDayCompletion = (taskId, day) => {
    setCompletedDays((prevState) => {
      const updatedDays = { ...prevState };
      updatedDays[taskId][day] = !updatedDays[taskId][day];

      return updatedDays;
    });
  };

  const handleCompleteTask = (taskId) => {
    const allDaysCompleted = Object.values(completedDays[taskId]).every(Boolean);

    if (allDaysCompleted) {
      axios
        .put(
          `https://haztartas-backend-production.up.railway.app/api/tasks/${taskId}`,
          { is_completed: true },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          console.log(`Task ${taskId} completed!`);
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === taskId ? { ...task, is_completed: true } : task
            )
          );
        })
        .catch((error) => console.error("Error updating task:", error));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Mai feladataid</h1>

      {user?.isAdmin && (
        <button
          onClick={() => navigate("/admin", { replace: true })}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Admin Panel
        </button>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-lg">
          <thead>
            <tr className="bg-gray-200 text-center">
              <th className="border px-6 py-3 w-1/4 text-left">Feladat</th>
              {DAYS_OF_WEEK.map((day) => (
                <th key={day} className="border px-6 py-3 min-w-[120px]">{day}</th>
              ))}
              <th className="border px-6 py-3 min-w-[150px]">Kész</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border text-center">
                <td className="border px-6 py-3 text-left font-semibold">{task.name}</td>

                {DAYS_OF_WEEK.map((day) => (
                  <td key={day} className="border px-6 py-3">
                    {task.days.includes(day) ? (
                      <input
                        type="checkbox"
                        checked={completedDays[task.id]?.[day] || false}
                        onChange={() => handleDayCompletion(task.id, day)}
                        className="w-6 h-6"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                ))}

                <td className="border px-6 py-3">
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={!Object.values(completedDays[task.id]).every(Boolean)}
                    className={`px-6 py-3 text-lg rounded ${
                      Object.values(completedDays[task.id]).every(Boolean)
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    Kész
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
