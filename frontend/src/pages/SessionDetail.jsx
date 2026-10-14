import React, { useEffect, useState } from 'react';
import { fetchSessionEvents } from '../lib/api';
import { ArrowLeft, MousePointer, Eye, Clock, Globe } from 'lucide-react';

export default function SessionDetail({ sessionId, onBack }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const res = await fetchSessionEvents(sessionId);
        setEvents(res.events || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (sessionId) {
      loadEvents();
    }
  }, [sessionId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Session Journey</h1>
          <p className="font-mono text-xs text-indigo-400 mt-0.5">{sessionId}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {loading ? (
          <div className="text-center text-slate-500 py-10">Fetching timeline...</div>
        ) : error ? (
          <div className="text-rose-400 py-4">{error}</div>
        ) : events.length === 0 ? (
          <div className="text-slate-500 py-10 text-center">No events found for this session.</div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {events.map((ev, idx) => {
              const isClick = ev.event_type === 'click';
              return (
                <div key={ev.id || idx} className="relative flex items-start gap-4">
                  <div
                    className={`absolute -left-6 mt-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-slate-900 ${
                      isClick ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                    }`}
                  >
                    {isClick ? <MousePointer className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 flex-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isClick
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {ev.event_type.toUpperCase()}
                      </span>
                      <div className="flex items-center text-xs text-slate-400 gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-2 font-mono break-all">
                      <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{ev.page_url}</span>
                    </div>

                    {isClick && ev.click && (
                      <div className="mt-3 text-xs bg-slate-900 border border-slate-800/80 rounded px-3 py-2 text-slate-400 flex flex-wrap gap-x-4 gap-y-1 font-mono">
                        <span>Coordinates: <strong className="text-slate-200">X={ev.click.x}, Y={ev.click.y}</strong></span>
                        {ev.click.viewport_width && (
                          <span>Viewport: <strong className="text-slate-200">{ev.click.viewport_width}x{ev.click.viewport_height}</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
