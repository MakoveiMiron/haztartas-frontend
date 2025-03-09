import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem("token")

  if(token){
    navigate('/dashboard')
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://haztartas-backend-production.up.railway.app/api/auth/login', { username, password });
      console.log("resp", response)
      await localStorage.setItem('token', response.data.token);
      await localStorage.setItem('user', JSON.stringify(response.data.user));
      location.reload();
    } catch (error) {
      setError('Hibás felhasználónév vagy jelszó!');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Bejelentkezés</h1>
      <form onSubmit={handleLogin}>
        <div className="mt-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Felhasználónév"
            className="border p-2 w-full"
          />
        </div>
        <div className="mt-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Jelszó"
            className="border p-2 w-full"
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Bejelentkezés
        </button>
      </form>
      {error && <div className="mt-4 text-red-500">{error}</div>}
    </div>
  );
};

export default Login;