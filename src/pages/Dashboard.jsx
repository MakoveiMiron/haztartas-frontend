import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')); // Bejelentkezett felhasználó

  useEffect(() => {
    if (user) {
      axios.get(`https://haztartas-backend-production.up.railway.app/tasks?userId=${user.id}`)
        .then(response => {
          setTasks(response.data);
        })
        .catch(error => {
          console.error('Error fetching tasks:', error);
        });
    }
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Mai feladataid</h1>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className="p-2 border-b flex justify-between">
            {task.name}
            <button className="bg-green-500 text-white px-2 py-1 rounded">Kész</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
