import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { Users, MousePointer, Eye, Activity, RefreshCw } from 'lucide-react';
import { fetchSessions } from '../lib/api';

export default function Overview({ onSelectSession }) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchSessions();
      setSessions(res.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalSessions = sessions.length;
  const totalEvents = sessions.reduce((acc, s) => acc + (s.total_events || 0), 0);
  const totalPageViews = sessions.reduce((acc, s) => acc + (s.page_views || 0), 0);
  const totalClicks = sessions.reduce((acc, s) => acc + (s.clicks || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Analytics Overview</h1>
          <p className="text-sm text-slate-400 mt-0.5">Real-time user engagement and behavioral telemetry</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          Failed to load telemetry: {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sessions" value={totalSessions} subtitle="Unique persisted sessions" icon={Users} color="indigo" />
        <StatCard title="Total Events" value={totalEvents} subtitle="Ingested interactions" icon={Activity} color="sky" />
        <StatCard title="Page Views" value={totalPageViews} subtitle="Route loads" icon={Eye} color="emerald" />
        <StatCard title="Clicks Recorded" value={totalClicks} subtitle="Interactive DOM clicks" icon={MousePointer} color="amber" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Recent Sessions</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Querying database...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No user sessions found yet. Interact with the demo page to populate!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Session ID</th>
                  <th className="py-3 px-4">Events</th>
                  <th className="py-3 px-4">Page Views</th>
                  <th className="py-3 px-4">Clicks</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {sessions.slice(0, 10).map((s) => (
                  <tr key={s.session_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-xs text-indigo-400">{s.session_id}</td>
                    <td className="py-3 px-4 font-semibold text-white">{s.total_events}</td>
                    <td className="py-3 px-4 text-emerald-400">{s.page_views}</td>
                    <td className="py-3 px-4 text-amber-400">{s.clicks}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{new Date(s.last_seen).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectSession(s.session_id)}
                        className="px-2.5 py-1 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-500 text-white transition"
                      >
                        Inspect Journey
                      </button>
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
