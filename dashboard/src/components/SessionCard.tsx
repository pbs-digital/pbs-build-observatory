import { formatDistanceToNow } from 'date-fns';
import type { SessionMetadata } from '../types';

interface SessionCardProps {
  session: SessionMetadata;
}

export function SessionCard({ session }: SessionCardProps) {
  const statusConfig = {
    planning: { icon: '📝', color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800' },
    looping: { icon: '🔄', color: 'bg-blue-50 border-blue-200', text: 'text-blue-800' },
    done: { icon: '✅', color: 'bg-green-50 border-green-200', text: 'text-green-800' },
  };

  const config = statusConfig[session.status];
  const timeAgo = formatDistanceToNow(new Date(session.lastUpdatedAt), { addSuffix: true });

  return (
    <div className={`border rounded-lg p-4 ${config.color} hover:shadow-md transition-shadow cursor-pointer`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{session.ticketId}</h3>
          <p className="text-xs text-gray-600">@{session.engineer.split('@')[0]}</p>
        </div>
        <span className="text-2xl">{config.icon}</span>
      </div>

      {session.status === 'planning' && (
        <div className={`text-sm ${config.text}`}>
          {session.planApproved ? 'Plan drafted' : 'Awaiting approval'}
        </div>
      )}

      {session.status === 'looping' && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Cycle {session.currentCycle}/{session.totalCycles}</span>
          </div>
          {session.evaluators.length > 0 && (
            <div className="text-xs text-gray-500">
              {session.evaluators.map((e) => e.replace('evaluator-', '')).join(', ')}
            </div>
          )}
        </div>
      )}

      {session.status === 'done' && (
        <div className={`text-sm ${config.text}`}>
          Verdict available
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">{timeAgo}</p>
      </div>
    </div>
  );
}
