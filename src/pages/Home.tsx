import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Play, Users, Cpu, Zap, Brain } from 'lucide-react';

// Floating particles decoration
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 6,
}));

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="sci-bg min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Scanning line */}
      <div className="scan-line" />

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400 opacity-20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [-10, 10, -10], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-cyan-500/40 rounded-tl-lg" />
      <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-cyan-500/40 rounded-tr-lg" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 border-purple-500/40 rounded-bl-lg" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-purple-500/40 rounded-br-lg" />

      {/* Top status bar */}
      <div className="absolute top-6 left-0 right-0 flex justify-center gap-8 z-10">
        <div className="flex items-center gap-2 text-xs font-mono-sci text-cyan-500/70">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          SYS: ONLINE
        </div>
        <div className="flex items-center gap-2 text-xs font-mono-sci text-cyan-500/70">
          <Cpu size={12} />
          AI ENGINE: READY
        </div>
        <div className="flex items-center gap-2 text-xs font-mono-sci text-cyan-500/70">
          <Zap size={12} />
          REALTIME SYNC: ACTIVE
        </div>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 max-w-lg w-full"
      >
        {/* Glow ring behind card */}
        <div className="absolute inset-0 rounded-3xl blur-2xl bg-gradient-to-br from-cyan-500/10 to-purple-600/10 scale-105" />

        <div className="relative sci-card-strong rounded-3xl p-10 text-center sci-corner">
          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-500/40" />
            <span className="flex items-center gap-1.5 text-xs font-mono-sci text-cyan-400 tracking-widest px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5">
              <Brain size={12} />
              AI-POWERED QUIZ
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-500/40" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-sci text-4xl sm:text-5xl font-black mb-1 text-glow-gold"
            style={{
              background: 'linear-gradient(135deg, #ffb800 0%, #ffdd57 40%, #ff8c00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            RUNG CHUÔNG
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-sci text-4xl sm:text-5xl font-black mb-4"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #7c5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            VÀNG
          </motion.h1>

          {/* Sub label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="sci-divider mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-cyan-400/70 font-mono-sci mb-1 tracking-widest"
          >
            ĐƯỢC THIẾT KẾ BỞI
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="text-base text-white font-bold mb-8"
          >
            Thái Lê · Bình Phú · Bình Dương
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            <button
              onClick={() => navigate('/play')}
              className="btn-sci-primary w-full py-4 px-6 rounded-2xl text-xl font-black flex items-center justify-center gap-3 glow-cyan"
            >
              <Play size={26} />
              VÀO CHƠI NGAY
            </button>

            <button
              onClick={() => navigate('/host')}
              className="btn-sci-secondary w-full py-4 px-6 rounded-2xl text-xl font-bold flex items-center justify-center gap-3"
            >
              <Users size={26} />
              GIÁO VIÊN / TẠO PHÒNG
            </button>
          </motion.div>

          {/* Bottom stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 grid grid-cols-3 gap-3"
          >
            {[
              { label: 'AI MODEL', value: 'GEMINI', icon: Brain },
              { label: 'REALTIME', value: 'FIREBASE', icon: Zap },
              { label: 'ENGINE', value: 'REACT', icon: Cpu },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center p-2 rounded-xl border border-cyan-500/10 bg-cyan-500/5">
                <Icon size={14} className="text-cyan-500 mb-1" />
                <span className="text-xs font-mono-sci text-cyan-400/60">{label}</span>
                <span className="text-xs font-bold text-white/80">{value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="absolute bottom-6 text-center z-10"
      >
        <p className="text-xs font-mono-sci text-cyan-500/40">
          AI TOOLS:{' '}
          <a
            href="https://giaovienai.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400/60 hover:text-cyan-400 underline underline-offset-2 transition-colors"
          >
            giaovienai.vercel.app
          </a>
        </p>
      </motion.div>
    </div>
  );
}
