import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css"; // 📌 Import CSS for styling

const DAYS_OF_WEEK = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [completedDays, setCompletedDays] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    axios
      .get(`https://haztartas-backend-production.up.railway.app/api/tasks/progress/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const allTasks = response.data;
        
        // Az aktuális user feladatai előre kerülnek
        const sortedTasks = allTasks.sort((a, b) => {
          if (a.userId === user.id) return -1;
          if (b.userId === user.id) return 1;
          return 0;
        });

        setTasks(sortedTasks);

        const initialCompletedDays = {};
        sortedTasks.forEach((task) => {
          initialCompletedDays[task.id] = task.days.reduce((acc, day) => {
            acc[day] = task.progress?.[day] || false;
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
  }, [token, user?.id, navigate]);

  const handleAdminPanelClick = () => {
    navigate("/admin", { replace: true });
  };

  const handleDayCompletion = (taskId, day) => {
    if (!tasks.find(task => task.id === taskId)?.userId === user.id) {
      return; // Ha a feladat nem az aktuális useré, nem enged bepipálni
    }

    setCompletedDays((prevState) => {
      const updatedDays = { ...prevState };
      if (!updatedDays[taskId][day]) { // ✅ Csak be lehet pipálni, ki nem
        updatedDays[taskId][day] = true;

        axios
          .put(
            `https://haztartas-backend-production.up.railway.app/api/tasks/day-progress/${taskId}/${day}`,
            { day: day, is_completed: true },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then(() => {
            console.log(`Progress for task ${taskId} on ${day} updated!`);
          })
          .catch((error) => {
            console.error("Error updating task progress:", error);
          });
      }

      return updatedDays;
    });
  };

  return (
    <div className="dashboard-container">
      <h1 className="text-3xl font-bold mb-4">Heti feladatok</h1>

      {user?.isAdmin && (
        <button onClick={() => navigate("/admin", { replace: true })} className="admin-button">
          Admin Panel
        </button>
      )}

      <div className="overflow-x-auto">
        <table className="task-table">
          <thead>
            <tr>
              <th>Felhasználó</th>
              <th>Feladat</th>
              {DAYS_OF_WEEK.map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className={task.userId === user.id ? "highlighted-row" : ""}>
                <td>{task.username}</td> {/* 🔹 Megjelenik, hogy kié a feladat */}
                <td>{task.name}</td>

                {DAYS_OF_WEEK.map((day) => (
                  <td key={day}>
                    {task.days?.includes(day) ? (
                      <input
                        type="checkbox"
                        checked={completedDays[task.id]?.[day] || false}
                        onChange={() => handleDayCompletion(task.id, day)}
                        disabled={completedDays[task.id]?.[day] || task.userId !== user.id} // ✅ Mások feladatait nem lehet módosítani
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
    </div>
  );
};

export default Dashboard;
