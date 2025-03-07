import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './pages/Dashboard';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
        const expirationTime = decodedToken.exp * 1000; // Token expiration time in milliseconds
        if (Date.now() < expirationTime) {
          setIsAuthenticated(true); // Token is valid
        } else {
          localStorage.removeItem('token'); // Remove expired token
        }
      } catch (error) {
        console.log("Token decoding error:", error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  console.log("IsAuthenticated: ", isAuthenticated);  // For debugging

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
