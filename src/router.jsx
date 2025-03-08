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
        path: "/user/login",
        element: <Login />,
      },
      {
        path: "/user/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/user/admin",
        element: <AdminPanel />,
      }
    ],
  },
], { basename: '/haztartas-frontend' });  // No trailing slash here

export default router;
