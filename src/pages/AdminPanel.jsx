import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching tasks and users from the API
    const fetchData = async () => {
      try {
        const tasksResponse = await axios.get('https://example.com/api/tasks');
        const usersResponse = await axios.get('https://example.com/api/fetch/users');
        setTasks(tasksResponse.data);
        setUsers(usersResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks and users', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-panel-container">
      <div className="left-panel">
        <h2>Feladat létrehozása</h2>
        <input
          type="text"
          placeholder="Új feladat neve"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />

        <div className="user-selection">
          <h3>Felhasználók kiválasztása</h3>
          {users.map((user) => (
            <div key={user.id}>
              <input
                type="checkbox"
                value={user.id}
                onChange={() =>
                  setSelectedUsers((prevSelected) =>
                    prevSelected.includes(user.id)
                      ? prevSelected.filter((id) => id !== user.id)
                      : [...prevSelected, user.id]
                  )
                }
              />
              <label>{user.username}</label>
            </div>
          ))}
        </div>

        <div className="days-selection">
          <h3>Napok kiválasztása</h3>
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
            <div key={day}>
              <input
                type="checkbox"
                value={day}
                onChange={() =>
                  setSelectedDays((prevSelected) =>
                    prevSelected.includes(day)
                      ? prevSelected.filter((d) => d !== day)
                      : [...prevSelected, day]
                  )
                }
              />
              <label>{day}</label>
            </div>
          ))}
        </div>

        <button
          onClick={async () => {
            if (newTask && selectedUsers.length > 0 && selectedDays.length > 0) {
              try {
                await axios.post('https://example.com/api/tasks', {
                  name: newTask,
                  assignedUsers: selectedUsers,
                  days: selectedDays
                });
                alert('Feladat sikeresen létrehozva');
                setNewTask('');
                setSelectedUsers([]);
                setSelectedDays([]);
              } catch (error) {
                alert('Hiba történt a feladat létrehozásakor');
                console.error(error);
              }
            } else {
              alert('Kérlek, töltsd ki az összes mezőt.');
            }
          }}
        >
          Feladat létrehozása
        </button>
      </div>

      <div className="right-panel">
        <h2>Felhasználói előrehaladás</h2>
        {loading ? (
          <p>Betöltés...</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id}>
              <h3>{task.name}</h3>
              <ul>
                {task.assignedUsers.map((user) => (
                  <li key={user}>{user}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
