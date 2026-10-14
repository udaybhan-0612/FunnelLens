import React, { useEffect, useState } from 'react';
import { fetchPages, fetchPageClicks } from '../lib/api';
import { Flame, RefreshCw, Layers } from 'lucide-react';

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
        console.error(err);
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
      console.error(err);
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
            Click Heatmap
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Visual representation of user clicks normalized across viewports</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedUrl}
            onChange={(e) => setSelectedUrl(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500 max-w-xs truncate"
          >
            {pages.map((p) => (
              <option key={p.page_url} value={p.page_url}>
                {p.page_url} ({p.total_clicks} clicks)
              </option>
            ))}
          </select>

          <button
            onClick={() => loadClicks(selectedUrl)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <Layers className="w-4 h-4 text-indigo-400" />
            Showing {clicks.length} total click data point(s)
          </span>
          <span className="italic">Positions normalized (X/W, Y/H) to canvas aspect ratio</span>
        </div>

        <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shadow-inner">
          <div className="absolute inset-x-0 top-0 h-10 border-b border-slate-800/60 bg-slate-900/40 px-4 flex items-center justify-between">
            <div className="w-16 h-3 bg-slate-800 rounded"></div>
            <div className="flex gap-2">
              <div className="w-10 h-2 bg-slate-800 rounded"></div>
              <div className="w-10 h-2 bg-slate-800 rounded"></div>
            </div>
          </div>
          <div className="absolute top-16 inset-x-12 h-20 bg-slate-900/20 rounded border border-dashed border-slate-800/80 flex items-center justify-center text-xs text-slate-600">
            Hero Area
          </div>

          {clicks.map((c, i) => {
            const vpW = c.viewport_width || 1440;
            const vpH = c.viewport_height || 900;
            const leftPct = Math.min(Math.max((c.x / vpW) * 100, 0), 100);
            const topPct = Math.min(Math.max((c.y / vpH) * 100, 0), 100);

            return (
              <div
                key={i}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                title={`Click at (${c.x}, ${c.y})`}
                className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full pointer-events-auto cursor-pointer group"
              >
                <div className="w-full h-full rounded-full bg-amber-400/80 ring-4 ring-amber-500/20 blur-[1px] group-hover:scale-150 transition-transform"></div>
              </div>
            );
          })}

          {clicks.length === 0 && !loading && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
              No click coordinates recorded for this URL yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
