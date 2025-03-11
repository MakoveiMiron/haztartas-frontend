import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css'; // Import the CSS file

const Login = ({ setIsAuthenticated }) => {  // Accept the callback from App.jsx
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://haztartas-backend-production.up.railway.app/api/auth/login', { username, password });
      console.log("resp", response);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set isAuthenticated to true after successful login
      setIsAuthenticated(true);  // Update state in App.jsx
      navigate('/dashboard');  // Navigate to dashboard
    } catch (error) {
      setError('Hibás felhasználónév vagy jelszó!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Bejelentkezés</h1>
        <form onSubmit={handleLogin}>
          <div className="mt-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Felhasználónév"
            />
          </div>
          <div className="mt-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Jelszó"
            />
          </div>
          <button type="submit" className="mt-4">
            Bejelentkezés
          </button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};

export default Login;
