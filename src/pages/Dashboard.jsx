import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

          // Kezdetben minden napra `false` értéket állítunk be
          const initialCompletedDays = {};
          response.data.forEach((task) => {
            initialCompletedDays[task.id] = task.days.reduce((acc, day) => {
              acc[day] = false; // Kezdetben minden nap nincs kész
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

      // Flip the checkbox state
      updatedDays[taskId][day] = !updatedDays[taskId][day];

      // Ellenőrizzük, hogy minden nap kész-e
      const allDaysCompleted = Object.values(updatedDays[taskId]).every(Boolean);

      // Frissítjük az adatbázist, ha minden nap kész van
      if (allDaysCompleted) {
        axios
          .put(`https://haztartas-backend-production.up.railway.app/api/tasks/${taskId}`, 
          { is_completed: true }, 
          { headers: { Authorization: `Bearer ${token}` } })
          .then(() => console.log(`Task ${taskId} completed!`))
          .catch((error) => console.error("Error updating task:", error));
      }

      return updatedDays;
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Mai feladataid</h1>

      {/* Admin gomb */}
      {user?.isAdmin && (
        <button
          onClick={() => navigate("/admin", { replace: true })}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Admin Panel
        </button>
      )}

      <ul className="mt-4">
        {tasks.map((task) => (
          <li key={task.id} className="p-2 border-b">
            <span className="font-bold">{task.name}</span>
            <div className="mt-2">
              {task.days.map((day) => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={completedDays[task.id]?.[day] || false}
                    onChange={() => handleDayCompletion(task.id, day)}
                    className="mr-2"
                  />
                  {day}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
