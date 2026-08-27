import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { SessionDetail } from './components/SessionDetail';
import { GitHubAPI } from './api/github';
import { getToken, clearToken } from './utils/auth';
import type { GitHubUser } from './types';

function App() {
  const [token, setToken] = useState<string | null>(getToken());
  const [api, setApi] = useState<GitHubAPI | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const githubApi = new GitHubAPI(token);

        // Verify org membership
        const isMember = await githubApi.verifyOrgMembership();
        if (!isMember) {
          console.error('You must be a member of pbs-digital organization');
          handleLogout();
          return;
        }

        // Get user info
        const userInfo = await githubApi.getUserInfo();

        setApi(githubApi);
        setUser(userInfo);
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        console.error('Invalid token or authentication failed');
        handleLogout();
      }
    };

    initAuth();
  }, [token]);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    clearToken();
    setToken(null);
    setApi(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!token || !api || !user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router basename="/pbs-build-observatory">
      <Routes>
        <Route path="/" element={<Dashboard api={api} user={user} onLogout={handleLogout} />} />
        <Route path="/session/:ticketId" element={<SessionDetail api={api} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
