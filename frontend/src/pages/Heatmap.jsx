import React, { useEffect, useState } from 'react';
import { fetchPages, fetchPageClicks } from '../lib/api';
import { Flame, RefreshCw, Layers, ExternalLink } from 'lucide-react';

export default function Heatmap() {
  const [pages, setPages] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPages() {
      try {
        const res = await fetchPages();
        const pageList = res.pages || [];
        setPages(pageList);
        if (pageList.length > 0) {
          setSelectedUrl(pageList[0].page_url);
        }
      } catch (err) {
        console.error('Failed to load tracked pages:', err);
      }
    }
    loadPages();
  }, []);

  const loadClicks = async (url) => {
    if (!url) return;
    try {
      setLoading(true);
      const res = await fetchPageClicks(url);
      setClicks(res.clicks || []);
    } catch (err) {
      console.error('Failed to load click coordinates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUrl) {
      loadClicks(selectedUrl);
    }
  }, [selectedUrl]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500" />
            Click Heatmap Visualization
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Normalized coordinate mapping across recorded viewport dimensions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedUrl}
            onChange={(e) => setSelectedUrl(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 max-w-sm truncate shadow-sm font-mono"
          >
            {pages.map((p) => (
              <option key={p.page_url} value={p.page_url}>
                {p.page_url} ({p.total_clicks} clicks)
              </option>
            ))}
          </select>

          <button
            onClick={() => loadClicks(selectedUrl)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition shadow-sm"
            title="Refresh clicks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap justify-between items-center mb-4 text-xs text-slate-400 gap-2">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Layers className="w-4 h-4 text-indigo-400" />
            Displaying <strong className="text-amber-400 font-semibold">{clicks.length}</strong> recorded click point(s)
          </span>
          <span className="text-slate-400 italic">
            Normalized ($x / W$, $y / H$) relative to browser viewport dimensions
          </span>
        </div>

        {/* Heatmap Canvas */}
        <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shadow-inner select-none">
          {/* Wireframe Mock Page Layout */}
          <div className="absolute inset-0 opacity-25 pointer-events-none p-6 flex flex-col justify-between">
            <div className="h-10 border-b border-slate-700 flex justify-between items-center pb-2">
              <div className="w-24 h-4 bg-slate-700 rounded"></div>
              <div className="flex gap-4">
                <div className="w-16 h-3 bg-slate-700 rounded"></div>
                <div className="w-16 h-3 bg-slate-700 rounded"></div>
                <div className="w-16 h-3 bg-slate-700 rounded"></div>
              </div>
            </div>

            <div className="my-auto py-12 text-center">
              <div className="w-72 h-6 bg-slate-700 rounded mx-auto mb-3"></div>
              <div className="w-96 h-4 bg-slate-800 rounded mx-auto mb-6"></div>
              <div className="flex justify-center gap-3">
                <div className="w-32 h-8 bg-indigo-700/60 rounded"></div>
                <div className="w-24 h-8 bg-slate-800 rounded"></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-800">
              <div className="h-28 bg-slate-900 rounded border border-slate-800 p-3"></div>
              <div className="h-28 bg-slate-900 rounded border border-slate-800 p-3"></div>
              <div className="h-28 bg-slate-900 rounded border border-slate-800 p-3"></div>
            </div>
          </div>

          {/* Render Clicks as Heatmap Glow Dots */}
          {clicks.map((c, i) => {
            const vpW = c.viewport_width || 1440;
            const vpH = c.viewport_height || 900;
            const leftPct = Math.min(Math.max((c.x / vpW) * 100, 0), 100);
            const topPct = Math.min(Math.max((c.y / vpH) * 100, 0), 100);

            return (
              <div
                key={i}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                title={`Recorded at (${c.x}px, ${c.y}px) on ${new Date(c.timestamp).toLocaleTimeString()}`}
                className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full pointer-events-auto cursor-crosshair group z-10"
              >
                <div className="w-full h-full rounded-full bg-amber-400/90 ring-8 ring-amber-500/25 blur-[1.5px] group-hover:scale-175 group-hover:bg-rose-400 transition-all duration-150"></div>
              </div>
            );
          })}

          {clicks.length === 0 && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-sm">
              <p>No click coordinates recorded for this URL.</p>
              <span className="text-xs text-slate-600 mt-1">Interact with the demo store to populate heatmap points.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
