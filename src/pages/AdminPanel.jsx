import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentHour = new Date().getHours();
  const today = new Date().toLocaleString("hu-HU", { weekday: "long" }); // Aktuális nap magyarul

  if (!token) {
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = () => {
    axios
      .get("https://haztartas-backend-production.up.railway.app/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setTasks(response.data))
      .catch((error) => console.error("Error fetching tasks:", error));
  };

  const fetchUsers = () => {
    axios
      .get(
        "https://haztartas-backend-production.up.railway.app/api/tasks/fetch/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="admin-panel-container">
      {/* Bal panel - Feladatok kezelése */}
      <div className="left-panel">
        <button onClick={handleBackToDashboard} className="back-button">
          Vissza a Dashboardra
        </button>

        <div className="task-management">
          <h2>Feladat létrehozása</h2>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Feladat neve"
            className="input-field"
          />

          {/* Felhasználók kiválasztása */}
          <div className="user-selection">
            <label className="label">Felhasználók</label>
            {users.map((user) => (
              <div key={user.id} className="checkbox">
                <input
                  type="checkbox"
                  value={user.id}
                  checked={selectedUsers.includes(user.id)}
                  onChange={() =>
                    setSelectedUsers((prev) =>
                      prev.includes(user.id)
                        ? prev.filter((id) => id !== user.id)
                        : [...prev, user.id]
                    )
                  }
                />
                <label>{user.username}</label>
              </div>
            ))}
          </div>

          {/* Napok kiválasztása */}
          <div className="days-selection">
            <label className="label">Napok</label>
            {["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"].map((day) => (
              <div key={day} className="checkbox">
                <input
                  type="checkbox"
                  value={day}
                  checked={selectedDays.includes(day)}
                  onChange={() =>
                    setSelectedDays((prev) =>
                      prev.includes(day)
                        ? prev.filter((item) => item !== day)
                        : [...prev, day]
                    )
                  }
                />
                <label>{day}</label>
              </div>
            ))}
          </div>

          <button className="btn create-btn">Feladat létrehozása</button>
        </div>

        {/* Csak 20 óra után jelenítse meg az el nem készült feladatokat */}
        {currentHour >= 20 && (
          <div className="task-list">
            <h2>El nem készült feladatok</h2>
            {tasks
              .filter((task) => task.days.includes(today)) // Csak a mai napra szólókat szűrjük
              .map((task) => (
                <div key={task.id} className="task-item">
                  <span>{task.name}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Jobb panel - Felhasználók feladatai */}
      <div className="right-panel">
        <h2 className="header">Felhasználói feladatok</h2>
        {users.map((user) => (
          <div key={user.id} className="user-task-table">
            <h3>{user.username} - Feladatok</h3>
            <div className="task-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Feladat</th>
                    <th>Hétfő</th>
                    <th>Kedd</th>
                    <th>Szerda</th>
                    <th>Csütörtök</th>
                    <th>Péntek</th>
                    <th>Szombat</th>
                    <th>Vasárnap</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks
                    .filter(
                      (task) =>
                        task.assignedUsers.includes(user.id) &&
                        task.days.includes(today) // Csak az adott user mai napi feladatai
                    )
                    .map((task) => (
                      <tr key={task.id}>
                        <td>{task.name}</td>
                        {["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"].map((day) => (
                          <td key={day}>
                            {task.days.includes(day) && <input type="checkbox" disabled />}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
