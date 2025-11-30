import React, { useState, useEffect } from 'react';
import { GeneratorForm } from './components/GeneratorForm';
import { ReadmeDisplay } from './components/ReadmeDisplay';
import { SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [finalElapsedTime, setFinalElapsedTime] = useState<number | null>(null);

  const handleGenerateReadme = async (githubUrl: string): Promise<void> => {
    console.log('handleGenerateReadme called. githubUrl:', githubUrl);
    setIsLoading(true);
    setError(null);
    setStartTime(Date.now());
    setElapsedTime(0);
    setFinalElapsedTime(null); // Reset final time on new generation
    console.log('State after initial set: isLoading:', true, 'startTime:', Date.now(), 'elapsedTime:', 0);
    console.log('Mengirim permintaan ke backend dengan URL:', githubUrl);

    try {
      const response = await fetch('http://localhost:8001/generate-readme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ githubUrl: githubUrl }),
      });

      console.log('Menerima respons dari backend. Status:', response.status);

      if (!response.ok) {
          const errorData = await response.json();
          console.error('Kesalahan respons backend:', errorData);
          let detailMessage = 'Gagal menghasilkan README. Pastikan URL GitHub valid dan coba lagi.';
          if (typeof errorData.detail === 'object' && errorData.detail !== null) {
            detailMessage = JSON.stringify(errorData.detail);
          } else if (typeof errorData.detail === 'string') {
            detailMessage = errorData.detail;
          }
          throw new Error(detailMessage);
        }

      const data = await response.json();
      console.log('Data respons berhasil:', data);
      setReadmeContent(data.readme); // Perhatikan: Mengubah data.readme_content menjadi data.readme
      console.log('setReadmeContent dipanggil dengan konten:', data.readme);

    } catch (err: any) {
      let errorMessage = 'Terjadi kesalahan tak terduga. Silakan coba lagi nanti.';
      if (err instanceof Error) {
        if (typeof err.message === 'object' && err.message !== null) {
          errorMessage = JSON.stringify(err.message);
        } else {
          errorMessage = err.message;
        }
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      console.error('Kesalahan saat menghasilkan README:', err);
    } finally {
      setIsLoading(false);
      if (startTime) {
        setFinalElapsedTime((Date.now() - startTime) / 1000);
      }
      console.log('Proses generate README selesai.');
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
        <header className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-2">
             <SparklesIcon className="w-8 h-8 text-purple-400" />
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              AI README Generator
            </h1>
          </div>
          <p className="text-md sm:text-lg text-gray-400">
            Tempel tautan repositori GitHub untuk membuat file README.md.
          </p>
        </header>

        <main className="bg-gray-800/50 rounded-xl shadow-2xl shadow-purple-500/10 p-6 sm:p-8 border border-gray-700">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}
          {readmeContent ? (
            <ReadmeDisplay markdown={readmeContent} onReset={handleReset} finalElapsedTime={finalElapsedTime} />
          ) : (
            <GeneratorForm onGenerate={handleGenerateReadme} isLoading={isLoading} elapsedTime={elapsedTime} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;