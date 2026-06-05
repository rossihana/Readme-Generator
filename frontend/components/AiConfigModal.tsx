import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Wifi, WifiOff, Save, RefreshCw, ChevronDown, Zap } from 'lucide-react';

export interface AIConfig {
  provider: string;
  model: string;
  apiKey: string;
  ollamaUrl: string;
  nineRouterUrl?: string;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'default',
  model: 'gemini-2.5-flash',
  apiKey: '',
  ollamaUrl: 'http://localhost:11434',
  nineRouterUrl: 'http://localhost:20128',
};

const PROVIDER_MODELS: Record<string, string[]> = {
  default: ['gemini-2.5-flash'],
  gemini_custom: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  claude: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
  groq: [
    'deepseek-r1-distill-llama-70b',
    'deepseek-r1-distill-qwen-32b',
    'gemma2-9b-it',
    'llama-3.1-8b-instant',
    'llama-3.3-70b-specdec',
    'llama-3.3-70b-versatile',
    'llama3-70b-8192',
    'mixtral-8x7b-32768'
  ],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  mistral: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'codestral-latest', 'open-mistral-nemo'],
  openrouter: [
    'google/gemini-2.5-flash:free',
    'deepseek/deepseek-r1:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen-2.5-coder-32b-instruct:free',
    'microsoft/phi-3-medium-128k-instruct:free',
    'openrouter/free'
  ],
  nine_router: [
    'router/free',
    'google/gemini-2.5-flash:free',
    'deepseek/deepseek-r1:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen-2.5-coder-32b-instruct:free'
  ],
  ollama: ['llama3.2:3b', 'llama3.2:1b', 'llama3.1:8b', 'llama3:8b', 'deepseek-r1:1.5b'],
};

const PROVIDER_DEFAULT_MODEL: Record<string, string> = {
  default: 'gemini-2.5-flash',
  gemini_custom: 'gemini-2.5-flash',
  openai: 'gpt-4o',
  claude: 'claude-3-5-sonnet-latest',
  groq: 'llama-3.3-70b-versatile',
  deepseek: 'deepseek-chat',
  mistral: 'mistral-large-latest',
  openrouter: 'google/gemini-2.5-flash:free',
  nine_router: 'router/free',
  ollama: 'llama3.2:3b',
};

interface AiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AIConfig) => void;
  currentConfig: AIConfig;
  isDark: boolean;
}

const LOG_COLORS: Record<string, string> = {
  INFO: 'text-sky-400',
  SUCCESS: 'text-emerald-400',
  ERROR: 'text-red-400',
  WARN: 'text-yellow-400',
};

function getLogColor(line: string): string {
  for (const [key, cls] of Object.entries(LOG_COLORS)) {
    if (line.startsWith(`[${key}]`)) return cls;
  }
  return 'text-gray-300';
}

