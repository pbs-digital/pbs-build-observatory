import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitHubAPI } from '../api/github';
import type { SessionMetadata, GitHubUser } from '../types';
import { SessionCard } from './SessionCard';
import { formatDistanceToNow } from 'date-fns';

interface DashboardProps {
  api: GitHubAPI;
  user: GitHubUser;
  onLogout: () => void;
}

export function Dashboard({ api, user, onLogout }: DashboardProps) {
  const [sessions, setSessions] = useState<SessionMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchSessions = async () => {
    const data = await api.fetchSessions();
    setSessions(data);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const groupedSessions = {
    planning: sessions.filter((s) => s.status === 'planning'),
    looping: sessions.filter((s) => s.status === 'looping'),
    done: sessions.filter((s) => s.status === 'done'),
  };

  const activeSessions = groupedSessions.planning.length + groupedSessions.looping.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PBS Build Observatory</h1>
              <p className="text-sm text-gray-500 mt-1">
                Last updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {activeSessions > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-medium">{activeSessions} active</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full" />
                <span className="text-sm text-gray-700">{user.name}</span>
                <button
                  onClick={onLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading sessions...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Planning column */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                Planning ({groupedSessions.planning.length})
              </h2>
              <div className="space-y-3">
                {groupedSessions.planning.map((session) => (
                  <Link key={session.ticketId} to={`/session/${session.ticketId}`}>
                    <SessionCard session={session} />
                  </Link>
                ))}
                {groupedSessions.planning.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">No sessions in planning</p>
                )}
              </div>
            </div>

            {/* Looping column */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                Looping ({groupedSessions.looping.length})
              </h2>
              <div className="space-y-3">
                {groupedSessions.looping.map((session) => (
                  <Link key={session.ticketId} to={`/session/${session.ticketId}`}>
                    <SessionCard session={session} />
                  </Link>
                ))}
                {groupedSessions.looping.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">No active loops</p>
                )}
              </div>
            </div>

            {/* Done column */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Done ({groupedSessions.done.length})
              </h2>
              <div className="space-y-3">
                {groupedSessions.done.slice(0, 10).map((session) => (
                  <Link key={session.ticketId} to={`/session/${session.ticketId}`}>
                    <SessionCard session={session} />
                  </Link>
                ))}
                {groupedSessions.done.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">No completed sessions</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
