import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Basic form validation
    if (!username || !password) {
      setError("Felhasználónév és jelszó szükséges!");
      return;
    }

    axios
      .post("https://haztartas-backend-production.up.railway.app/api/auth/login", {
        username,
        password,
      })
      .then((response) => {
        const { token, user } = response.data;

        // Store the token and user data in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect to the dashboard after successful login
        navigate("/user/dashboard");
      })
      .catch((error) => {
        setError("Hibás felhasználónév vagy jelszó.");
        console.error("Login error:", error);
      });
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Bejelentkezés</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="username" className="block font-medium">
            Felhasználónév
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 w-full"
            placeholder="Írd be a felhasználónevet"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-medium">
            Jelszó
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full"
            placeholder="Írd be a jelszót"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Bejelentkezés
        </button>
      </form>
    </div>
  );
};

export default Login;