export const AiConfigModal: React.FC<AiConfigModalProps> = ({
  isOpen, onClose, onSave, currentConfig, isDark,
}) => {
  const { t } = useTranslation();
  const [config, setConfig] = useState<AIConfig>(currentConfig);
  const [showKey, setShowKey] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [nineRouterModels, setNineRouterModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchingNineRouterModels, setFetchingNineRouterModels] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

  useEffect(() => { 
    setConfig(currentConfig); 
    if (currentConfig.provider === 'ollama') {
      fetchOllamaModels(currentConfig.ollamaUrl);
    }
    if (currentConfig.provider === 'nine_router') {
      fetchNineRouterModels(currentConfig.nineRouterUrl || 'http://localhost:20128');
    }
  }, [currentConfig]);
  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Sync config.model with fetched Ollama / NineRouter models
  useEffect(() => {
    if (config.provider === 'ollama' && ollamaModels.length > 0) {
      if (!ollamaModels.includes(config.model)) {
        setConfig(prev => ({ ...prev, model: ollamaModels[0] }));
      }
    }
    if (config.provider === 'nine_router' && nineRouterModels.length > 0) {
      if (!nineRouterModels.includes(config.model)) {
        setConfig(prev => ({ ...prev, model: nineRouterModels[0] }));
      }
    }
  }, [ollamaModels, nineRouterModels, config.provider, config.model]);

  const handleProviderChange = (provider: string) => {
    setConfig(prev => ({
      ...prev,
      provider,
      model: PROVIDER_DEFAULT_MODEL[provider] ?? prev.model,
    }));
    setLogs([]);
    setVerifyStatus('idle');
    if (provider === 'ollama') fetchOllamaModels(config.ollamaUrl);
    if (provider === 'nine_router') fetchNineRouterModels(config.nineRouterUrl || 'http://localhost:20128');
  };

  const fetchOllamaModels = async (url: string) => {
    setFetchingModels(true);
    try {
      const resp = await fetch(`${API_BASE}/ollama-models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ollamaUrl: url }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.models?.length) setOllamaModels(data.models);
      }
    } catch { /* silent */ } finally {
      setFetchingModels(false);
    }
  };

  const fetchNineRouterModels = async (url: string) => {
    setFetchingNineRouterModels(true);
    try {
      const resp = await fetch(`${API_BASE}/nine-router-models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nineRouterUrl: url }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.models?.length) setNineRouterModels(data.models);
      }
    } catch { /* silent */ } finally {
      setFetchingNineRouterModels(false);
    }
  };

  const handleVerify = async () => {
    setVerifyStatus('loading');
    setLogs([]);
    try {
      const resp = await fetch(`${API_BASE}/verify-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiConfig: config }),
      });
      const data = await resp.json();
      setLogs(data.logs ?? []);
      setVerifyStatus(data.status === 'success' ? 'success' : 'error');
      if (config.provider === 'ollama' && data.status === 'success') {
        fetchOllamaModels(config.ollamaUrl);
      }
      if (config.provider === 'nine_router' && data.status === 'success') {
        fetchNineRouterModels(config.nineRouterUrl || 'http://localhost:20128');
      }
    } catch (err: any) {
      setLogs([`[ERROR] Tidak dapat menghubungi server backend: ${err.message}`]);
      setVerifyStatus('error');
    }
  };

  const handleSave = () => {
    onSave(config);
    setShowSavedToast(true);
    setTimeout(() => { setShowSavedToast(false); onClose(); }, 1200);
  };

  const modelList = (() => {
    if (config.provider === 'ollama' && ollamaModels.length > 0) return ollamaModels;
    if (config.provider === 'nine_router' && nineRouterModels.length > 0) return nineRouterModels;
    return PROVIDER_MODELS[config.provider] ?? PROVIDER_MODELS['default'];
  })();

  const needsApiKey = ['gemini_custom', 'openai', 'claude', 'groq', 'deepseek', 'mistral', 'openrouter', 'nine_router'].includes(config.provider);
  const needsOllamaUrl = config.provider === 'ollama';
  const needsNineRouterUrl = config.provider === 'nine_router';

  const cardBg = isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const inputBg = isDark ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400';
  const labelCls = isDark ? 'text-gray-400' : 'text-gray-500';
  const selectBg = isDark ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden ${cardBg}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('ai_config.modal_title')}
                </h2>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Provider */}
              <div className="space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-widest ${labelCls}`}>
                  {t('ai_config.provider_label')}
                </label>
                <div className="relative">
                  <select
                    value={config.provider}
                    onChange={e => handleProviderChange(e.target.value)}
                    className={`w-full rounded-xl border py-3 pl-4 pr-10 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer transition-colors ${selectBg}`}
                  >
                    <option value="default">{t('ai_config.provider_default')}</option>
                    <option value="gemini_custom">{t('ai_config.provider_gemini')}</option>
                    <option value="openai">{t('ai_config.provider_openai')}</option>
                    <option value="claude">{t('ai_config.provider_claude')}</option>
                    <option value="groq">{t('ai_config.provider_groq')}</option>
                    <option value="deepseek">{t('ai_config.provider_deepseek')}</option>
                    <option value="mistral">{t('ai_config.provider_mistral')}</option>
                    <option value="openrouter">{t('ai_config.provider_openrouter')}</option>
                    <option value="nine_router">{t('ai_config.provider_nine_router')}</option>
                    <option value="ollama">{t('ai_config.provider_ollama')}</option>
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </div>

              {/* Model */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-[10px] font-bold uppercase tracking-widest ${labelCls}`}>
                    {t('ai_config.model_label')}
                  </label>
                  {config.provider === 'ollama' && (
                    <button
                      type="button"
                      onClick={() => fetchOllamaModels(config.ollamaUrl)}
                      disabled={fetchingModels}
                      className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${fetchingModels ? 'animate-spin' : ''}`} />
                      {fetchingModels ? t('ai_config.fetching_models') : t('ai_config.fetch_models_btn')}
                    </button>
                  )}
                  {config.provider === 'nine_router' && (
                    <button
                      type="button"
                      onClick={() => fetchNineRouterModels(config.nineRouterUrl || 'http://localhost:20128')}
                      disabled={fetchingNineRouterModels}
                      className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${fetchingNineRouterModels ? 'animate-spin' : ''}`} />
                      {fetchingNineRouterModels ? t('ai_config.fetching_models') : t('ai_config.fetch_models_btn')}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={config.model}
                    onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
                    className={`w-full rounded-xl border py-3 pl-4 pr-10 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer transition-colors ${selectBg}`}
                  >
                    {modelList.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </div>

              {/* API Key */}
              <AnimatePresence>
                {needsApiKey && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${labelCls}`}>
                      {t('ai_config.api_key_label')}
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={config.apiKey}
                        onChange={e => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder={t('ai_config.api_key_placeholder')}
                        className={`w-full rounded-xl border py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors font-mono ${inputBg}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(s => !s)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-700'}`}
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ollama URL */}
              <AnimatePresence>
                {needsOllamaUrl && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${labelCls}`}>
                      {t('ai_config.ollama_url_label')}
                    </label>
                    <input
                      type="text"
                      value={config.ollamaUrl}
                      onChange={e => setConfig(prev => ({ ...prev, ollamaUrl: e.target.value }))}
                      placeholder={t('ai_config.ollama_url_placeholder')}
                      className={`w-full rounded-xl border py-3 px-4 text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${inputBg}`}
                    />
                    <p className="text-[11px] text-amber-500/80 flex items-center gap-1.5">
                      <span>💡</span> {t('ai_config.ollama_hint')}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* NineRouter URL */}
              <AnimatePresence>
                {needsNineRouterUrl && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    <label className={`text-[10px] font-bold uppercase tracking-widest ${labelCls}`}>
                      {t('ai_config.nine_router_url_label')}
                    </label>
                    <input
                      type="text"
                      value={config.nineRouterUrl || ''}
                      onChange={e => setConfig(prev => ({ ...prev, nineRouterUrl: e.target.value }))}
                      placeholder={t('ai_config.nine_router_url_placeholder')}
                      className={`w-full rounded-xl border py-3 px-4 text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${inputBg}`}
                    />
                    <p className="text-[11px] text-amber-500/80 flex items-center gap-1.5">
                      <span>💡</span> {t('ai_config.nine_router_hint')}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Connection Log Terminal */}
              <AnimatePresence>
                {logs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                      {t('ai_config.log_title')}
                    </label>
                    <div className="bg-gray-950 rounded-xl border border-gray-700 p-4 font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
                      {logs.map((line, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={getLogColor(line)}
                        >
                          {line}
                        </motion.div>
                      ))}
                      <div ref={logEndRef} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Buttons */}
            <div className={`px-6 pb-6 pt-3 flex gap-3 border-t ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}>
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifyStatus === 'loading'}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  verifyStatus === 'success'
                    ? 'bg-emerald-900/30 border-emerald-600 text-emerald-400'
                    : verifyStatus === 'error'
                    ? 'bg-red-900/30 border-red-600 text-red-400'
                    : isDark
                    ? 'bg-gray-800 border-gray-600 text-gray-300 hover:border-purple-500 hover:text-purple-300'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-purple-500 hover:text-purple-600'
                }`}
              >
                {verifyStatus === 'loading' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : verifyStatus === 'success' ? (
                  <Wifi className="w-4 h-4" />
                ) : verifyStatus === 'error' ? (
                  <WifiOff className="w-4 h-4" />
                ) : (
                  <Wifi className="w-4 h-4" />
                )}
                {verifyStatus === 'loading'
                  ? t('ai_config.verifying')
                  : t('ai_config.verify_btn')}
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-purple-900/30 transition-all"
              >
                {showSavedToast ? (
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    ✓ {t('ai_config.saved_toast')}
                  </motion.span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('ai_config.save_btn')}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
