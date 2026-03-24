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
        className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border backdrop-blur-sm transition font-bold text-sm group ${
          apiKey
            ? 'bg-white/90 border-slate-200 hover:bg-white text-slate-700'
            : 'bg-red-500 border-red-400 hover:bg-red-600 text-white animate-pulse'
        }`}
      >
        <KeyRound size={18} className={apiKey ? 'text-indigo-600' : 'text-white'} />
        {apiKey ? 'API Key ✓' : 'Lấy API key để sử dụng app'}
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
