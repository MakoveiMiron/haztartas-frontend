import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersProgress, setUsersProgress] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTaskData, setEditTaskData] = useState(null);
  const [editedUsers, setEditedUsers] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const hardcodedUsers = ["Bob", "Rien", "Mendel", "Miron"];

  useEffect(() => {
    if (!token) {
      navigate("/login");
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
        const taskRes = await axios.get(
          "https://haztartas-backend-production.up.railway.app/api/tasks",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTasks(taskRes.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchUserProgress();
  }, [navigate, token]);

  const handleBackToDashboard = () => navigate("/dashboard", { replace: true });

  const handleCreateTask = async () => {
    if (newTask && selectedUsers.length > 0 && selectedDays.length > 0) {
      try {
        await axios.post(
          "https://haztartas-backend-production.up.railway.app/api/tasks",
          {
            name: newTask,
            assignedUsers: selectedUsers,
            days: selectedDays,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Feladat sikeresen létrehozva");
        setNewTask("");
        setSelectedUsers([]);
        setSelectedDays([]);
        setEditedUsers([]);
        location.reload();
      } catch (error) {
        alert("Hiba történt a feladat létrehozásakor");
        console.error(error);
      }
    } else {
      alert("Kérlek, töltsd ki az összes mezőt.");
    }
  };

  const handleEditTask = (task) => {
    setEditTaskData(task);
    setNewTask(task.name);
    setSelectedDays(task.days);
    setSelectedUsers(task.assignedUsers || []);
    setEditedUsers(task.assignedUsers || []);
    setShowEditModal(true);
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(
        `https://haztartas-backend-production.up.railway.app/api/tasks/delete/${taskId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditedUsers([]);
      location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const handleSaveEdit = async () => {
    if (editTaskData && newTask && selectedDays.length > 0) {
      try {
        await axios.put(
          `https://haztartas-backend-production.up.railway.app/api/tasks/update/${editTaskData.id}`,
          {
            name: newTask,
            assignedUsers: editedUsers,
            days: selectedDays,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Feladat sikeresen frissítve");
        setShowEditModal(false);
        setSelectedDays([]);
        setEditedUsers([]);
        location.reload();
      } catch (error) {
        alert("Hiba történt a feladat frissítésekor");
        console.error(error);
      }
    } else {
      alert("Kérlek, töltsd ki az összes mezőt.");
    }
  };

  return (
    <div className={`admin-panel-container ${showEditModal ? "modal-active" : ""}`}>
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

          <div className="user-selection">
            <label className="label">Felhasználók</label>
            {hardcodedUsers.map((user) => (
              <div key={user} className="checkbox">
                <input
                  type="checkbox"
                  value={user}
                  checked={selectedUsers.includes(user)}
                  onChange={() =>
                    setSelectedUsers((prev) =>
                      prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
                    )
                  }
                />
                <label>{user}</label>
              </div>
            ))}
          </div>

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

          <button className="create-btn" onClick={handleCreateTask}>
            Feladat létrehozása
          </button>
        </div>

        <div className="task-list">
          <h2>Feladatok</h2>
          {tasks.map((task) => (
            <div key={task.id} className="task-item">
              <span>{task.name}</span>
              <button onClick={() => handleEditTask(task)}>Szerkesztés</button>
              <button onClick={() => handleDelete(task.id)}>Törlés</button>
            </div>
          ))}
        </div>
      </div>

      {showEditModal && <div className="modal-overlay" onClick={() => setShowEditModal(false)}></div>}

      {showEditModal && (
        <div className="edit-modal">
          <div className="modal-content">
            <h2>Feladat szerkesztése</h2>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Feladat neve"
            />

            <div className="user-selection">
              <label className="label">Felhasználók</label>
              {hardcodedUsers.map((user) => (
                <div key={user} className="checkbox">
                  <input
                    type="checkbox"
                    value={user}
                    checked={editedUsers.includes(user)}
                    onChange={() =>
                      setEditedUsers((prev) =>
                        prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
                      )
                    }
                  />
                  <label>{user}</label>
                </div>
              ))}
            </div>

            <button className="save-btn" onClick={handleSaveEdit}>Mentés</button>
            <button className="close-btn" onClick={() => setShowEditModal(false)}>Mégse</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
