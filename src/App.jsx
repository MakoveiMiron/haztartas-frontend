import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Set Authorization header for all requests
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = decodedToken.exp * 1000;
        if (Date.now() < expirationTime) {
          setIsAuthenticated(true);
          setUser(JSON.parse(storedUser)); // User data set
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
  }, []);

  return (
    <>
      {/* Include the routes for the authenticated user here */}
      {isAuthenticated ? navigate("/user/dashboard") : navigate("/user/login")}
      {/* You can place shared components or layouts for authenticated users here */}
    </>
  );
};

export default App;
