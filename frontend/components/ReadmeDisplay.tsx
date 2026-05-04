import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import { CopyIcon, DownloadIcon } from './icons';

interface ReadmeDisplayProps {
  markdown: string;
  onReset: () => void;
  finalElapsedTime: number | null;
}

type CopyStatus = 'idle' | 'success' | 'error';

export const ReadmeDisplay: React.FC<ReadmeDisplayProps> = ({ markdown, onReset, finalElapsedTime }) => {
  const { t } = useTranslation();
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const [viewMode, setViewMode] = useState<'preview' | 'raw' | 'edit'>('preview');
  const [editedContent, setEditedContent] = useState<string>(markdown);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync editedContent ketika markdown baru datang (streaming)
  React.useEffect(() => {
    setEditedContent(markdown);
  }, [markdown]);

  // Konten yang ditampilkan: pakai hasil editan jika ada, otherwise pakai asli
  const displayContent = viewMode === 'edit' ? editedContent : (editedContent !== markdown ? editedContent : markdown);

  useEffect(() => {
    if (copyStatus !== 'idle') {
      const timer = setTimeout(() => setCopyStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyStatus]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      setCopyStatus('success');
    } catch (err) {
      setCopyStatus('error');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([editedContent], { type: 'text/markdown;charset=utf-8' });
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
        return t('readme.copied');
      case 'error':
        return t('readme.failed');
      default:
        return t('readme.copy');
    }
  };

  // Custom renderers for ReactMarkdown
  const markdownComponents = {
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <img 
        src={src} 
        alt={alt || ''} 
        style={{ display: 'inline', maxWidth: '100%', verticalAlign: 'middle' }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    ),
  };

  const previewStyles = {
    '--color-prettylights-syntax-comment': '#8b949e',
    '--color-prettylights-syntax-constant': '#79c0ff',
    '--color-fg-default': '#c9d1d9',
    '--color-fg-muted': '#8b949e'
  } as React.CSSProperties;

  const PreviewContent = () => (
    <div className="p-8 markdown-body bg-transparent !text-gray-100" style={previewStyles}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeSlug, rehypeRaw]}
        components={markdownComponents}
      >
        {editedContent}
      </ReactMarkdown>
    </div>
  );

  return (
    <>
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
          <div className="flex justify-between items-center px-6 py-3 bg-gray-900 border-b border-gray-700 gap-4">
            {/* Tab Switcher inside Fullscreen */}
            <div className="flex bg-gray-800 p-1 rounded-md border border-gray-700">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                    viewMode === 'preview' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {t('readme.pratinjau')}
                </button>
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                    viewMode === 'raw' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {t('readme.raw')}
                </button>
                <button
                  onClick={() => setViewMode('edit')}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                    viewMode === 'edit' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  ✏️ {t('readme.edit')}
                </button>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors whitespace-nowrap"
            >
              {t('readme.close_expand')}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'preview' && (
              <div className="max-w-4xl mx-auto">
                <PreviewContent />
              </div>
            )}
            {viewMode === 'raw' && (
              <pre className="p-6 text-sm font-mono text-purple-300 whitespace-pre-wrap break-words bg-gray-950 min-h-full">
                {editedContent}
              </pre>
            )}
            {viewMode === 'edit' && (
              <div className="flex flex-col h-full">
                <div className="px-4 py-2 bg-green-900/20 border-b border-green-800/30 text-xs text-green-400">
                  {t('readme.edit_info')}
                </div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="flex-1 w-full p-6 text-sm font-mono text-gray-200 bg-gray-950 resize-none focus:outline-none focus:ring-1 focus:ring-green-500/50"
                  style={{ minHeight: 'calc(100vh - 100px)' }}
                  spellCheck={false}
                />
              </div>
            )}
          </div>
          {/* AI Attribution Disclaimer (Fullscreen) */}
          <div className="px-6 py-3 bg-gray-900 border-t border-gray-800 text-center">
            <p className="text-[10px] text-purple-400 italic">
              {t('readme.footer_attribution')}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-100">{t('readme.header')} {finalElapsedTime !== null && `(${finalElapsedTime}${t('readme.seconds_unit')})`}</h2>
        <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={onReset}
                className="w-full text-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors"
              >
                {t('readme.reset')}
              </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-xl overflow-hidden">
        {/* Header with actions */}
        <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700 flex flex-wrap justify-between items-center gap-3">
          <div className="flex bg-gray-900 p-1 rounded-md border border-gray-700">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                viewMode === 'preview' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('readme.pratinjau')}
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                viewMode === 'raw' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t('readme.raw')}
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                viewMode === 'edit' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              ✏️ {t('readme.edit')}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors"
              title={t('readme.expand')}
            >
              {t('readme.expand')}
            </button>
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
              {t('readme.download')}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          className="overflow-auto custom-scrollbar"
          style={{ minHeight: '400px', height: '60vh', resize: 'vertical' }}
        >
          {viewMode === 'preview' && <PreviewContent />}
          {viewMode === 'raw' && (
            <pre className="p-6 text-sm font-mono text-purple-300 whitespace-pre-wrap break-words bg-gray-950 min-h-[400px]">
              {editedContent}
            </pre>
          )}
          {viewMode === 'edit' && (
            <div className="flex flex-col h-full">
              <div className="px-4 py-2 bg-green-900/20 border-b border-green-800/30 text-xs text-green-400">
                {t('readme.edit_info')}
              </div>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="flex-1 w-full min-h-[450px] p-6 text-sm font-mono text-gray-200 bg-gray-950 resize-none focus:outline-none focus:ring-1 focus:ring-green-500/50"
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* AI Attribution Disclaimer (Visual Only) */}
      <div className="mt-4 p-4 bg-purple-900/10 border border-purple-500/20 rounded-lg flex items-start gap-3">
        <span className="text-xl">ℹ️</span>
        <p className="text-xs text-purple-300 leading-relaxed italic">
          {t('readme.footer_attribution')}
        </p>
      </div>
      </div>
    </>
  );
};
