/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router';
import { ApiKeyProvider, useApiKey } from './contexts/ApiKeyContext';
import { GameProvider } from './contexts/GameContext';
import Home from './pages/Home';
import HostDashboard from './pages/host/Dashboard';
import HostRoom from './pages/host/Room';
import HostReport from './pages/host/Report';
import HostHistory from './pages/host/History';
import PlayerJoin from './pages/player/Join';
import PlayerRoom from './pages/player/Room';
import { KeyRound } from 'lucide-react';

function AppHeader() {
  const { apiKey, showSettings } = useApiKey();

  return (
    <div className="fixed top-0 right-0 z-40 p-3">
      <button
        onClick={showSettings}
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border backdrop-blur-md transition font-bold text-xs tracking-wider font-mono-sci group ${
          apiKey
            ? 'bg-cyan-950/80 border-cyan-500/30 hover:border-cyan-400/60 text-cyan-400'
            : 'bg-red-950/90 border-red-500/60 hover:border-red-400 text-red-400 animate-pulse'
        }`}
        style={{ fontFamily: 'JetBrains Mono, monospace' }}
      >
        <KeyRound size={14} className={apiKey ? 'text-cyan-400' : 'text-red-400'} />
        {apiKey ? '● API KEY OK' : '⚠ NHẬP API KEY'}
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ApiKeyProvider>
      <GameProvider>
        <AppHeader />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/host" element={<HostDashboard />} />
            <Route path="/host/room/:pin" element={<HostRoom />} />
            <Route path="/host/report" element={<HostReport />} />
            <Route path="/host/history" element={<HostHistory />} />
            <Route path="/play" element={<PlayerJoin />} />
            <Route path="/play/:pin" element={<PlayerRoom />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </ApiKeyProvider>
  );
}
