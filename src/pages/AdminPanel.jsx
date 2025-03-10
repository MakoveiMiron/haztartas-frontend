import React, { useState, useEffect } from "react";
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
  const [usersProgress, setUsersProgress] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTaskData, setEditTaskData] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
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
        setNewTask('');
        setSelectedUsers([]);
        setSelectedDays([]);
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
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (editTaskData && newTask && selectedDays.length > 0) {
      try {
        await axios.put(
          `https://haztartas-backend-production.up.railway.app/api/tasks/${editTaskData.id}`,
          {
            name: newTask,
            days: selectedDays,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Feladat sikeresen frissítve");
        setShowEditModal(false);
        fetchData();
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
      {/* Left Panel - Task Management */}
      {!showEditModal && (
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
                <button>Törlés</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right Panel - User Tasks */}
      {!showEditModal && (
        <div className="right-panel">
          <h2 className="header">Felhasználói feladatok</h2>
          {loading ? (
            <p>Adatok betöltése...</p>
          ) : (
            usersProgress?.map((user) => (
              <div key={user.userId} className="user-task-table">
                <h3>{user.username} - Feladatok</h3>
                {user.tasks.length > 0 ? (
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
                        {user.tasks.map((task) => (
                          <tr key={task.id}>
                            <td>{task.name}</td>
                            {["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"].map((day) => (
                              <td key={day}>
                                <input type="checkbox" checked={task.progress[day] || false} disabled />
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
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Overlay */}
      {showEditModal && <div className="modal-overlay" onClick={() => setShowEditModal(false)}></div>}

      {/* Edit Task Modal */}
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

            <button className="create-btn" onClick={handleSaveEdit}>
              Mentés
            </button>
            <button onClick={() => setShowEditModal(false)} className="cancel-btn">
              Mégse
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
