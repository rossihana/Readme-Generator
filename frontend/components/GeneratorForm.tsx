
import React, { useState } from 'react';
import { GitHubIcon } from './icons';
import { GITHUB_URL_REGEX } from '../constants';

interface GeneratorFormProps {
  onGenerate: (githubUrl: string, aiProvider: string) => void;
  isLoading: boolean;
  elapsedTime: number;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, isLoading, elapsedTime }) => {
  const [url, setUrl] = useState<string>('');
  const [aiProvider, setAiProvider] = useState<string>('google');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    if (!url.trim()) {
        setError('URL tidak boleh kosong.');
        return;
    }

    if (!GITHUB_URL_REGEX.test(url)) {
      setError('Harap masukkan URL repositori GitHub yang valid.');
      return;
    }
    setError(null);
    onGenerate(url, aiProvider);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="github-url" className="block text-sm font-medium text-gray-300 mb-2">
          URL Repositori GitHub
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <GitHubIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="github-url"
            name="github-url"
            value={url}
            onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
            }}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-3 pl-10 pr-4 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-gray-500"
            placeholder="https://github.com/username/repository"
            disabled={isLoading}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      <div>
        <label htmlFor="ai-provider" className="block text-sm font-medium text-gray-300 mb-2">
          Pilih Penyedia AI
        </label>
        <div className="relative">
          <select
            id="ai-provider"
            value={aiProvider}
            onChange={(e) => setAiProvider(e.target.value)}
            className="w-full appearance-none bg-gray-900/50 border border-gray-600 rounded-md py-3 pl-4 pr-10 text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 cursor-pointer hover:border-purple-400"
            disabled={isLoading}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.25rem'
            }}
          >
            <option value="google" className="bg-gray-800 text-gray-100">🚀 Google AI Studio - Stabil & Cepat</option>
            <option value="openrouter" className="bg-gray-800 text-gray-100">🌐 OpenRouter - Gratis Publik</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Menghasilkan... ({elapsedTime}s)
          </>
        ) : (
          'Buat README'
        )}
      </button>
    </form>
  );
};
