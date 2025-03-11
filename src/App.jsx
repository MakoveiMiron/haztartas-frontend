import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./Login";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel"; // Admin panel importálása

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // Új loading állapot hozzáadása

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = decodedToken.exp * 1000;
        if (Date.now() < expirationTime) {
          setIsAuthenticated(true);
          setUser(JSON.parse(storedUser)); // Felhasználó adatok beállítása
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.log("Token decoding error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false); // Az aszinkron művelet befejezésével a loading állapotot false-ra állítjuk
  }, []);

  // Ha az adatok még betöltődnek, akkor nem rendereljük a Router-t
  if (loading) {
    return <div>Loading...</div>; // Vagy egy töltési animáció
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        
        {/* Admin panel útvonal */}
        <Route path="/admin" element={isAuthenticated && user?.isAdmin ? <AdminPanel /> : <Navigate to="/dashboard" />} />
        
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
