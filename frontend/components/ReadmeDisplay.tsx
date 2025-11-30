import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CopyIcon, DownloadIcon } from './icons';

interface ReadmeDisplayProps {
  markdown: string;
  onReset: () => void;
  finalElapsedTime: number | null;
}

type CopyStatus = 'idle' | 'success' | 'error';

export const ReadmeDisplay: React.FC<ReadmeDisplayProps> = ({ markdown, onReset, finalElapsedTime }) => {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  useEffect(() => {
    if (copyStatus !== 'idle') {
      const timer = setTimeout(() => setCopyStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyStatus]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyStatus('success');
    } catch (err) {
      console.error('Failed to copy: ', err);
      setCopyStatus('error');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'README.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCopyButtonText = () => {
    switch (copyStatus) {
      case 'success':
        return 'Disalin!';
      case 'error':
        return 'Gagal!';
      default:
        return 'Salin Kode';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-100">Hasil README {finalElapsedTime !== null && `(${finalElapsedTime.toFixed(1)}s)`}</h2>
        <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onReset}
              className="w-full text-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors"
            >
              Buat Baru
            </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700">
        {/* Header with actions */}
        <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-400">Pratinjau</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                copyStatus === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <CopyIcon className="w-4 h-4" />
              {getCopyButtonText()}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold rounded-md transition-colors"
            >
              <DownloadIcon className="w-4 h-4" />
              Unduh .md
            </button>
          </div>
        </div>

        {/* Markdown Preview */}
        <div 
            className="p-6 markdown-body bg-transparent !text-gray-100" 
            style={{'--color-prettylights-syntax-comment': '#8b949e', '--color-prettylights-syntax-constant': '#79c0ff', '--color-prettylights-syntax-entity': '#d2a8ff', '--color-prettylights-syntax-storage-modifier-import': '#c9d1d9', '--color-prettylights-syntax-entity-tag': '#7ee787', '--color-prettylights-syntax-keyword': '#ff7b72', '--color-prettylights-syntax-string': '#a5d6ff', '--color-prettylights-syntax-variable': '#ffa657', '--color-prettylights-syntax-brackethighlighter-unmatched': '#f85149', '--color-prettylights-syntax-invalid-illegal-text': '#f0f6fc', '--color-prettylights-syntax-invalid-illegal-bg': '#8e1519', '--color-prettylights-syntax-carriage-return-text': '#f0f6fc', '--color-prettylights-syntax-carriage-return-bg': '#b62324', '--color-prettylights-syntax-string-regexp': '#7ee787', '--color-prettylights-syntax-markup-list': '#f2cc60', '--color-prettylights-syntax-markup-heading': '#1f6feb', '--color-prettylights-syntax-markup-italic': '#c9d1d9', '--color-prettylights-syntax-markup-bold': '#c9d1d9', '--color-prettylights-syntax-markup-deleted-text': '#ffdcd7', '--color-prettylights-syntax-markup-deleted-bg': '#67060c', '--color-prettylights-syntax-markup-inserted-text': '#aff5b4', '--color-prettylights-syntax-markup-inserted-bg': '#033a16', '--color-prettylights-syntax-markup-changed-text': '#ffdfb6', '--color-prettylights-syntax-markup-changed-bg': '#5a1e02', '--color-prettylights-syntax-markup-ignored-text': '#c9d1d9', '--color-prettylights-syntax-markup-ignored-bg': '#1158c7', '--color-prettylights-syntax-meta-diff-range': '#d2a8ff', '--color-prettylights-syntax-brackethighlighter-angle': '#8b949e', '--color-prettylights-syntax-sublimelinter-gutter-mark': '#484f58', '--color-prettylights-syntax-constant-other-reference-link': '#a5d6ff', '--color-fg-default': '#c9d1d9', '--color-fg-muted': '#8b949e'} as React.CSSProperties}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
