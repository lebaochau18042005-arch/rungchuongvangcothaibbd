import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { History, Trophy, Users, Calendar, ArrowRight, Trash2, BarChart3, Loader2 } from 'lucide-react';
import { getGameHistory } from '../../services/cloudStore';
import type { GameResult } from '../../services/cloudStore';

export default function HostHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGameHistory().then(h => { setHistory(h); setLoading(false); });
  }, []);

  const clearAll = () => {
    if (!confirm('Xóa toàn bộ lịch sử phòng?')) return;
    localStorage.removeItem('rcv_last_game_result');
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="text-indigo-600" size={26} />
          <h1 className="text-xl font-black text-slate-800">LỊCH SỬ PHÒNG CHƠI</h1>
        </div>
        <div className="flex gap-2">
          {history.length > 0 && (
            <button onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition">
              <Trash2 size={16} /> Xóa tất cả
            </button>
          )}
          <button onClick={() => navigate('/host')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
            Về Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 size={28} className="animate-spin" />
            <span className="text-lg font-bold">Đang tải lịch sử...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <History size={64} className="mx-auto mb-4 text-slate-200" />
            <p className="text-xl font-bold text-slate-400">Chưa có lịch sử phòng</p>
            <p className="text-sm text-slate-400 mt-1">Chơi xong 1 trận sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 font-medium">{history.length} trận gần đây</p>
            {history.map((game, i) => {
              const sorted = [...game.players].sort((a, b) => b.score - a.score);
              const winner = sorted[0];
              const date = new Date(game.date);
              return (
                <motion.div key={game.id}
                  initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                  {/* Color badge */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white font-black text-lg shrink-0">
                    #{game.pin}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 text-lg truncate">{game.title || `Phòng ${game.pin}`}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Calendar size={13} />{date.toLocaleDateString('vi-VN')} {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1"><Users size={13} />{game.players.length} người</span>
                      <span className="flex items-center gap-1 text-indigo-500 font-medium">📝 {game.totalQuestions} câu</span>
                    </div>
                    {winner && (
                      <div className="flex items-center gap-1 mt-2 text-sm">
                        <Trophy size={14} className="text-yellow-500" />
                        <span className="font-bold text-slate-700">{winner.name}</span>
                        <span className="text-orange-500 font-black ml-1">{winner.score} điểm</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => {
                      localStorage.setItem('rcv_last_game_result', JSON.stringify(game));
                      navigate('/host/report');
                    }}
                      className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-sm transition">
                      <BarChart3 size={15} /> Báo cáo
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
