const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchSessions() {
  const res = await fetch(`${API_BASE}/sessions`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function fetchSessionEvents(sessionId) {
  const res = await fetch(`${API_BASE}/sessions/${encodeURIComponent(sessionId)}/events`);
  if (!res.ok) throw new Error('Failed to fetch session events');
  return res.json();
}

export async function fetchPages() {
  const res = await fetch(`${API_BASE}/pages`);
  if (!res.ok) throw new Error('Failed to fetch pages');
  return res.json();
}

export async function fetchPageClicks(url) {
  const res = await fetch(`${API_BASE}/pages/clicks?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error('Failed to fetch click data');
  return res.json();
}
