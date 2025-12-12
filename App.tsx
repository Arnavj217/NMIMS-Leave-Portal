import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import AuthForms from './components/AuthForms';
import Dashboard from './components/Dashboard';
import { User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check session on load
    const stored = sessionStorage.getItem('nmims_session');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('nmims_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('nmims_session');
  };

  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      {!currentUser ? (
        <AuthForms onLoginSuccess={handleLogin} />
      ) : (
        <Dashboard user={currentUser} />
      )}
    </Layout>
  );
};

export default App;