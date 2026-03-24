import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { Trophy, BarChart3, Grid3x3, Home, Users, CheckCircle2, XCircle, MinusCircle, Printer } from 'lucide-react';
import { getLastGameResult } from '../../services/cloudStore';
import type { GameResult } from '../../services/cloudStore';

// ===== Bar Chart: Tỷ lệ đúng từng câu =====
function QuestionAccuracyChart({ data }: { data: { label: string; correct: number; total: number }[] }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const container = ref.current.parentElement!;
    const W = container.clientWidth || 600;
    const H = 260;
    const m = { top: 20, right: 20, bottom: 50, left: 50 };
    const iW = W - m.left - m.right;
    const iH = H - m.top - m.bottom;

    svg.attr('width', W).attr('height', H);
    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

    const x = d3.scaleBand().domain(data.map(d => d.label)).range([0, iW]).padding(0.25);
    const y = d3.scaleLinear().domain([0, 100]).range([iH, 0]);

    // Grid lines
    g.selectAll('.grid')
      .data(y.ticks(5))
      .join('line')
      .attr('x1', 0).attr('x2', iW)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', '#E2E8F0').attr('stroke-dasharray', '3,3');

    // Axes
    g.append('g').attr('transform', `translate(0,${iH})`).call(d3.axisBottom(x))
      .selectAll('text').style('font-size', '11px').style('fill', '#64748B');
    g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
      .selectAll('text').style('font-size', '11px').style('fill', '#64748B');

    // Bars with colour by accuracy
    const colourScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 100]);

    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => x(d.label)!)
      .attr('y', d => y((d.correct / Math.max(d.total, 1)) * 100))
      .attr('width', x.bandwidth())
      .attr('height', d => iH - y((d.correct / Math.max(d.total, 1)) * 100))
      .attr('fill', d => colourScale((d.correct / Math.max(d.total, 1)) * 100))
      .attr('rx', 4);

    // Labels on bars
    g.selectAll('.bar-label')
      .data(data)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.label)! + x.bandwidth() / 2)
      .attr('y', d => y((d.correct / Math.max(d.total, 1)) * 100) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px').style('fill', '#1E293B').style('font-weight', '600')
      .text(d => `${Math.round((d.correct / Math.max(d.total, 1)) * 100)}%`);

    // X axis label
    g.append('text').attr('x', iW / 2).attr('y', iH + 42)
      .attr('text-anchor', 'middle').style('font-size', '12px').style('fill', '#94A3B8')
      .text('Câu hỏi');
  }, [data]);

  return <svg ref={ref} style={{ width: '100%' }} />;
}

// ===== Heatmap: Học sinh × Câu hỏi =====
function AnswerHeatmap({ result }: { result: GameResult }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || result.players.length === 0) return;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const players = result.players;
    const qResults = result.questionResults;

    const container = ref.current.parentElement!;
    const W = container.clientWidth || 700;
    const labelW = 100;
    const cellSize = Math.min(34, (W - labelW - 30) / Math.max(qResults.length, 1));
    const H = players.length * (cellSize + 4) + 80;

    svg.attr('width', W).attr('height', H);
    const g = svg.append('g').attr('transform', 'translate(10,10)');

    // Column headers (question numbers)
    qResults.forEach((q, ci) => {
      g.append('text')
        .attr('x', labelW + ci * (cellSize + 4) + cellSize / 2)
        .attr('y', 18)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px').style('fill', '#64748B')
        .text(`C${q.index + 1}`);
    });

    // Row: each player
    players.forEach((player, ri) => {
      const y = 30 + ri * (cellSize + 4);

      // Player name
      g.append('text')
        .attr('x', labelW - 6).attr('y', y + cellSize / 2 + 4)
        .attr('text-anchor', 'end')
        .style('font-size', '11px').style('fill', '#334155')
        .text(player.name.length > 10 ? player.name.slice(0, 10) + '…' : player.name);

      // Cells
      qResults.forEach((qr, ci) => {
        const answer = qr.playerAnswers[player.id] ?? qr.playerAnswers[
          result.players.find(p => p.name === player.name)?.id || ''
        ];
        const noAnswer = answer === undefined || answer === -1;
        const correct = !noAnswer && answer === qr.correctAnswer;

        let fill = '#64748B'; // grey = no answer
        if (!noAnswer) fill = correct ? '#16A34A' : '#DC2626';

        g.append('rect')
          .attr('x', labelW + ci * (cellSize + 4))
          .attr('y', y)
          .attr('width', cellSize).attr('height', cellSize)
          .attr('rx', 4).attr('fill', fill).attr('opacity', 0.85);

        if (!noAnswer) {
          g.append('text')
            .attr('x', labelW + ci * (cellSize + 4) + cellSize / 2)
            .attr('y', y + cellSize / 2 + 4)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px').style('fill', '#FFFFFF').style('font-weight', 'bold')
            .text(correct ? '✓' : '✗');
        }
      });
    });

    // Legend
    const legendY = H - 24;
    const items = [
      { color: '#16A34A', label: 'Đúng' },
      { color: '#DC2626', label: 'Sai' },
      { color: '#64748B', label: 'Không trả lời' },
    ];
    items.forEach((item, i) => {
      g.append('rect').attr('x', labelW + i * 130).attr('y', legendY).attr('width', 14).attr('height', 14).attr('rx', 3).attr('fill', item.color);
      g.append('text').attr('x', labelW + i * 130 + 18).attr('y', legendY + 11)
        .style('font-size', '11px').style('fill', '#64748B').text(item.label);
    });
  }, [result]);

  return <svg ref={ref} style={{ width: '100%' }} />;
}

