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
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentHour = new Date().getHours();
  const today = new Date().toLocaleString("hu-HU", { weekday: "long" });

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token]);

  const handleBackToDashboard = () => navigate("/dashboard", { replace: true });

  return (
    <div className="admin-panel-container">
      {/* Left Panel - Task Management */}
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

          {/* User Selection */}
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
                      prev.includes(user.id) ? prev.filter((id) => id !== user.id) : [...prev, user.id]
                    )
                  }
                />
                <label>{user.username}</label>
              </div>
            ))}
          </div>

          {/* Day Selection */}
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
                      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]
                    )
                  }
                />
                <label>{day}</label>
              </div>
            ))}
          </div>

          <button className="create-btn">Feladat létrehozása</button>
        </div>

        {/* Show uncompleted tasks only after 8 PM */}
        {currentHour >= 20 && (
          <div className="task-list">
            <h2>El nem készült feladatok</h2>
            {tasks
              .filter((task) => task.days.includes(today))
              .map((task) => (
                <div key={task.id} className="task-item">
                  <span>{task.name}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Right Panel - User Tasks */}
      <div className="right-panel">
        <h2 className="header">Felhasználói feladatok</h2>
        {loading ? (
          <p>Adatok betöltése...</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="user-task-table">
              <h3>{user.username} - Feladatok</h3>
              <div className="task-table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Feladat</th>
                      {["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"].map((day) => (
                        <th key={day}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks
                      .filter((task) => task.assignedUsers.includes(user.id) && task.days.includes(today))
                      .map((task) => (
                        <tr key={task.id}>
                          <td>{task.name}</td>
                          {Array(7).fill(null).map((_, idx) => (
                            <td key={idx}><input type="checkbox" disabled /></td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
