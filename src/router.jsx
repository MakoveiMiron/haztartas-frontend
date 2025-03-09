import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

const router = (
  <Router basename="/haztartas-frontend">
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  </Router>
);

export default router;
