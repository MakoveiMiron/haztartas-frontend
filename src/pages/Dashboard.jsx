import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css"; // 📌 Import CSS for styling

const DAYS_OF_WEEK = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [completedDays, setCompletedDays] = useState({});
  const [completedTasks, setCompletedTasks] = useState(new Set()); // Track completed tasks
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  location.reload()
  useEffect(() => {
    // Redirect if no token is present
    if (!token) {
      navigate("/login", { replace: true });
    }
    
    // If there is a user and token, proceed with fetching tasks
    if (user && token) {
      axios
        .get(`https://haztartas-backend-production.up.railway.app/api/tasks/get/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const fetchedTasks = response.data;
          setTasks(fetchedTasks);

          const initialCompletedDays = {};
          fetchedTasks.forEach((task) => {
            initialCompletedDays[task.id] = task.days.reduce((acc, day) => {
              acc[day] = task.progress && task.progress[day] ? task.progress[day] : false;
              return acc;
            }, {});
          });

          setCompletedDays(initialCompletedDays);

          const completedTaskIds = new Set(fetchedTasks.filter(task => task.is_completed).map(task => task.id));
          setCompletedTasks(completedTaskIds);
        })
        .catch((error) => {
          console.error("Error fetching tasks:", error);
        });
    }
  }, [token, user, navigate]);

  const handleAdminPanelClick = () => {
    navigate("/admin", { replace: true });
  };

  const handleDayCompletion = (taskId, day) => {
    setCompletedDays((prevState) => {
      const updatedDays = { ...prevState };
      updatedDays[taskId][day] = !updatedDays[taskId][day];

      axios
        .put(
          `https://haztartas-backend-production.up.railway.app/api/tasks/day-progress/${taskId}/${day}`,
          {
            day: day,
            is_completed: updatedDays[taskId][day],
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          console.log(`Progress for task ${taskId} on ${day} updated!`);
        })
        .catch((error) => {
          console.error("Error updating task progress:", error);
        });

      return updatedDays;
    });
  };

  const handleCompleteTask = (taskId) => {
    const allDaysCompleted = Object.values(completedDays[taskId] || {}).every(Boolean);

    if (allDaysCompleted) {
      axios
        .put(
          `https://haztartas-backend-production.up.railway.app/api/tasks/complete/${taskId}`,
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
          setCompletedTasks((prevCompletedTasks) => new Set(prevCompletedTasks).add(taskId));
        })
        .catch((error) => console.error("Error updating task:", error));
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="text-3xl font-bold mb-4">Heti feladataid</h1>

      {user?.isAdmin && (
        <button onClick={handleAdminPanelClick} className="admin-button">
          Admin Panel
        </button>
      )}

      <div className="overflow-x-auto">
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
                    {task.days?.includes(day) ? (
                      <input
                        type="checkbox"
                        checked={completedDays[task.id]?.[day] || false}
                        onChange={() => handleDayCompletion(task.id, day)}
                        disabled={completedDays[task.id]?.[day] || false}
                        className="task-checkbox"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                ))}

                <td>
                  {task.is_completed ? (
                    <span>Feladat kész a hétre</span>
                  ) : (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={completedTasks.has(task.id)}
                      className={`complete-btn ${completedTasks.has(task.id) ? "disabled" : "enabled"}`}
                    >
                      {completedTasks.has(task.id) ? "Feladat kész a hétre" : "Kész"}
                    </button>
                  )}
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
