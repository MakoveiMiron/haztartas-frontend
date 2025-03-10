import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css'; // Importing the CSS file

const AdminPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  if (!token) {
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = () => {
    axios.get('https://haztartas-backend-production.up.railway.app/api/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => setTasks(response.data))
      .catch(error => console.error('Error fetching tasks:', error));
  };

  const fetchUsers = () => {
    axios.get('https://haztartas-backend-production.up.railway.app/api/tasks/fetch/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => setUsers(response.data))
      .catch(error => console.error('Error fetching users:', error));
  };

  const handleCreateTask = () => {
    if (!newTask || selectedUsers.length === 0 || selectedDays.length === 0) {
      return alert("Adj meg egy feladatnevet, válassz legalább egy felhasználót és egy napot!");
    }

    axios.post('https://haztartas-backend-production.up.railway.app/api/tasks', 
      {
        name: newTask,
        assignedUsers: selectedUsers, 
        days: selectedDays 
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then(() => {
      setNewTask('');
      setSelectedUsers([]);
      setSelectedDays([]);
      fetchTasks();
    })
    .catch(error => console.error('Error creating task:', error));
  };

  const handleDeleteTask = (taskId) => {
    axios.delete(`https://haztartas-backend-production.up.railway.app/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => fetchTasks())
      .catch(error => console.error('Error deleting task:', error));
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;

    axios.put(`https://haztartas-backend-production.up.railway.app/api/tasks/${editingTask.id}`, {
      name: editingTask.name,
      assignedUsers: editingTask.assignedUsers,
      days: editingTask.days,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      setEditingTask(null);
      fetchTasks();
    })
    .catch(error => console.error('Error updating task:', error));
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleDayChange = (day) => {
    setSelectedDays(prevState => 
      prevState.includes(day) 
        ? prevState.filter(item => item !== day) 
        : [...prevState, day]
    );
  };

  const handleUserChange = (userId) => {
    setSelectedUsers(prevState => 
      prevState.includes(userId)
        ? prevState.filter(id => id !== userId)
        : [...prevState, userId]
    );
  };

  return (
    <div className="admin-panel-container">
      <div className="left-panel">
        <button 
          onClick={handleBackToDashboard} 
          className="back-button"
        >
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
            {users.map(user => (
              <div key={user.id} className="checkbox">
                <input 
                  type="checkbox" 
                  value={user.id}
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleUserChange(user.id)}
                />
                <label>{user.username}</label>
              </div>
            ))}
          </div>

          <div className="days-selection">
            <label className="label">Napok</label>
            {['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'].map(day => (
              <div key={day} className="checkbox">
                <input 
                  type="checkbox" 
                  value={day}
                  checked={selectedDays.includes(day)}
                  onChange={() => handleDayChange(day)}
                />
                <label>{day}</label>
              </div>
            ))}
          </div>

          <button onClick={handleCreateTask} className="btn create-btn">Feladat létrehozása</button>
        </div>
      </div>

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
                  {tasks.filter(task => task.assignedUsers.includes(user.id)).map(task => (
                    <tr key={task.id}>
                      <td>{task.name}</td>
                      {['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'].map((day) => (
                        <td key={day}>
                          {task.days.includes(day) && (
                            <input
                              type="checkbox"
                              disabled={task.assignedUsers[0] !== user.id} // Admin can't check tasks not assigned to them
                            />
                          )}
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
