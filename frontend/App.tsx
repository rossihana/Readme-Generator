import React, { useState, useEffect } from 'react';
import { GeneratorForm } from './components/GeneratorForm';
import { ReadmeDisplay } from './components/ReadmeDisplay';
import { SparklesIcon } from './components/icons';
import { InfoSection } from './components/InfoSection';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const App: React.FC = () => {
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [finalElapsedTime, setFinalElapsedTime] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const { t } = useTranslation();

  const handleGenerateReadme = async (githubUrl: string, preferences: any): Promise<void> => {
    setIsLoading(true);
    setReadmeContent('');
    setError(null);
    const startTimeNow = Date.now();
    setStartTime(startTimeNow);
    setElapsedTime(0);
    setFinalElapsedTime(null);

    const statuses = [
      t('generator.loading.connect'),
      t('generator.loading.fetch'),
      t('generator.loading.analyze'),
      t('generator.loading.generate')
    ];
    
    let statusIndex = 0;
    setStatusMessage(statuses[statusIndex]);
    const intervalId = setInterval(() => {
      statusIndex = Math.min(statusIndex + 1, statuses.length - 1);
      setStatusMessage(statuses[statusIndex]);
    }, 3000);

    const API_BASE = import.meta.env.VITE_API_URL || '/api';

    try {
      const response = await fetch(`${API_BASE}/generate-readme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl, preferences }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Gagal menghasilkan README.');
      }

      const data = await response.json();
      setReadmeContent(data.readme);

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan tak terduga.');
    } finally {
      clearInterval(intervalId);
      setIsLoading(false);
      setStatusMessage('');
      setFinalElapsedTime(Math.floor((Date.now() - startTimeNow) / 1000));
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading && startTime) {
      interval = setInterval(() => {
        const newElapsedTime = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(newElapsedTime);
      }, 1000);
    } else if (!isLoading && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, startTime]);

  const handleReset = () => {
    setReadmeContent('');
    setError(null);
    setFinalElapsedTime(null); // Reset final time on reset
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto">
        <div className="w-full flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <header className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-2">
             <SparklesIcon className="w-8 h-8 text-purple-400" />
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              {t('app.title')}
            </h1>
          </div>
          <p className="text-md sm:text-lg text-gray-400">
            {t('app.tagline')}
          </p>
        </header>

        <main className="bg-gray-800/50 rounded-xl shadow-2xl shadow-purple-500/10 p-6 sm:p-8 border border-gray-700">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-center">
              {t(error)}
            </div>
          )}

          {isLoading && statusMessage && (
            <div className="flex flex-col items-center justify-center mb-8 animate-pulse">
               <div className="text-purple-400 font-medium mb-2">{statusMessage}</div>
               <div className="w-full max-w-xs bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full animate-progress animate-infinite" style={{ width: '100%' }}></div>
               </div>
            </div>
          )}
          {readmeContent ? (
            <ReadmeDisplay markdown={readmeContent} onReset={handleReset} finalElapsedTime={finalElapsedTime} />
          ) : (
            <GeneratorForm onGenerate={handleGenerateReadme} isLoading={isLoading} elapsedTime={elapsedTime} />
          )}
        </main>

        <InfoSection />

        <footer className="mt-8 text-center text-sm text-gray-500 pb-8">
          <p className="opacity-50 text-xs mt-3">{t('app.footer')}</p>
        </footer>
      </div>
    </div>

  );
};

export default App;