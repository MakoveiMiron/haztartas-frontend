import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './pages/Dashboard';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ha van token, ellenőrizzük annak érvényességét
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // JWT token dekódolása
        const expirationTime = decodedToken.exp * 1000; // A token lejárati ideje (milliszekundumban)
        if (Date.now() < expirationTime) {
          setIsAuthenticated(true); // Ha a token érvényes, bejelentkezett
        } else {
          localStorage.removeItem('token'); // Ha lejárt, töröljük a tokent
        }
      } catch (error) {
        console.log("Token dekódolási hiba:", error);
        localStorage.removeItem('token');
      }
    }
  }, []);

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
