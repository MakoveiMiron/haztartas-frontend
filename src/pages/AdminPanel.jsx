import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const AdminPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]); // Több felhasználó kiválasztása
  const [selectedDays, setSelectedDays] = useState([]); // Több nap kiválasztása
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
    axios.get('https://haztartas-backend-production.up.railway.app/api/tasks/get/users', {
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
        assignedUsers: selectedUsers, // Több felhasználó ID-je kerül elküldésre
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
    <div className="p-4">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      <button 
        onClick={handleBackToDashboard} 
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
      >
        Vissza a Dashboardra
      </button>

      <div className="mt-4 p-4 border">
        <h2 className="text-lg font-bold">Új feladat hozzáadása</h2>
        <input 
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Feladat neve"
          className="border p-2 w-full mt-2"
        />

        {/* Több felhasználó kiválasztása checkboxokkal */}
        <div className="mt-2">
          <label className="font-bold">Felhasználók</label>
          {users.map(user => (
            <div key={user.id} className="flex items-center">
              <input 
                type="checkbox" 
                value={user.id}
                checked={selectedUsers.includes(user.id)}
                onChange={() => handleUserChange(user.id)}
                className="mr-2"
              />
              <label>{user.username}</label>
            </div>
          ))}
        </div>
        
        {/* Napok kiválasztása checkboxokkal */}
        <div className="mt-2">
          <label className="font-bold">Napok</label>
          {['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'].map(day => (
            <div key={day} className="flex items-center">
              <input 
                type="checkbox" 
                value={day}
                checked={selectedDays.includes(day)}
                onChange={() => handleDayChange(day)}
                className="mr-2"
              />
              <label>{day}</label>
            </div>
          ))}
        </div>

        <button 
          onClick={handleCreateTask} 
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Feladat létrehozása
        </button>
      </div>

      <h2 className="text-xl mt-4">Feladatok</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className="p-2 border-b flex justify-between">
            {task.name} - {task.assignedUsers.join(', ')}
            <div>
              <button 
                onClick={() => handleEditTask(task)} 
                className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
              >
                Szerkesztés
              </button>
              <button 
                onClick={() => handleDeleteTask(task.id)} 
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Törlés
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
