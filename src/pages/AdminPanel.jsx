import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [usersWithTasks, setUsersWithTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersWithTasks = async () => {
      try {
        const response = await fetch('http://localhost:5000/tasks/all-users');
        if (!response.ok) throw new Error('Failed to fetch user tasks');

        const data = await response.json();
        
        // Filter out users who have NO uncompleted tasks for today
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const filteredUsers = data.filter(user =>
          user.tasks.some(task => task.progress[today] === false)
        );

        setUsersWithTasks(filteredUsers);
      } catch (error) {
        console.error('Error fetching user tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersWithTasks();
  }, []);

  return (
    <div className="admin-panel">
      <h2>Admin Panel - User Task Overview</h2>
      {loading ? <p>Loading...</p> : <TaskTable usersWithTasks={usersWithTasks} />}
    </div>
  );
};

const TaskTable = ({ usersWithTasks }) => {
  return (
    <div className="task-container">
      {usersWithTasks.length === 0 ? (
        <p>No tasks pending for today.</p>
      ) : (
        usersWithTasks.map(user => (
          <div key={user.userId} className="user-task">
            <h3>{user.username}</h3>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Day</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {user.tasks.map(task => 
                  Object.entries(task.progress).map(([day, completed]) => (
                    <tr key={`${task.id}-${day}`}>
                      <td>{task.name}</td>
                      <td>{day}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={completed}
                          disabled={true} // Admin cannot modify user progress
                        />
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
};

export default AdminPanel;
