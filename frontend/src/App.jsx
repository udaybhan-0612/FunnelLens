import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Sessions from './pages/Sessions';
import SessionDetail from './pages/SessionDetail';
import Heatmap from './pages/Heatmap';

export default function App() {
  const [currentTab, setTab] = useState('overview');
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const handleSelectSession = (id) => {
    setSelectedSessionId(id);
    setTab('session-detail');
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      <Sidebar
        currentTab={currentTab}
        setTab={(tab) => {
          setSelectedSessionId(null);
          setTab(tab);
        }}
      />
      <main className="flex-1 overflow-y-auto p-8 bg-slate-900/60">
        <div className="max-w-6xl mx-auto">
          {currentTab === 'overview' && <Overview onSelectSession={handleSelectSession} />}
          {currentTab === 'sessions' && <Sessions onSelectSession={handleSelectSession} />}
          {currentTab === 'session-detail' && (
            <SessionDetail sessionId={selectedSessionId} onBack={() => setTab('sessions')} />
          )}
          {currentTab === 'heatmap' && <Heatmap />}
        </div>
      </main>
    </div>
  );
}
