import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Dashboard from "./pages/Dashboard";
import Login from "./Login";
import AdminPanel from "./pages/AdminPanel";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/admin",
        element: <AdminPanel />,
      },
      {
        path: "/",
        element: <Navigate to="/dashboard" />,
      },
    ],
  },
], { basename: '/haztartas-frontend' }); // Base path a React Router-nek

export default router;
