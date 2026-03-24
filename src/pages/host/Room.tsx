import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Play, Trophy, Clock, CheckCircle2, ArrowRight, Ban, BarChart3, History } from 'lucide-react';
import MathText from '../../components/MathText';
import { Bar } from 'react-chartjs-2';
import TeamAssigner from '../../components/TeamAssigner';
import type { TeamInfo } from '../../contexts/GameContext';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import confetti from 'canvas-confetti';
import { useGame } from '../../contexts/GameContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function HostRoom() {
  const { pin } = useParams();
  const navigate = useNavigate();
  const {
    room, players, gameState, currentQuestion, answerResult, answers,
    startGame, nextQuestion, showAnswer, assignTeams,
  } = useGame();

  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showTeamAssigner, setShowTeamAssigner] = useState(false);
  const teamMode = room?.settings?.teamMode ?? false;

  /**
   * FIX BUG 3: Dùng ref để tránh stale closure khi gọi showAnswer từ setInterval.
   * showAnswer từ useGame() thay đổi reference mỗi lần re-render,
   * nhưng interval callback chỉ capture version đầu tiên.
   * Giải pháp: luôn gọi qua showAnswerRef.current.
   */
  const showAnswerRef = useRef(showAnswer);
  showAnswerRef.current = showAnswer;

  /**
   * FIX BUG 4: Tách timer và "auto show khi tất cả trả lời" thành 2 useEffect riêng.
   * Dùng timerDoneRef để tránh showAnswer() bị gọi 2 lần.
   */
  const showAnswerCalledRef = useRef(false);

  const triggerShowAnswer = useCallback(() => {
    if (showAnswerCalledRef.current) return;
    showAnswerCalledRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    showAnswerRef.current();
  }, []);

  // Reset khi câu hỏi mới
  useEffect(() => {
    if (gameState === 'playing' && currentQuestion) {
      showAnswerCalledRef.current = false;
      setTimeLeft(currentQuestion.timeLimit);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // FIX: Không gọi showAnswer trong setInterval callback.
            // Dùng flag và gọi từ ngoài.
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, currentQuestion]);

  // FIX BUG 3: Effect riêng theo dõi timeLeft === 0 để gọi showAnswer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0 && currentQuestion) {
      // Chỉ trigger khi timer thực sự đếm về 0 (không phải lúc khởi tạo)
      const timer = setTimeout(() => triggerShowAnswer(), 100);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, gameState, currentQuestion, triggerShowAnswer]);

  // FIX BUG 4: Auto show khi tất cả đã trả lời (effect riêng)
  useEffect(() => {
    if (gameState !== 'playing' || players.length === 0) return;
    const activePlayers = players.filter(p => !p.isEliminated);
    if (activePlayers.length > 0 && Object.keys(answers).length >= activePlayers.length) {
      triggerShowAnswer();
    }
  }, [answers, players, gameState, triggerShowAnswer]);

  const getChartData = () => {
    if (!currentQuestion) return null;
    const counts = [0, 0, 0, 0];
    Object.values(answers).forEach((ans: any) => {
      if (typeof ans === 'number' && ans >= 0 && ans < 4) counts[ans]++;
    });
    return {
      labels: ['A', 'B', 'C', 'D'],
      datasets: [{
        label: 'Số người chọn',
        data: counts,
        backgroundColor: [
          'rgba(239,68,68,0.8)', 'rgba(59,130,246,0.8)',
          'rgba(234,179,8,0.8)', 'rgba(34,197,94,0.8)',
        ],
        borderRadius: 8,
      }],
    };
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  const joinUrl = `${window.location.origin}/play/${pin}`;

  useEffect(() => {
    if (gameState === 'finished') {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    }
  }, [gameState]);

  const getLeaderboard = () => [...players].sort((a, b) => b.score - a.score);

  const getAnsweredPlayers = () =>
    players.filter(p => !p.isEliminated).map(p => ({
      ...p,
      hasAnswered: answers[p.tabId] !== undefined,
    }));

  // ===== WAITING =====
  if (gameState === 'waiting' || gameState === 'idle') {
    return (
      <div className="sci-bg min-h-screen flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
        <div className="scan-line" />
        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-cyan-500/40 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-cyan-500/40 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-purple-500/40 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-purple-500/40 rounded-br-lg" />

        <div className="max-w-4xl w-full text-center space-y-6 relative z-10">
          <h1 className="font-sci text-4xl font-black text-glow-gold" style={{ background: 'linear-gradient(135deg,#ffb800,#ffdd57,#ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            RUNG CHUÔNG VÀNG
          </h1>

          {/* PIN + QR */}
          <div className="sci-card-strong rounded-3xl p-8 flex flex-col md:flex-row items-center justify-center gap-12 glow-cyan sci-corner">
            <div className="space-y-3 text-center">
              <p className="text-xs font-mono-sci text-cyan-400/60 tracking-widest">MÃ PHÒNG</p>
              <p className="font-sci text-8xl font-black tracking-widest text-glow-cyan" style={{ color: '#00d4ff' }}>{pin}</p>
              <p className="text-sm text-cyan-400/60 font-mono-sci">{window.location.origin}/play</p>
            </div>
            <div className="hidden md:block w-px h-48" style={{ background: 'linear-gradient(180deg, transparent, rgba(0,212,255,0.3), transparent)' }} />
            <div className="p-3 bg-cyan-950/50 rounded-2xl border border-cyan-500/20">
              <QRCodeSVG value={joinUrl} size={180} fgColor="#00d4ff" bgColor="transparent" />
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-xl font-bold">
              <Users className="text-cyan-400" size={28} />
              <span className="font-mono-sci text-cyan-300">{players.length} <span className="text-cyan-500/60">NGƯỜI CHƠI</span></span>
            </div>
            <div className="flex gap-3">
              {teamMode && (
                <button
                  onClick={() => setShowTeamAssigner(true)}
                  className="btn-sci-ghost px-6 py-3 rounded-2xl text-base flex items-center gap-2">
                  🏆 Phân đội
                </button>
              )}
              <button
                onClick={startGame}
                disabled={players.length === 0}
                className="btn-sci-primary px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-3 disabled:opacity-40 glow-cyan"
              >
                <Play size={24} /> BẮT ĐẦU
              </button>
            </div>
          </div>

          {/* Player avatars */}
          <div className="flex flex-wrap gap-3 justify-center">
            <AnimatePresence>
              {players.map(p => (
                <motion.div
                  key={p.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="px-4 py-2 sci-card rounded-full font-bold text-sm border border-cyan-500/20 flex items-center gap-2 text-cyan-200"
                >
                  <span className="text-xl">{p.avatar}</span>
                  {p.name}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {showTeamAssigner && (
          <TeamAssigner
            players={players}
            teamCount={room?.settings?.teamCount ?? 2}
            onConfirm={async (assignments) => {
              const DEFAULT_TEAMS: TeamInfo[] = [
                { id: 'team1', name: 'Đội Đỏ', color: '#EF4444', emoji: '🔴' },
                { id: 'team2', name: 'Đội Xanh', color: '#3B82F6', emoji: '🔵' },
                { id: 'team3', name: 'Đội Vàng', color: '#F59E0B', emoji: '🟡' },
                { id: 'team4', name: 'Đội Xanh Lá', color: '#22C55E', emoji: '🟢' },
              ];
              await assignTeams(assignments, DEFAULT_TEAMS.slice(0, room?.settings?.teamCount ?? 2));
              setShowTeamAssigner(false);
            }}
            onClose={() => setShowTeamAssigner(false)}
          />
        )}
      </div>
    );
  }

  // ===== PLAYING =====
  if (gameState === 'playing' && currentQuestion) {
    const answeredPlayers = getAnsweredPlayers();
    const answeredCount = Object.keys(answers).length;
    const activeCount = players.filter(p => !p.isEliminated).length;

    return (
      <div className="sci-bg min-h-screen flex flex-col">
        <header className="sci-card border-b border-cyan-500/10 p-4 flex justify-between items-center">
          <div className="text-sm font-mono-sci text-cyan-400 flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-bold">
              CÂU {currentQuestion.index + 1}/{currentQuestion.total}
            </span>
          </div>
          <div className={`text-4xl font-black font-sci flex items-center gap-2 ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
            <Clock className={timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-cyan-500'} size={28} />
            <span style={timeLeft <= 5 ? {} : { textShadow: '0 0 20px rgba(0,212,255,0.6)' }}>{timeLeft}</span>
          </div>
          <div className="text-sm font-mono-sci text-cyan-400 flex items-center gap-2">
            <Users size={18} className="text-cyan-500" />
            <span>{answeredCount}<span className="text-cyan-500/50">/{activeCount}</span></span>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-6xl w-full mx-auto flex flex-col items-center justify-center gap-8">
          <div className="w-full sci-card-strong rounded-3xl p-6 text-center border border-cyan-500/15 glow-cyan">
            <MathText
              text={currentQuestion.content}
              tag="div"
              className="text-4xl font-black text-white leading-snug"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
            {currentQuestion.options.map((opt: string, i: number) => {
              const ansStyles = [
                { cls: 'from-red-600 to-red-900 border-red-500/50',    glow: 'rgba(255,51,102,0.3)' },
                { cls: 'from-blue-600 to-blue-900 border-blue-500/50',  glow: 'rgba(0,102,255,0.3)' },
                { cls: 'from-yellow-500 to-amber-800 border-yellow-500/50', glow: 'rgba(255,184,0,0.3)' },
                { cls: 'from-green-600 to-emerald-900 border-green-500/50', glow: 'rgba(0,255,136,0.3)' },
              ];
              const s = ansStyles[i];
              const cleanOpt = opt.replace(/^[A-D][\.\/)\:\-]\s*/i, '').trim();
              return (
                <div key={i} className={`bg-gradient-to-br ${s.cls} text-white p-5 rounded-2xl border flex items-center gap-4 font-bold overflow-hidden min-w-0`}
                  style={{ boxShadow: `0 0 20px ${s.glow}` }}>
                  <div className="w-12 h-12 rounded-xl bg-black/25 flex items-center justify-center shrink-0 text-xl font-black" style={{ fontFamily: 'Orbitron, monospace' }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <MathText text={cleanOpt} className="text-xl leading-snug min-w-0 flex-1" />
                </div>
              );
            })}
          </div>

          <div className="w-full max-w-4xl sci-card p-5 rounded-2xl border border-cyan-500/15">
            <h3 className="text-sm font-mono-sci font-bold text-cyan-400 mb-3 flex items-center gap-2">
              <Users size={16} className="text-cyan-500" />
              ĐÁP ÁN HỌC SINH ({answeredCount}/{activeCount})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {answeredPlayers.map(p => {
                const answerIndex = answers[p.tabId];
                const hasAnswered = answerIndex !== undefined;
                const answerLetter = hasAnswered ? String.fromCharCode(65 + answerIndex) : null;
                const answerColors = [
                  'bg-red-500 text-white border-red-600',
                  'bg-blue-500 text-white border-blue-600',
                  'bg-yellow-500 text-white border-yellow-600',
                  'bg-green-500 text-white border-green-600',
                ];
                const answerColor = hasAnswered ? answerColors[answerIndex] : 'bg-slate-100 border-slate-200 text-slate-400';
                return (
                  <div key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-bold text-sm transition-all ${hasAnswered ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <span className="text-lg shrink-0">{p.avatar}</span>
                    <span className="truncate flex-1 text-slate-700">{p.name}</span>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border-2 shrink-0 ${answerColor}`}>
                      {hasAnswered ? answerLetter : '…'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ===== SHOWING ANSWER =====
  if (gameState === 'showingAnswer' && currentQuestion && answerResult) {
    const chartData = getChartData();
    const leaderboard = getLeaderboard();
    const correctAnswer = answerResult.correctAnswer;
    const advancedPlayers = leaderboard.filter(p => !p.isEliminated);
    const eliminatedPlayers = leaderboard.filter(p => p.isEliminated);
    const justEliminated = eliminatedPlayers.filter(p => {
      const ans = answers[p.tabId];
      return ans !== undefined && ans !== correctAnswer;
    });

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex items-center border-b border-slate-200">
          <div className="text-xl font-bold text-slate-800 shrink-0">
            Kết quả Câu {currentQuestion.index + 1}/{currentQuestion.total}
          </div>
          <div className="flex-1 flex justify-center">
            <button
              onClick={nextQuestion}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md flex items-center gap-2"
            >
              {currentQuestion.index + 1 === currentQuestion.total ? 'XEM KẾT QUẢ CHUNG CUỘC' : 'CÂU TIẾP THEO'}
              <Play size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Câu hỏi + Đáp án */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <MathText text={currentQuestion.content} tag="div" className="text-xl font-black text-slate-800 leading-snug" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((opt: string, i: number) => {
                const isCorrect = i === correctAnswer;
                const cleanOpt = opt.replace(/^[A-D][\.\/\)\:\-]\s*/i, '').trim();
                return (
                  <div key={i} className={`p-3 rounded-xl border-2 flex items-center justify-between ${isCorrect ? 'bg-green-50 border-green-500 text-green-800' : 'bg-white border-slate-200 text-slate-500 opacity-60'}`}>
                    <div className="flex items-center gap-3 font-bold min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm shrink-0 ${isCorrect ? 'bg-green-500' : 'bg-slate-300'}`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <MathText text={cleanOpt} className="min-w-0 flex-1" />
                    </div>
                    {isCorrect && <CheckCircle2 className="text-green-500 shrink-0" size={24} />}
                  </div>
                );
              })}
            </div>
            {answerResult.explanation && (
              <div className="p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-200">
                <p className="font-bold mb-1">Giải thích:</p>
                <MathText text={answerResult.explanation} tag="p" className="text-sm" />
              </div>
            )}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-600 mb-2">Thống kê chọn</h3>
              <div className="h-[180px]">
                {chartData && <Bar data={chartData} options={chartOptions} />}
              </div>
            </div>
          </div>

          {/* Đi tiếp & Bị loại */}
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-2xl border border-green-200">
              <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-3">
                <ArrowRight size={20} /> Đi tiếp ({advancedPlayers.length})
              </h3>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {advancedPlayers.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-green-600 w-6 text-center">{i + 1}</span>
                      <span className="text-xl">{p.avatar}</span>
                      <span className="font-bold text-slate-800">{p.name}</span>
                    </div>
                    <span className="font-black text-green-600">{p.score} đ</span>
                  </div>
                ))}
                {advancedPlayers.length === 0 && (
                  <p className="text-sm text-green-500 text-center py-2">Không có ai đi tiếp</p>
                )}
              </div>
            </div>

            {eliminatedPlayers.length > 0 && (
              <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
                <h3 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-3">
                  <Ban size={20} /> Bị loại ({eliminatedPlayers.length})
                </h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {eliminatedPlayers.map(p => {
                    const isJust = justEliminated.some(j => j.id === p.id);
                    return (
                      <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border ${isJust ? 'bg-red-100 border-red-300 ring-2 ring-red-400' : 'bg-white border-red-100'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl opacity-50">{p.avatar}</span>
                          <span className={`font-bold ${isJust ? 'text-red-700' : 'text-slate-500'}`}>{p.name}</span>
                          {isJust && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">VỪA LOẠI</span>}
                        </div>
                        <span className="font-bold text-slate-400">{p.score} đ</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bảng xếp hạng */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 h-fit">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Trophy size={20} className="text-yellow-500" /> Bảng xếp hạng
            </h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {leaderboard.map((p, i) => (
                <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl transition ${p.isEliminated ? 'bg-slate-100 opacity-50' : i === 0 ? 'bg-yellow-50 border border-yellow-300' : i === 1 ? 'bg-slate-50 border border-slate-300' : i === 2 ? 'bg-orange-50 border border-orange-200' : 'bg-white border border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black w-6 text-center text-slate-500">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </span>
                    <span className="text-lg">{p.avatar}</span>
                    <div>
                      <span className={`font-bold text-sm ${p.isEliminated ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{p.name}</span>
                      <span className="block text-xs text-slate-400">{p.correctAnswers} câu đúng</span>
                    </div>
                  </div>
                  <span className={`font-black text-lg ${p.isEliminated ? 'text-slate-400' : 'text-orange-500'}`}>{p.score}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ===== FINISHED =====
  if (gameState === 'finished') {
    const topPlayers = getLeaderboard().slice(0, 10);
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center p-8 text-white">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mb-12 drop-shadow-lg flex items-center gap-4">
          <Trophy className="text-yellow-400" size={64} />
          BẢNG XẾP HẠNG CHUNG CUỘC
        </h1>
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="space-y-4">
            {topPlayers.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-2xl ${i === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-slate-900 scale-105 shadow-xl z-10 relative' : i === 1 ? 'bg-slate-300 text-slate-800' : i === 2 ? 'bg-orange-300 text-slate-800' : p.isEliminated ? 'bg-white/5 text-white/50' : 'bg-white/5 text-white'}`}
              >
                <div className="flex items-center gap-6">
                  <div className="text-3xl font-black w-12 text-center">{i === 0 ? '👑' : i + 1}</div>
                  <div className="text-4xl">{p.avatar}</div>
                  <div>
                    <div className={`text-2xl font-bold ${p.isEliminated ? 'line-through' : ''}`}>{p.name}</div>
                    {p.isEliminated && <span className="text-xs bg-red-500/80 px-2 py-0.5 rounded-full text-white">Đã bị loại</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black">{p.score}</div>
                  <div className="text-sm opacity-80">{p.correctAnswers} câu đúng</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <button
          onClick={() => navigate('/host')}
          className="mt-12 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xl backdrop-blur-sm transition"
        >
          QUAY LẠI TRANG CHỦ
        </button>
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => navigate('/host/report')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-white rounded-full font-bold backdrop-blur-sm transition border border-indigo-400/30"
          >
            <BarChart3 size={20} /> Xem báo cáo
          </button>
          <button
            onClick={() => navigate('/host/history')}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold backdrop-blur-sm transition"
          >
            <History size={20} /> Lịch sử phòng
          </button>
        </div>
      </div>
    );
  }

  return null;
}
