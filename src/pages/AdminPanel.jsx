import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = () => {
    axios.get('https://haztartas-backend-production.up.railway.app/api/tasks')
      .then(response => setTasks(response.data))
      .catch(error => console.error('Error fetching tasks:', error));
  };

  const fetchUsers = () => {
    axios.get('https://haztartas-backend-production.up.railway.app/api/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error('Error fetching users:', error));
  };

  const handleCreateTask = () => {
    if (!newTask || !selectedUser) return alert("Adj meg egy feladatnevet és válassz felhasználót!");

    axios.post('https://haztartas-backend-production.up.railway.app/api/tasks', {
      name: newTask,
      assignedUsers: [selectedUser],
      frequency: "daily", 
      days: ["Monday", "Wednesday"] // fix értékek, de UI-n módosítható lehet
    })
    .then(() => {
      setNewTask('');
      setSelectedUser('');
      fetchTasks();
    })
    .catch(error => console.error('Error creating task:', error));
  };

  const handleDeleteTask = (taskId) => {
    axios.delete(`https://haztartas-backend-production.up.railway.app/api/tasks/${taskId}`)
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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Admin Panel</h1>

      {/* Új feladat hozzáadása */}
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
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
        <button 
          onClick={handleCreateTask} 
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Feladat létrehozása
        </button>
      </div>

      {/* Feladatok listája */}
      <h2 className="text-xl mt-4">Feladatok</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className="p-2 border-b flex justify-between">
            {task.name} - {task.assignedTo}
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

      {/* Feladat szerkesztése modal */}
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
