import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://haztartas-backend-production.up.railway.app/api/auth/login', { username, password });
            const { token } = response.data;
            localStorage.setItem('token', token);  // Store token in localStorage
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;  // Set token in Axios defaults
            navigate("/dashboard");  // Redirect to dashboard or home
        } catch (error) {
            setError('Invalid username or password');
        }
    };

    return (
        <div>
            <form onSubmit={handleLogin}>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                {error && <p>{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
