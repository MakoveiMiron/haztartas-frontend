import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const [editedUsers, setEditedUsers] = useState([]);
  const toastNeeded = localStorage.getItem("toast")


  const navigate = useNavigate();
  const token = localStorage.getItem("token");


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
  }, [navigate, token, selectedUsers, editedUsers, selectedDays]);

  if(toastNeeded === "toast"){
    toast.success("Feladat sikeresen módosítva!", { position: "top-right" })
    setTimeout(() => {
      localStorage.removeItem("toast")
    },'3500')   
  }

  const handleBackToDashboard = () => navigate("/dashboard", { replace: true });

  const handleCreateTask = async () => {
    const usersToSend = []
    selectedUsers.forEach((name) => users.forEach((user) => {
      if(user.username === name){
        usersToSend.push(user.id)
      }
    }))
    if (newTask && selectedUsers.length > 0 && selectedDays.length > 0) {
      try {
        await axios.post(
          "https://haztartas-backend-production.up.railway.app/api/tasks",
          {
            name: newTask,
            assignedUsers: usersToSend, // Use username
            days: selectedDays,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Feladat létrehozva!", { position: "top-right" });
        setNewTask('');
        setSelectedUsers([]);
        setSelectedDays([]);
        setEditedUsers([])
      } catch (error) {
        toast.error("Error a feladat létrehozásánál!", { position: "top-right" })
        console.error(error);
      }
    } else {
      toast.error("Kérlek, töltsd ki az összes mezőt.", { position: "top-right" })
    }
  };

  const handleCancel = () => {
    setNewTask("");
    setSelectedDays([]);
    setSelectedUsers([]);
    setEditedUsers([]);
    setShowEditModal(false);
  };

  const handleEditTask = (task) => {
    setEditTaskData(task);
    setNewTask(task.name);
    setSelectedDays(task.days);
    setSelectedUsers(task.assignedUsers || []); // Use assignedUsers (usernames)
    setEditedUsers(task.assignedUsers || []); // Use assignedUsers (usernames) for modal
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
      setEditedUsers([])
      toast.success("Feladat sikeresen törölve!", { position: "top-right" })
    } catch (err) {
      toast.error("Error a feladat törlése közben!", { position: "top-right" })
      console.log(err);
    }
  };

  const handleSaveEdit = async () => {
    const usersToSend = []
    editedUsers.forEach((name) => users.forEach((user) => {
      if(user.username === name){
        usersToSend.push(user.id)
      }
    }))
    if (editTaskData && newTask && selectedDays.length > 0) {
      try {
        await axios.put(
          `https://haztartas-backend-production.up.railway.app/api/tasks/update/${editTaskData.id}`,
          {
            name: newTask,
            assignedUsers: usersToSend, // Use editedUsers (usernames)
            days: selectedDays,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setShowEditModal(false);
        setSelectedDays([]);
        setSelectedUsers([])
        setEditedUsers([]);
        setNewTask("")
        localStorage.setItem("toast", "toast")
        location.reload()
      } catch (error) {
        toast.error("Error a feladat frissítésekor", { position: "top-right" })
        console.error(error);
      }
    } else {
      toast.error("Kérlek, töltsd ki az összes mezőt.", { position: "top-right" })
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
                    value={user.username}
                    checked={selectedUsers.includes(user.username)} // Compare with username
                    onChange={() =>
                      setSelectedUsers((prev) =>
                        prev.includes(user.username)
                          ? prev.filter((username) => username !== user.username)
                          : [...prev, user.username]
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

          <h2>Feladatok</h2>
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-item">
                <span>{task.name}</span>
                <button onClick={() => handleEditTask(task)}>Szerkesztés</button>
                <button onClick={() => handleDelete(task.id)}>Törlés</button>
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
                                  {task.days.includes(day) ? (
                                    <input
                                      type="checkbox"
                                      checked={task.progress[day] || false}
                                      disabled
                                    />
                                  ) : (
                                    <span>-</span> // If the task isn't assigned to this day, display a dash
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

            <div className="user-selection">
              <label className="label">Felhasználók</label>
              {users.map((user) => (
                <div key={user.id} className="checkbox">
                  <input
                    type="checkbox"
                    value={user.username}
                    checked={editedUsers.includes(user.username)} // Use editedUsers for modal checkbox selection
                    onChange={() => {
                      setEditedUsers((prev) =>
                        prev.includes(user.username)
                          ? prev.filter((username) => username !== user.username)
                          : [...prev, user.username]
                      );
                    }}
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

            <button className="save-btn" onClick={() => handleSaveEdit()}>Mentés</button>
            <button className="close-btn" onClick={() => handleCancel()}>
              Mégse
            </button>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdminPanel;
