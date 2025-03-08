import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import Dashboard from './pages/Dashboard';
import Login from './Login';
import AdminPanel from './pages/AdminPanel';

const router = (
  <Router basename="/haztartas-frontend">
    <Routes>
      <Route path="/" element={<Login />}>
        <Route path="user/dashboard" element={<Dashboard />} />
        <Route path="user/admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  </Router>
);

export default router;
