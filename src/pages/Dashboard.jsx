import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css"; // 📌 Importáljuk az új CSS fájlt

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
    <div className="dashboard-container">
      {user?.isAdmin && (
        <button
          onClick={() => navigate("/admin", { replace: true })}
          className="admin-button"
        >
          Admin Panel
        </button>
      )}

      <h1 className="header">Mai feladataid</h1>

      <div className="table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th>Feladat</th>
              {DAYS_OF_WEEK.map((day) => (
                <th key={day}>{day}</th>
              ))}
              <th>Kész</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.name}</td>

                {DAYS_OF_WEEK.map((day) => (
                  <td key={day}>
                    {task.days.includes(day) ? (
                      <input
                        type="checkbox"
                        checked={completedDays[task.id]?.[day] || false}
                        onChange={() => handleDayCompletion(task.id, day)}
                        className="task-checkbox"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                ))}

                <td>
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    disabled={!Object.values(completedDays[task.id]).every(Boolean)}
                    className={`complete-btn ${
                      Object.values(completedDays[task.id]).every(Boolean) ? "enabled" : "disabled"
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
