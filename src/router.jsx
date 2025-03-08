import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Dashboard from "./pages/Dashboard";
import Login from "./Login";
import AdminPanel from "./pages/AdminPanel";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,  // Main App component to handle authentication and layout
    children: [
      {
        path: "/login",
        element: <Login />,  // Login page
      },
      {
        path: "/dashboard",
        element: <Dashboard />,  // User dashboard page
      },
      {
        path: "/admin",
        element: <AdminPanel />,  // Admin panel page
      },
      {
        path: "/",
        element: <Navigate to="/dashboard" />,  // Default redirect to dashboard if authenticated
      },
    ],
  },
]);

export default router;
