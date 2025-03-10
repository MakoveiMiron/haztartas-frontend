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

  if (!token) {
    navigate("/login", { replace: true });
  }

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // Check if `user` or `token` are not available
    if (!user || !token) return;

    // Prevent multiple fetches if tasks are already loaded
    if (tasks.length > 0) return;

    axios
      .get(`https://haztartas-backend-production.up.railway.app/api/tasks/get/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const fetchedTasks = response.data;
        setTasks(fetchedTasks);

        // Initialize completedDays with the task days' completion status
        const initialCompletedDays = {};
        fetchedTasks.forEach((task) => {
          initialCompletedDays[task.id] = task.days.reduce((acc, day) => {
            // Set the initial completion status based on the `progress` field
            acc[day] = task.progress && task.progress[day] ? task.progress[day] : false;
            return acc;
          }, {});
        });

        setCompletedDays(initialCompletedDays);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, [user, token, tasks.length]); // Prevent re-fetching once tasks are loaded

  const handleDayCompletion = (taskId, day) => {
    setCompletedDays((prevState) => {
      const updatedDays = { ...prevState };
      updatedDays[taskId][day] = !updatedDays[taskId][day]; // Toggle completion state

      // Send the updated progress to the backend
      axios
        .put(
          `https://haztartas-backend-production.up.railway.app/api/tasks/progress/${taskId}`,
          {
            day: day, // The day being updated
            is_completed: updatedDays[taskId][day], // Completion status of the specific day
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then(() => {
          console.log(`Progress for task ${taskId} on ${day} updated!`);
        })
        .catch((error) => {
          console.error("Error updating task progress:", error);
        });

      return updatedDays; // Return the updated state
    });
  };

  const handleCompleteTask = (taskId) => {
    const allDaysCompleted = Object.values(completedDays[taskId] || {}).every(Boolean);

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
          setCompletedTasks((prevCompletedTasks) => new Set(prevCompletedTasks).add(taskId)); // Mark task as completed
        })
        .catch((error) => console.error("Error updating task:", error));
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="text-3xl font-bold mb-4">Mai feladataid</h1>

      {user?.isAdmin && (
        <button
          onClick={() => navigate("/admin", { replace: true })}
          className="admin-button"
        >
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
                        checked={completedDays[task.id]?.[day] || false} // Ensure checkbox reflects task completion
                        onChange={() => handleDayCompletion(task.id, day)} // Toggle completion on checkbox change
                        disabled={completedDays[task.id]?.[day] || false} // Disable checkbox if already completed
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
                    disabled={completedTasks.has(task.id)} // Disable the button if the task is already completed
                    className={`complete-btn ${
                      completedTasks.has(task.id) ? "disabled" : "enabled"
                    }`}
                  >
                    {completedTasks.has(task.id) ? "Feladat kész a hétre" : "Kész"}
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
