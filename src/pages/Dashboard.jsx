import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const DAYS_OF_WEEK = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [completedDays, setCompletedDays] = useState({});
  const [usersProgress, setUsersProgress] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // Redirect if no token is present
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchUserProgress = async () => {
      try {
        const result = await axios.get(
          "https://haztartas-backend-production.up.railway.app/api/tasks/progress/all-users",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsersProgress(result.data);
      } catch (err) {
        console.error("Error fetching user progress:", err);
      }
    };

    const fetchData = async () => {
      try {
        const [taskRes, userRes] = await Promise.all([
          axios.get("https://haztartas-backend-production.up.railway.app/api/tasks", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://haztartas-backend-production.up.railway.app/api/tasks/fetch/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTasks(taskRes.data);
        setUsers(userRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // If token exists, fetch tasks and user data
    if (user && token) {
      fetchData();
      fetchUserProgress();
    }
  }, [token, user, navigate]);

  const handleAdminPanelClick = () => {
    navigate("/admin", { replace: true });
  };

  const handleDayCompletion = (taskId, day) => {
    setCompletedDays((prevState) => {
      const updatedDays = { ...prevState };
      updatedDays[taskId] = {
        ...updatedDays[taskId],
        [day]: !updatedDays[taskId]?.[day], // Toggle the completion
      };

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
        })
        .catch((error) => console.error("Error updating task:", error));
    }
  };

  // Feladatok rendezése úgy, hogy a saját feladatok legyenek legfelül
  const sortedUsersProgress = usersProgress.map((userProgress) => {
    return {
      ...userProgress,
      tasks: userProgress.tasks.sort((a, b) => {
        if (a.userId === user.userId && b.userId !== user.userId) return -1;
        if (b.userId === user.userId && a.userId !== user.userId) return 1;
        return 0;
      }),
    };
  });

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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto">
        <table className="task-table">
          <thead>
            <tr>
              <th>Feladat</th>
              {DAYS_OF_WEEK.map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedUsersProgress.map((userProgress) => (
              userProgress.userId !== user.id ?
              <div key={userProgress.userId} className="user-task-table">
                <h3>{userProgress.username} - Feladatok</h3>
                {userProgress.tasks.length > 0 ? (
                  <div className="task-table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Feladat</th>
                          {DAYS_OF_WEEK.map((day) => (
                            <th key={day}>{day}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {userProgress.tasks.map((task) => (
                          <tr key={task.id}>
                            <td>{task.name}</td>
                            {DAYS_OF_WEEK.map((day) => (
                              <td key={day}>
                                {task.days.includes(day) ? (
                                  user.userId === userProgress.userId ? (
                                    <input
                                      type="checkbox"
                                      checked={task.progress[day] || false}
                                      onChange={() => handleDayCompletion(task.id, day)}
                                    />
                                  ) : (
                                    <input
                                      type="checkbox"
                                      checked={task.progress[day] || false}
                                      disabled
                                    />
                                  )
                                ) : (
                                  <span>-</span> // Dash if the task isn't assigned to this day
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Ez a felhasználó nem rendelkezik napi feladatokkal.</p>
                )}
              </div> : null
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
