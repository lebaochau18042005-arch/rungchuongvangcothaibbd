import { useState } from 'react';
import { X, Users, Check, Shuffle } from 'lucide-react';
import type { Player } from '../contexts/GameContext';

export interface Team {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

const DEFAULT_TEAMS: Team[] = [
  { id: 'team1', name: 'Đội Đỏ', color: '#EF4444', emoji: '🔴' },
  { id: 'team2', name: 'Đội Xanh', color: '#3B82F6', emoji: '🔵' },
  { id: 'team3', name: 'Đội Vàng', color: '#F59E0B', emoji: '🟡' },
  { id: 'team4', name: 'Đội Xanh Lá', color: '#22C55E', emoji: '🟢' },
];

interface Props {
  players: Player[];
  teamCount: number;
  onConfirm: (assignments: Record<string, string>) => void;
  onClose: () => void;
}

export default function TeamAssigner({ players, teamCount, onConfirm, onClose }: Props) {
  const teams = DEFAULT_TEAMS.slice(0, teamCount);
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    players.forEach(p => { init[p.id] = ''; });
    return init;
  });

  const assign = (playerId: string, teamId: string) => {
    setAssignments(prev => ({ ...prev, [playerId]: teamId }));
  };

  const shuffleAuto = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const newAssignments: Record<string, string> = {};
    shuffled.forEach((p, i) => {
      newAssignments[p.id] = teams[i % teams.length].id;
    });
    setAssignments(newAssignments);
  };

  const allAssigned = players.every(p => assignments[p.id]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-5 text-white flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-2">
            <Users size={22} />
            <h2 className="text-xl font-black">Phân Đội</h2>
            <span className="text-sm opacity-80 font-medium">({players.length} người → {teamCount} đội)</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={shuffleAuto}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition">
              <Shuffle size={14} /> Tự phân
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Team legend */}
          <div className="flex flex-wrap gap-3">
            {teams.map(team => (
              <div key={team.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-sm font-bold"
                style={{ borderColor: team.color, color: team.color }}>
                {team.emoji} {team.name}
              </div>
            ))}
          </div>

          {/* Players */}
          <div className="space-y-3">
            {players.map(player => {
              const currentTeam = teams.find(t => t.id === assignments[player.id]);
              return (
                <div key={player.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-2xl">{player.avatar}</span>
                  <span className="flex-1 font-bold text-slate-800">{player.name}</span>
                  {/* Team buttons */}
                  <div className="flex gap-2">
                    {teams.map(team => {
                      const isSelected = assignments[player.id] === team.id;
                      return (
                        <button key={team.id} onClick={() => assign(player.id, team.id)}
                          className="w-9 h-9 rounded-full text-sm font-black border-2 transition flex items-center justify-center"
                          style={{
                            borderColor: team.color,
                            backgroundColor: isSelected ? team.color : 'transparent',
                            color: isSelected ? '#fff' : team.color,
                          }}>
                          {isSelected ? <Check size={16} /> : team.emoji}
                        </button>
                      );
                    })}
                  </div>
                  {currentTeam && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: currentTeam.color }}>
                      {currentTeam.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold">Hủy</button>
            <button onClick={() => onConfirm(assignments)} disabled={!allAssigned}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-bold disabled:opacity-50 transition hover:scale-105">
              {allAssigned ? `✅ Xác nhận phân đội` : `Còn ${players.filter(p => !assignments[p.id]).length} chưa phân đội`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