// ===== Main Report Page =====
export default function HostReport() {
  const navigate = useNavigate();
  const [result, setResult] = useState<GameResult | null>(null);

  useEffect(() => {
    const r = getLastGameResult();
    setResult(r);
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 p-8">
        <BarChart3 size={64} className="text-slate-300" />
        <h1 className="text-2xl font-black text-slate-500">Chưa có kết quả game nào</h1>
        <p className="text-slate-400">Vui lòng chơi xong ít nhất 1 trận để xem báo cáo.</p>
        <button onClick={() => navigate('/host')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
          Về Dashboard
        </button>
      </div>
    );
  }

  const { players, questionResults } = result;

  // Chart data: accuracy per question
  const accuracyData = questionResults.map((qr, i) => {
    const total = players.length;
    const correct = players.filter(p => {
      const ans = qr.playerAnswers[p.id];
      return ans !== undefined && ans !== -1 && ans === qr.correctAnswer;
    }).length;
    return { label: `Câu ${i + 1}`, correct, total };
  });

  const hardestQ = accuracyData.reduce((min, d) => (d.correct / Math.max(d.total, 1) < min.correct / Math.max(min.total, 1) ? d : min), accuracyData[0]);
  const easiestQ = accuracyData.reduce((max, d) => (d.correct / Math.max(d.total, 1) > max.correct / Math.max(max.total, 1) ? d : max), accuracyData[0]);

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const totalCorrect = players.reduce((s, p) => s + p.correctAnswers, 0);
  const avgCorrect = players.length > 0 ? (totalCorrect / players.length).toFixed(1) : '0';
  const overallAccuracy = questionResults.length > 0
    ? Math.round(accuracyData.reduce((s, d) => s + (d.correct / Math.max(d.total, 1)), 0) / accuracyData.length * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-indigo-600" size={28} />
          <div>
            <h1 className="text-xl font-black text-slate-800">BÁO CÁO KẾT QUẢ GAME</h1>
            <p className="text-sm text-slate-500">Phòng #{result.pin} · {new Date(result.date).toLocaleString('vi-VN')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition">
            <Printer size={18} /> In báo cáo
          </button>
          <button onClick={() => navigate('/host')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition">
            <Home size={18} /> Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Users size={24} />, label: 'Số người chơi', value: players.length, color: 'text-indigo-600 bg-indigo-50' },
            { icon: <Trophy size={24} />, label: 'Người thắng', value: winner?.name ?? '—', color: 'text-yellow-600 bg-yellow-50' },
            { icon: <CheckCircle2 size={24} />, label: 'TB câu đúng / người', value: avgCorrect, color: 'text-green-600 bg-green-50' },
            { icon: <BarChart3 size={24} />, label: 'Tỷ lệ đúng chung', value: `${overallAccuracy}%`, color: 'text-purple-600 bg-purple-50' },
          ].map((card, i) => (
            <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                {card.icon}
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-2xl font-black text-slate-800 truncate">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-sm font-bold text-red-700 mb-1">😰 Câu khó nhất</p>
            <p className="text-lg font-black text-red-800">{hardestQ?.label}</p>
            <p className="text-sm text-red-600">{hardestQ ? Math.round(hardestQ.correct / Math.max(hardestQ.total, 1) * 100) : 0}% trả lời đúng</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
            <p className="text-sm font-bold text-green-700 mb-1">😊 Câu dễ nhất</p>
            <p className="text-lg font-black text-green-800">{easiestQ?.label}</p>
            <p className="text-sm text-green-600">{easiestQ ? Math.round(easiestQ.correct / Math.max(easiestQ.total, 1) * 100) : 0}% trả lời đúng</p>
          </div>
        </div>

        {/* Bar Chart */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-indigo-600" size={22} />
            <h2 className="text-lg font-black text-slate-800">Tỷ lệ trả lời đúng theo câu hỏi</h2>
          </div>
          <QuestionAccuracyChart data={accuracyData} />
          <p className="text-xs text-slate-400 mt-2 text-right">Màu: đỏ = thấp · vàng = trung bình · xanh = cao</p>
        </section>

        {/* Heatmap */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Grid3x3 className="text-purple-600" size={22} />
            <h2 className="text-lg font-black text-slate-800">Ma trận học sinh — câu hỏi</h2>
          </div>
          <div className="overflow-x-auto">
            <AnswerHeatmap result={result} />
          </div>
        </section>

        {/* Leaderboard */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-yellow-500" size={22} />
            <h2 className="text-lg font-black text-slate-800">Bảng xếp hạng chung cuộc</h2>
          </div>
          <div className="space-y-2">
            {sorted.map((p, i) => (
              <motion.div key={p.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}
                className={`flex items-center justify-between p-3 rounded-xl border ${i === 0 ? 'bg-yellow-50 border-yellow-200' : i === 1 ? 'bg-slate-100 border-slate-200' : i === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'} ${p.isEliminated ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black w-8 text-center text-slate-500">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </span>
                  <span className="text-2xl">{p.avatar}</span>
                  <div>
                    <div className={`font-bold text-slate-800 ${p.isEliminated ? 'line-through' : ''}`}>{p.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={12} />{p.correctAnswers} đúng</span>
                      {p.isEliminated && <span className="flex items-center gap-1 text-red-500"><XCircle size={12} />Đã loại</span>}
                    </div>
                  </div>
                </div>
                <div className="text-xl font-black text-orange-500">{p.score} đ</div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
