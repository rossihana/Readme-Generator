import React, { useState, useEffect } from 'react';
import { GeneratorForm } from './components/GeneratorForm';
import { ReadmeDisplay } from './components/ReadmeDisplay';
import { SparklesIcon } from './components/icons';
import { InfoSection } from './components/InfoSection';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { AiConfigModal, AIConfig, DEFAULT_AI_CONFIG } from './components/AiConfigModal';
import { useTranslation } from 'react-i18next';
import { Settings, Sun, Moon } from 'lucide-react';

const STORAGE_THEME = 'readme_gen_theme';
const STORAGE_AI_CONFIG = 'readme_gen_ai_config';

const App: React.FC = () => {
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [finalElapsedTime, setFinalElapsedTime] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [aiError, setAiError] = useState<{provider: string; model: string; detail: string} | null>(null);
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AI_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_AI_CONFIG;
    } catch { return DEFAULT_AI_CONFIG; }
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_THEME);
    return saved ? saved === 'dark' : true;
  });

  const { t } = useTranslation();

  // Apply theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem(STORAGE_THEME, isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleSaveAiConfig = (config: AIConfig) => {
    setAiConfig(config);
    localStorage.setItem(STORAGE_AI_CONFIG, JSON.stringify(config));
  };

  const getGenerateStatusMessage = (key: string) => {
    if (key === 'generator.loading.generate' && aiConfig.provider !== 'default') {
      const providerLabel: Record<string, string> = {
        gemini_custom: 'Gemini', openai: 'OpenAI', claude: 'Claude',
        groq: 'Groq', deepseek: 'DeepSeek', mistral: 'Mistral AI',
        openrouter: 'OpenRouter', nine_router: '9Router', ollama: 'Ollama',
      };
      const label = providerLabel[aiConfig.provider] ?? aiConfig.provider;
      return t('generator.loading.generate_custom', { provider: label, model: aiConfig.model });
    }
    return t(key);
  };

  const LOCAL_PROVIDERS = ['ollama', 'nine_router'];

  const handleGenerateReadme = async (githubUrl: string, preferences: any): Promise<void> => {
    setIsLoading(true);
    setReadmeContent('');
    setError(null);
    setAiError(null);
    const startTimeNow = Date.now();
    setStartTime(startTimeNow);
    setElapsedTime(0);
    setFinalElapsedTime(null);
    setStatusMessage(t('generator.loading.connect'));

    const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';
    const isLocal = LOCAL_PROVIDERS.includes(aiConfig.provider);

    // Detect if running on HTTPS (e.g. Vercel) — browsers block HTTP localhost from HTTPS pages
    const isHttps = window.location.protocol === 'https:';
    const localUrl = aiConfig.provider === 'ollama'
      ? (aiConfig.ollamaUrl || 'http://localhost:11434')
      : (aiConfig.nineRouterUrl || 'http://localhost:20128');
    const targetIsHttp = localUrl.startsWith('http://');

    try {
      // ── LOCAL PROVIDER FLOW (Ollama / 9Router) ──────────────────────────────
      if (isLocal) {

        // Guard: HTTPS page cannot call HTTP localhost (Mixed Content blocked by browser)
        if (isHttps && targetIsHttp) {
          const providerName = aiConfig.provider === 'ollama' ? 'Ollama' : '9Router';
          const port = aiConfig.provider === 'ollama' ? '11434' : '20128';
          throw new Error(
            `generator.errors.local.mixed_content::${providerName}::${port}`
          );
        }

        // Step 1: ask backend to scrape GitHub & build prompt
        setStatusMessage(t('generator.loading.fetch_meta'));
        const prepResp = await fetch(`${API_BASE}/prepare-prompt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ githubUrl, preferences, aiConfig }),
        });
        if (!prepResp.ok) {
          const errData = await prepResp.json().catch(() => ({}));
          throw new Error(errData.detail || 'generator.errors.api.fetch_failed');
        }
        const { messages } = await prepResp.json();

        // Step 2: call local AI directly from browser
        setStatusMessage(getGenerateStatusMessage('generator.loading.generate'));

        let readmeContent = '';

        if (aiConfig.provider === 'ollama') {
          const base = localUrl.replace(/\/$/, '');
          const systemText = messages.find((m: any) => m.role === 'system')?.content || '';
          const userText = messages.find((m: any) => m.role === 'user')?.content || '';
          const combined = systemText ? `${systemText}\n\n${userText}` : userText;

          const resp = await fetch(`${base}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: aiConfig.model, prompt: combined, stream: false }),
          });
          if (!resp.ok) {
            const txt = await resp.text();
            throw new Error(`Ollama error ${resp.status}: ${txt.slice(0, 200)}`);
          }
          const data = await resp.json();
          readmeContent = data.response || '';

        } else {
          // nine_router — OpenAI-compatible
          const base = localUrl.replace(/\/$/, '');
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (aiConfig.apiKey) headers['Authorization'] = `Bearer ${aiConfig.apiKey}`;

          const resp = await fetch(`${base}/v1/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              model: aiConfig.model,
              messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
              temperature: 0.7,
              stream: false,
            }),
          });
          if (!resp.ok) {
            const txt = await resp.text();
            throw new Error(`9Router error ${resp.status}: ${txt.slice(0, 200)}`);
          }
          const data = await resp.json();
          readmeContent = data.choices?.[0]?.message?.content || '';
        }

        if (!readmeContent) throw new Error('generator.errors.api.ai_call_failed');
        setReadmeContent(readmeContent);
        return;
      }

      // ── CLOUD PROVIDER FLOW (default, Gemini, OpenAI, Groq, etc.) ───────────
      const response = await fetch(`${API_BASE}/generate-readme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl, preferences, aiConfig }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'generator.errors.api.generate_failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split(/\r?\n\r?\n/);
        buffer = parts.pop() || '';

        for (const block of parts) {
          if (!block.trim()) continue;

          let eventName = '';
          let eventData = '';

          for (const line of block.split(/\r?\n/)) {
            if (line.startsWith('event: ')) eventName = line.slice(7).trim();
            else if (line.startsWith('data: ')) eventData = line.slice(6).trim();
          }

          if (!eventName || !eventData) continue;

          const parsed = JSON.parse(eventData);

          if (eventName === 'status') {
            setStatusMessage(getGenerateStatusMessage(parsed.key));
          } else if (eventName === 'result') {
            setReadmeContent(parsed.readme);
          } else if (eventName === 'error') {
            const errMsg = parsed.message || 'generator.errors.api.unknown';
            const isAiError = errMsg.startsWith('generator.errors.api.invalid_api_key') || 
                              errMsg.startsWith('generator.errors.api.rate_limit') || 
                              errMsg.startsWith('generator.errors.api.model_not_supported') ||
                              errMsg.startsWith('generator.errors.api.oom_error') ||
                              errMsg === 'generator.errors.api.ai_call_failed';
            
            if (isAiError) {
              setAiError({
                provider: parsed.provider || aiConfig.provider,
                model: parsed.model || aiConfig.model,
                detail: parsed.detail || '',
              });
            }
            throw new Error(errMsg);
          }
        }
      }

    } catch (err: any) {
      setError(err.message || 'generator.errors.api.unknown');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
      setFinalElapsedTime(Math.floor((Date.now() - startTimeNow) / 1000));
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isLoading, startTime]);

  const handleReset = () => {
    setReadmeContent('');
    setError(null);
    setAiError(null);
    setFinalElapsedTime(null);
  };

  // Theme-aware class helpers
  const bg = isDark ? 'bg-gray-900' : 'bg-slate-100';
  const cardBg = isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200';
  const errorBg = isDark ? 'bg-red-900/50 border-red-700 text-red-300' : 'bg-red-50 border-red-300 text-red-700';
  const progressTrack = isDark ? 'bg-gray-700' : 'bg-gray-200';
  const statusText = isDark ? 'text-purple-400' : 'text-purple-600';

  // Show active provider badge
  const isCustomActive = aiConfig.provider !== 'default';

  const getProviderName = (provider: string) => {
    const labels: Record<string, string> = {
      default: 'System Gemini',
      gemini_custom: 'Google Gemini',
      openai: 'OpenAI',
      claude: 'Claude',
      groq: 'Groq',
      deepseek: 'DeepSeek',
      mistral: 'Mistral AI',
      openrouter: 'OpenRouter',
      nine_router: '9Router (Proxy)',
      ollama: 'Ollama',
    };
    return labels[provider] ?? provider;
  };

  return (
    <div className={`min-h-screen ${bg} text-gray-100 font-sans p-4 sm:p-6 md:p-8 flex flex-col items-center transition-colors duration-300`}>
      <div className="w-full max-w-4xl mx-auto">

        {/* Toolbar */}
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-[10px] font-bold rounded-full border flex items-center gap-1.5 transition-all uppercase tracking-wider ${
              isDark
                ? aiConfig.provider === 'default'
                  ? 'bg-purple-950/40 border-purple-600/40 text-purple-300'
                  : aiConfig.provider === 'ollama'
                  ? 'bg-blue-950/40 border-blue-600/40 text-blue-300'
                  : 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
                : aiConfig.provider === 'default'
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : aiConfig.provider === 'ollama'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <span>
                {aiConfig.provider === 'default' ? '🤖' : aiConfig.provider === 'ollama' ? '🔌' : '🔑'}
              </span>
              <span>
                {getProviderName(aiConfig.provider)}: {aiConfig.model}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(d => !d)}
              title={isDark ? t('theme.toggle_light') : t('theme.toggle_dark')}
              className={`p-2 rounded-xl transition-all ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 shadow-sm'}`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* AI Config Button */}
            <button
              onClick={() => setShowAiConfig(true)}
              title={t('ai_config.button_tooltip')}
              className={`p-2 rounded-xl transition-all relative ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-purple-400' : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 shadow-sm'}`}
            >
              <Settings className="w-4 h-4" />
              {isCustomActive && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-gray-900" />
              )}
            </button>

            <LanguageSwitcher isDark={isDark} />
          </div>
        </div>

        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-2">
            <SparklesIcon className="w-8 h-8 text-purple-400" />
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500`}>
              {t('app.title')}
            </h1>
          </div>
          <p className={`text-md sm:text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('app.tagline')}
          </p>
        </header>

        <main className={`rounded-xl shadow-2xl shadow-purple-500/10 p-6 sm:p-8 border transition-colors duration-300 ${cardBg}`}>
          {/* Mixed-content / HTTPS + localhost error */}
          {error?.startsWith('generator.errors.local.mixed_content') && (() => {
            const [, providerName, port] = error.split('::');
            return (
              <div className={`border rounded-xl mb-6 overflow-hidden ${isDark ? 'bg-amber-950/40 border-amber-600/40' : 'bg-amber-50 border-amber-300'}`}>
                <div className={`px-4 py-3 flex items-start gap-3 ${isDark ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
                  <span className="text-xl mt-0.5">🔒</span>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                      Browser memblokir koneksi ke {providerName} (Mixed Content)
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-amber-400/80' : 'text-amber-700'}`}>
                      Halaman HTTPS (Vercel) tidak dapat mengakses <code className="font-mono bg-black/20 px-1 rounded">http://localhost:{port}</code> karena kebijakan keamanan browser.
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-3 text-xs space-y-2 ${isDark ? 'text-amber-300/80' : 'text-amber-800'}`}>
                  <p className="font-semibold">✅ Pilih salah satu solusi:</p>
                  <div className={`rounded-lg p-3 space-y-1 ${isDark ? 'bg-amber-950/50' : 'bg-white/60'}`}>
                    <p className="font-bold">Opsi 1 — Jalankan aplikasi secara lokal (Paling mudah)</p>
                    <p className={isDark ? 'text-amber-400/70' : 'text-amber-700'}>Download/clone repo ini dan jalankan <code className="font-mono bg-black/10 px-1 rounded">npm start</code> di laptop Anda. Localhost bekerja sempurna saat aplikasi dijalankan lokal.</p>
                  </div>
                  <div className={`rounded-lg p-3 space-y-1 ${isDark ? 'bg-amber-950/50' : 'bg-white/60'}`}>
                    <p className="font-bold">Opsi 2 — Gunakan Ngrok (Akses dari Vercel)</p>
                    <code className={`block font-mono text-[11px] px-2 py-1 rounded ${isDark ? 'bg-black/40' : 'bg-amber-100'}`}>
                      ngrok http {port}
                    </code>
                    <p className={isDark ? 'text-amber-400/70' : 'text-amber-700'}>Lalu ganti URL {providerName} di pengaturan AI dengan URL <strong>https://</strong> dari Ngrok.</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* GitHub / generic error */}
          {error && !aiError && !error.startsWith('generator.errors.local.mixed_content') && (
            <div className={`border px-4 py-3 rounded-lg mb-6 flex items-center gap-3 ${errorBg}`}>
              <span className="text-lg">⚠️</span>
              <span>{t(error)}</span>
            </div>
          )}

          {/* AI Provider error – with detail */}
          {error && aiError && (
            <div className={`border rounded-xl mb-6 overflow-hidden ${isDark ? 'bg-red-950/40 border-red-700/50' : 'bg-red-50 border-red-300'}`}>
              <div className={`px-4 py-3 flex items-center gap-3 ${isDark ? 'bg-red-900/40' : 'bg-red-100'}`}>
                <span className="text-xl">🤖</span>
                <div>
                  <p className={`text-sm font-bold ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    {t(error)}
                  </p>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-red-400/70' : 'text-red-500'}`}>
                    Provider: <strong>{aiError.provider}</strong> · Model: <strong>{aiError.model}</strong>
                  </p>
                </div>
              </div>
              {aiError.detail && (
                <div className={`px-4 py-3 font-mono text-xs leading-relaxed border-t ${isDark ? 'border-red-900/30 text-red-300/80 bg-red-950/20' : 'border-red-200 text-red-700 bg-red-50/50'}`}>
                  {aiError.detail}
                </div>
              )}
              <div className={`px-4 py-2 border-t text-xs ${isDark ? 'border-red-800/40 text-red-400/60 bg-red-900/10' : 'border-red-200 text-red-600 bg-red-50/20'}`}>
                💡 <strong>Tips:</strong> {(() => {
                  const keyMap: Record<string, string> = {
                    'generator.errors.api.invalid_api_key': 'generator.errors.api.suggestions.invalid_api_key',
                    'generator.errors.api.model_not_supported': 'generator.errors.api.suggestions.model_not_supported',
                    'generator.errors.api.oom_error': 'generator.errors.api.suggestions.oom_error',
                    'generator.errors.api.rate_limit': 'generator.errors.api.suggestions.rate_limit',
                  };
                  const suggestionKey = keyMap[error] || 'generator.errors.api.suggestions.generic';
                  return t(suggestionKey);
                })()}
              </div>
            </div>
          )}

          {isLoading && statusMessage && (
            <div className="flex flex-col items-center justify-center mb-8">
              <div className={`font-medium mb-2 ${statusText}`}>{statusMessage}</div>
              <div className={`w-full max-w-xs rounded-full h-1.5 overflow-hidden ${progressTrack}`}>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full animate-progress animate-infinite" style={{ width: '100%' }} />
              </div>
            </div>
          )}

          {readmeContent ? (
            <ReadmeDisplay markdown={readmeContent} onReset={handleReset} finalElapsedTime={finalElapsedTime} isDark={isDark} />
          ) : (
            <GeneratorForm onGenerate={handleGenerateReadme} isLoading={isLoading} elapsedTime={elapsedTime} isDark={isDark} />
          )}
        </main>

        <InfoSection isDark={isDark} />

        <footer className={`mt-8 text-center text-sm pb-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="opacity-50 text-xs mt-3">{t('app.footer')}</p>
        </footer>
      </div>

      {/* AI Config Modal */}
      <AiConfigModal
        isOpen={showAiConfig}
        onClose={() => setShowAiConfig(false)}
        onSave={handleSaveAiConfig}
        currentConfig={aiConfig}
        isDark={isDark}
      />
    </div>
  );
};

export default App;