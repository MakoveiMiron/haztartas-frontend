import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const AdminPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDays, setSelectedDays] = useState([]); // State to hold selected days
  const [editingTask, setEditingTask] = useState(null);
  const [redirectToDashboard, setRedirectToDashboard] = useState(false); 
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
    axios.get('https://haztartas-backend-production.up.railway.app/api/tasks',  {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => setTasks(response.data))
      .catch(error => console.error('Error fetching tasks:', error));
  };

  const fetchUsers = () => {
    axios.get('https://haztartas-backend-production.up.railway.app/api/tasks/get/users',  {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => setUsers(response.data))
      .catch(error => console.error('Error fetching users:', error));
  };

  const handleCreateTask = () => {
    if (!newTask || !selectedUser || selectedDays.length === 0) {
      return alert("Adj meg egy feladatnevet, válassz felhasználót és jelöld ki a napokat!");
    }

    const token = localStorage.getItem('token'); 

    axios.post('https://haztartas-backend-production.up.railway.app/api/tasks', 
      {
        name: newTask,
        assignedUsers: [selectedUser],
        days: selectedDays // Send the selected days
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(() => {
      setNewTask('');
      setSelectedUser('');
      setSelectedDays([]); // Reset the selected days
      fetchTasks();
    })
    .catch(error => console.error('Error creating task:', error));
  };

  const handleDeleteTask = (taskId) => {
    console.log("taskId", taskId)
    axios.delete(`https://haztartas-backend-production.up.railway.app/api/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
      assignedUsers: [editingTask.assignedTo],
      frequency: editingTask.frequency,
      days: editingTask.days,
    })
    .then(() => {
      setEditingTask(null);
      fetchTasks();
    })
    .catch(error => console.error('Error updating task:', error));
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard",  { replace: true });
  };

  const handleDayChange = (day) => {
    setSelectedDays(prevState => 
      prevState.includes(day) 
        ? prevState.filter(item => item !== day) 
        : [...prevState, day]
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
        <select 
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="border p-2 w-full mt-2"
        >
          <option value="">Válassz felhasználót</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
        
        {/* Checkboxes for days */}
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

      {editingTask && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4">
            <h2 className="text-lg font-bold">Feladat szerkesztése</h2>
            <input 
              type="text"
              value={editingTask.name}
              onChange={(e) => setEditingTask({...editingTask, name: e.target.value})}
              className="border p-2 w-full mt-2"
            />
            <button onClick={handleUpdateTask} className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
              Mentés
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
