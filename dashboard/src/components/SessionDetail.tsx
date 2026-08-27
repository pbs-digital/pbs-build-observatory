import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { GitHubAPI } from '../api/github';
import type { Session } from '../types';

interface SessionDetailProps {
  api: GitHubAPI;
}

export function SessionDetail({ api }: SessionDetailProps) {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'plan' | 'findings' | 'verdict'>('plan');

  useEffect(() => {
    const fetchSession = async () => {
      if (!ticketId) return;
      const data = await api.fetchSession(ticketId);
      setSession(data);
      setLoading(false);

      // Auto-select tab based on content
      if (data?.verdict) {
        setActiveTab('verdict');
      } else if (data?.cycles.length) {
        setActiveTab('findings');
      }
    };

    fetchSession();
    const interval = setInterval(fetchSession, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Session not found</p>
          <Link to="/" className="text-primary hover:underline">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
            ← Back to dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{session.metadata.ticketId}</h1>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span>@{session.metadata.engineer.split('@')[0]}</span>
                <span>•</span>
                <span>{session.metadata.branch}</span>
                <span>•</span>
                <span className="capitalize">{session.metadata.status}</span>
              </div>
            </div>
            {session.metadata.status === 'looping' && (
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Cycle {session.metadata.currentCycle}/{session.metadata.totalCycles}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {session.metadata.evaluators.map((e) => e.replace('evaluator-', '')).join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('plan')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'plan'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Plan {!session.plan && <span className="text-xs text-gray-400">(pending)</span>}
            </button>
            <button
              onClick={() => setActiveTab('findings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'findings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Findings ({session.cycles.length})
            </button>
            <button
              onClick={() => setActiveTab('verdict')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'verdict'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Verdict {!session.verdict && <span className="text-xs text-gray-400">(pending)</span>}
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'plan' && (
          <div className="bg-white rounded-lg shadow p-6">
            {session.plan ? (
              <div className="prose max-w-none">
                <ReactMarkdown>{session.plan}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Plan not yet created</p>
            )}
          </div>
        )}

        {activeTab === 'findings' && (
          <div className="space-y-4">
            {session.cycles.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-center py-8">No findings yet</p>
              </div>
            ) : (
              session.cycles.map((cycle) => (
                <div key={cycle.number} className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Cycle {cycle.number}</h3>
                  </div>
                  <div className="p-6 prose max-w-none">
                    <ReactMarkdown>{cycle.findings}</ReactMarkdown>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'verdict' && (
          <div className="bg-white rounded-lg shadow p-6">
            {session.verdict ? (
              <div className="prose max-w-none">
                <ReactMarkdown>{session.verdict}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Verdict not yet available</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
