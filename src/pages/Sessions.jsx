import React, { useEffect, useState } from 'react';
import { fetchSessions } from '../lib/api';
import { RefreshCw, ChevronRight } from 'lucide-react';

export default function Sessions({ onSelectSession }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await fetchSessions();
      setSessions(res.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Active User Sessions</h1>
          <p className="text-sm text-slate-400 mt-0.5">Explore chronological session records and total event counts</p>
        </div>
        <button
          onClick={loadSessions}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No sessions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Session Identifier</th>
                  <th className="py-3 px-4">Total Events</th>
                  <th className="py-3 px-4">Page Views</th>
                  <th className="py-3 px-4">Clicks</th>
                  <th className="py-3 px-4">First Activity</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">View Journey</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {sessions.map((s) => (
                  <tr
                    key={s.session_id}
                    onClick={() => onSelectSession(s.session_id)}
                    className="hover:bg-slate-800/50 cursor-pointer transition group"
                  >
                    <td className="py-3 px-4 font-mono text-xs text-indigo-400 font-semibold">{s.session_id}</td>
                    <td className="py-3 px-4 font-bold text-white">{s.total_events}</td>
                    <td className="py-3 px-4 text-emerald-400">{s.page_views}</td>
                    <td className="py-3 px-4 text-amber-400">{s.clicks}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{new Date(s.first_seen).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{new Date(s.last_seen).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center text-indigo-400 group-hover:text-indigo-300 text-xs font-medium">
                        View <ChevronRight className="w-4 h-4 ml-0.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
