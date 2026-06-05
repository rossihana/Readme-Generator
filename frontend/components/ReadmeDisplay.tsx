import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Download, Maximize2, X, Edit3, Eye, FileCode, Check, AlertCircle } from 'lucide-react';

interface ReadmeDisplayProps {
  markdown: string;
  onReset: () => void;
  finalElapsedTime: number | null;
  isDark?: boolean;
}

type CopyStatus = 'idle' | 'success' | 'error';

export const ReadmeDisplay: React.FC<ReadmeDisplayProps> = ({ markdown, onReset, finalElapsedTime, isDark = true }) => {
  const { t } = useTranslation();
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const [viewMode, setViewMode] = useState<'preview' | 'raw' | 'edit'>('preview');
  const [editedContent, setEditedContent] = useState<string>(markdown);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    setEditedContent(markdown);
  }, [markdown]);

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
      case 'success': return t('readme.copied');
      case 'error': return t('readme.failed');
      default: return t('readme.copy');
    }
  };

  const markdownComponents = {
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <img 
        src={src} 
        alt={alt || ''} 
        className="inline-block max-w-full align-middle rounded-lg shadow-md my-2"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    ),
  };

  const previewStyles = isDark ? ({
    '--color-prettylights-syntax-comment': '#8b949e',
    '--color-prettylights-syntax-constant': '#79c0ff',
    '--color-fg-default': '#c9d1d9',
    '--color-fg-muted': '#8b949e'
  } as React.CSSProperties) : ({} as React.CSSProperties);

  const PreviewContent = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 sm:p-8 markdown-body bg-transparent ${isDark ? '!text-gray-100' : '!text-gray-900'}`}
      style={previewStyles}
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeSlug, rehypeRaw, [rehypeHighlight, { ignoreMissing: true }]]}
        components={markdownComponents}
      >
        {editedContent}
      </ReactMarkdown>
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="relative"
    >
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-gray-950 flex flex-col"
          >
            <div className="flex justify-between items-center px-6 py-3 bg-gray-900 border-b border-gray-700 gap-4">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-bold text-gray-200">README.md</span>
              </div>
              
              <div className="flex bg-gray-800 p-1 rounded-md border border-gray-700">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded transition-all ${
                      viewMode === 'preview' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t('readme.pratinjau')}
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded transition-all ${
                      viewMode === 'raw' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    {t('readme.raw')}
                  </button>
                  <button
                    onClick={() => setViewMode('edit')}
                    className={`flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded transition-all ${
                      viewMode === 'edit' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {t('readme.edit')}
                  </button>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
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
                      <div className="px-4 py-2 bg-green-900/20 border-b border-green-800/30 text-xs text-green-400 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5" />
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
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            <FileCode className="w-6 h-6 text-purple-400" />
            {t('readme.header')} {finalElapsedTime !== null && `(${finalElapsedTime}${t('readme.seconds_unit')})`}
          </h2>
          <button
            onClick={onReset}
            className={`w-full sm:w-auto px-6 py-2 font-semibold rounded-lg border transition-colors ${
              isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700' : 'bg-white hover:bg-gray-100 text-gray-600 border-gray-300'
            }`}
          >
            {t('readme.reset')}
          </button>
        </div>

        <div className={`rounded-xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`px-4 py-3 border-b flex flex-wrap justify-between items-center gap-3 ${
            isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`flex p-1 rounded-lg border ${
              isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'preview' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                {t('readme.pratinjau')}
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'raw' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                {t('readme.raw')}
              </button>
              <button
                onClick={() => setViewMode('edit')}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === 'edit' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                {t('readme.edit')}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
                title={t('readme.expand')}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  copyStatus === 'success' ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                }`}
              >
                {copyStatus === 'success' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {getCopyButtonText()}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-lg border border-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                {t('readme.download')}
              </button>
            </div>
          </div>

          <div className={`overflow-auto custom-scrollbar ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`} style={{ minHeight: '400px', height: '65vh', resize: 'vertical' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {viewMode === 'preview' && <PreviewContent />}
                {viewMode === 'raw' && (
                  <pre className="p-6 text-sm font-mono text-purple-300 whitespace-pre-wrap break-words h-full">
                    {editedContent}
                  </pre>
                )}
                {viewMode === 'edit' && (
                  <div className="flex flex-col h-full">
                    <div className="px-4 py-2 bg-green-900/20 border-b border-green-800/30 text-xs text-green-400 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {t('readme.edit_info')}
                    </div>
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="flex-1 w-full p-6 text-sm font-mono text-gray-200 bg-gray-950 resize-none focus:outline-none focus:ring-1 focus:ring-green-500/50"
                      spellCheck={false}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5" />
          <p className="text-xs text-purple-300 leading-relaxed italic">
            {t('readme.footer_attribution')}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
