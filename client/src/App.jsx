import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RepositoryList from './pages/RepositoryList';
import RepositoryDetails from './pages/RepositoryDetails';
import Pricing from './pages/Pricing';
import Billing from './pages/Billing';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#000209' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(155,184,225,0.2)', borderTopColor: '#9BB8E1', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

// Inner page wrapper - handles padding for fixed navbar
const InnerPage = ({ children }) => (
  <div style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem', position: 'relative', zIndex: 2 }}>
    {/* Background glow removed for light theme */}
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 3.2rem', position: 'relative', zIndex: 1 }}>
      {children}
    </div>
  </div>
);

// Route wrapper that decides whether to use InnerPage
const AppRoutes = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      <Navbar />
      <Routes>
        {/* Landing page — full screen, no wrapper */}
        <Route path="/" element={<Landing />} />

        {/* Auth pages — their own full-screen layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Inner pages — use the InnerPage wrapper */}
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/dashboard" element={<ProtectedRoute><InnerPage><Dashboard /></InnerPage></ProtectedRoute>} />
        <Route path="/repositories" element={<ProtectedRoute><InnerPage><RepositoryList /></InnerPage></ProtectedRoute>} />
        <Route path="/repositories/:id" element={<ProtectedRoute><InnerPage><RepositoryDetails /></InnerPage></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><InnerPage><Billing /></InnerPage></ProtectedRoute>} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', background: 'transparent', overflowX: 'clip' }}>
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
