import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import Signup from './pages/Signup';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in when the page reloads
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route 
          path="/signup" 
          element={!user ? <Signup setUser={setUser} /> : <Navigate to="/dashboard" />} 
        />
        {/* If no user is logged in, show Login. Otherwise, redirect to Dashboard */}
        <Route
          path="/"
          element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />}
        />

        {/* If user is logged in, show Dashboard. Otherwise, kick them to Login */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/" />}
        />

        <Route
          path="/project/:id"
          element={user ? <ProjectDetails user={user} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;