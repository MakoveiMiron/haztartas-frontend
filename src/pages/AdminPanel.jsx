import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [usersWithTasks, setUsersWithTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const today = new Date().toLocaleString("hu-HU", { weekday: "long" });

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        const [taskRes, userRes, userTasksRes] = await Promise.all([
          axios.get("https://haztartas-backend-production.up.railway.app/api/tasks", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://haztartas-backend-production.up.railway.app/api/tasks/fetch/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://haztartas-backend-production.up.railway.app/api/tasks/all-users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTasks(taskRes.data);
        setUsers(userRes.data);

        // Filter users who have uncompleted tasks for today
        const filteredUsers = userTasksRes.data.filter(user =>
          user.tasks.some(task => task.progress[today] === false)
        );

        setUsersWithTasks(filteredUsers);
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

        {/* Task Management Section */}
        <TaskManagement users={users} />

        {/* Show uncompleted tasks only after 8 PM */}
        {new Date().getHours() >= 20 && <UncompletedTasks tasks={tasks} today={today} />}
      </div>

      {/* Right Panel - User Task Progress */}
      <div className="right-panel">
        <h2 className="header">Felhasználói feladatok</h2>
        {loading ? <p>Adatok betöltése...</p> : <UserTaskProgress usersWithTasks={usersWithTasks} />}
      </div>
    </div>
  );
};

const TaskManagement = ({ users }) => {
  const [newTask, setNewTask] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);

  return (
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
  );
};

const UncompletedTasks = ({ tasks, today }) => (
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
);

const UserTaskProgress = ({ usersWithTasks }) => (
  <div className="task-container">
    {usersWithTasks.length === 0 ? (
      <p>Nincs el nem végzett feladat ma.</p>
    ) : (
      usersWithTasks.map(user => (
        <div key={user.userId} className="user-task">
          <h3>{user.username} - Feladatok</h3>
          <table className="task-table">
            <thead>
              <tr>
                <th>Feladat</th>
                <th>Nap</th>
                <th>Kész</th>
              </tr>
            </thead>
            <tbody>
              {user.tasks.map(task =>
                Object.entries(task.progress).map(([day, completed]) => (
                  <tr key={`${task.id}-${day}`}>
                    <td>{task.name}</td>
                    <td>{day}</td>
                    <td>
                      <input type="checkbox" checked={completed} disabled />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ))
    )}
  </div>
);

export default AdminPanel;
