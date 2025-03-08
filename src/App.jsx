import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./Login"; // Import the Login page

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
      {/* Conditional rendering based on authentication */}
      {isAuthenticated ? (
        <Dashboard user={user} /> // Pass user data to Dashboard component
      ) : (
        <Login /> // Show Login component if not authenticated
      )}
    </>
  );
};

export default App;
