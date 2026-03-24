import { database, ref, set, get, push } from './firebaseConfig';
import { getCurrentUserId } from './firebaseConfig';

export interface PlayerResult {
  id: string;
  name: string;
  avatar: string;
  score: number;
  correctAnswers: number;
  isEliminated: boolean;
}

export interface QuestionResult {
  index: number;
  content: string;
  correctAnswer: number;
  /** Map of playerTabId → answerIndex (or -1 if no answer) */
  playerAnswers: Record<string, number>;
}

export interface GameResult {
  id: string;
  pin: string;
  title: string;
  date: number;
  durationMs: number;
  totalQuestions: number;
  players: PlayerResult[];
  questionResults: QuestionResult[];
  topPlayerName: string;
  topPlayerScore: number;
}

// ===== Save Result =====
export async function saveGameResult(result: Omit<GameResult, 'id'>): Promise<void> {
  try {
    const hostUid = getCurrentUserId();
    const historyRef = ref(database, `game_history/${hostUid}`);
    const newRef = push(historyRef);
    await set(newRef, { ...result, id: newRef.key });
    // Also cache in localStorage for offline access
    const localKey = 'rcv_last_game_result';
    localStorage.setItem(localKey, JSON.stringify({ ...result, id: newRef.key }));
  } catch (err) {
    console.warn('[cloudStore] Không lưu được lên Firebase, chỉ lưu localStorage:', err);
    localStorage.setItem('rcv_last_game_result', JSON.stringify({ ...result, id: `local_${Date.now()}` }));
  }
}

// ===== Get History =====
export async function getGameHistory(): Promise<GameResult[]> {
  try {
    const hostUid = getCurrentUserId();
    const snap = await get(ref(database, `game_history/${hostUid}`));
    if (!snap.exists()) return [];
    const data = snap.val() as Record<string, GameResult>;
    return Object.values(data).sort((a, b) => b.date - a.date).slice(0, 20);
  } catch (err) {
    console.warn('[cloudStore] Không tải được lịch sử:', err);
    return [];
  }
}

// ===== Get Last Result from localStorage (offline) =====
export function getLastGameResult(): GameResult | null {
  try {
    const raw = localStorage.getItem('rcv_last_game_result');
    if (!raw) return null;
    return JSON.parse(raw) as GameResult;
  } catch {
    return null;
  }
}
