import React, { createContext, useContext, useState, useCallback } from 'react';
import { KeyRound, ExternalLink, X, Check, Zap, Brain, Cpu } from 'lucide-react';

// ===== Model Config =====
export const AVAILABLE_MODELS = [
  {
    id: 'gemini-3-flash-preview',
    label: 'Gemini 3 Flash',
    badge: 'Default',
    icon: <Zap size={18} className="text-yellow-500" />,
    desc: 'Nhanh, tiết kiệm quota. Khuyên dùng.',
    badgeColor: 'bg-green-100 text-green-700',
  },
  {
    id: 'gemini-3-pro-preview',
    label: 'Gemini 3 Pro',
    badge: 'Mạnh',
    icon: <Brain size={18} className="text-purple-500" />,
    desc: 'Chất lượng cao hơn, tốn quota hơn.',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    badge: 'Dự phòng',
    icon: <Cpu size={18} className="text-slate-500" />,
    desc: 'Dự phòng khi các model trên bị quá tải.',
    badgeColor: 'bg-slate-100 text-slate-600',
  },
] as const;

export type ModelId = typeof AVAILABLE_MODELS[number]['id'];

interface ApiKeyContextType {
  apiKey: string;
  selectedModel: ModelId;
  setApiKey: (key: string) => void;
  setSelectedModel: (model: ModelId) => void;
  showSettings: () => void;
  /** Hiện modal yêu cầu API key, trả về key khi user nhập xong, null nếu cancel */
  requestApiKey: () => Promise<string | null>;
}

const ApiKeyContext = createContext<ApiKeyContextType>(null!);

export function useApiKey() {
  return useContext(ApiKeyContext);
}

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [selectedModel, setSelectedModelState] = useState<ModelId>(
    () => (localStorage.getItem('gemini_selected_model') as ModelId) || 'gemini-3-flash-preview'
  );
  const [showModal, setShowModal] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [resolvePromise, setResolvePromise] = useState<((key: string | null) => void) | null>(null);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    if (key) localStorage.setItem('gemini_api_key', key);
    else localStorage.removeItem('gemini_api_key');
  }, []);

  const setSelectedModel = useCallback((model: ModelId) => {
    setSelectedModelState(model);
    localStorage.setItem('gemini_selected_model', model);
  }, []);

  const showSettings = useCallback(() => {
    setInputKey(apiKey);
    setShowModal(true);
    setResolvePromise(null);
  }, [apiKey]);

  const requestApiKey = useCallback((): Promise<string | null> => {
    if (apiKey) return Promise.resolve(apiKey);
    return new Promise((resolve) => {
      setInputKey('');
      setShowModal(true);
      setResolvePromise(() => resolve);
    });
  }, [apiKey]);

  const handleSave = () => {
    if (!inputKey.trim()) return;
    setApiKey(inputKey.trim());
    setShowModal(false);
    if (resolvePromise) {
      resolvePromise(inputKey.trim());
      setResolvePromise(null);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    if (resolvePromise) {
      resolvePromise(null);
      setResolvePromise(null);
    }
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, selectedModel, setApiKey, setSelectedModel, showSettings, requestApiKey }}>
      {children}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <KeyRound size={26} /> Thiết Lập Model & API Key
                </h2>
                <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-full transition"><X size={20} /></button>
              </div>
              <p className="text-indigo-100 text-sm">Chọn model AI và nhập Gemini API key để sử dụng tính năng tạo câu hỏi bằng AI.</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Model selector */}
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-3">🤖 Chọn Model AI</label>
                <div className="space-y-2">
                  {AVAILABLE_MODELS.map(model => {
                    const isSelected = selectedModel === model.id;
                    return (
                      <button key={model.id} onClick={() => setSelectedModel(model.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                          {model.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>{model.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${model.badgeColor}`}>{model.badge}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{model.desc}</p>
                        </div>
                        {isSelected && <Check size={18} className="text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* API Key input */}
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">🔑 Gemini API Key</label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={e => setInputKey(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  placeholder="AIzaSy..."
                  className="w-full p-4 border-2 border-slate-300 rounded-xl text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>

              <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                <ExternalLink size={16} /> Lấy API Key miễn phí tại Google AI Studio
              </a>

              <button onClick={handleSave} disabled={!inputKey.trim()}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg disabled:opacity-50 transition">
                Lưu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </ApiKeyContext.Provider>
  );
}
