import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GitHubIcon } from './icons';
import { GITHUB_URL_REGEX } from '../constants';

interface OutputPreferences {
  projectPurpose: string | null;
  language: string;
  tone: string;
  complexity: string;
  includeSections: string[];
  targetAudience: string; 
  verbosity: string;
  useEmojis: boolean;
  useIcons: boolean;
  logoUrl: string;
  screenshotUrl: string;
  includeTOC: boolean;
}

interface GeneratorFormProps {
  onGenerate: (githubUrl: string, preferences: OutputPreferences) => void;
  isLoading: boolean;
  elapsedTime: number;
}

const PRESET_CARDS = [
  {
    id: 'portfolio',
    title: 'presets.portfolio.title',
    desc: 'presets.portfolio.desc',
  },
  {
    id: 'academic',
    title: 'presets.academic.title',
    desc: 'presets.academic.desc',
  },
  {
    id: 'opensource',
    title: 'presets.opensource.title',
    desc: 'presets.opensource.desc',
  }
];

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, isLoading, elapsedTime }) => {
  const [url, setUrl] = useState<string>('');
  const [showCustomization, setShowCustomization] = useState<boolean>(false);
  const [hasManualChanges, setHasManualChanges] = useState<boolean>(false);
  const [pendingPreset, setPendingPreset] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<OutputPreferences>({
    projectPurpose: null,
    language: 'indonesian',
    tone: 'professional',
    complexity: 'standard',
    includeSections: ['Features', 'Installation', 'Usage'], // Default base
    targetAudience: 'developer',
    verbosity: 'comprehensive',
    useEmojis: true,
    useIcons: true,
    logoUrl: '',
    screenshotUrl: '',
    includeTOC: true
  });
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Helper to translate section IDs
  const sectionT = (id: string) => {
    const keyMap: Record<string, string> = {
      'Features': 'features',
      'Installation': 'installation',
      'Usage': 'usage',
      'Contributing': 'contributing',
      'License': 'license',
      'Configuration': 'configuration',
      'Roadmap': 'roadmap',
      'FAQ': 'faq',
      'Badges': 'badges',
      'Tech Stack': 'tech_stack',
      'Authors': 'authors',
      'Directory Structure': 'directory_structure'
    };
    return t(`generator.sections.${keyMap[id] || id.toLowerCase().replace(' ', '_')}`);
  };

  const ESSENTIAL_SECTIONS = ['Features', 'Installation', 'Usage'];
  const STANDARD_SECTIONS = ['Contributing', 'License', 'Configuration', 'Roadmap', 'FAQ'];
  const ADVANCED_SECTIONS = [
    { id: 'Badges' },
    { id: 'Tech Stack' },
    { id: 'Authors' },
    { id: 'Directory Structure' }
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || !preferences.projectPurpose) return;

    if (!url.trim()) {
        setError(t('generator.errors.empty_url'));
        return;
    }

    if (!GITHUB_URL_REGEX.test(url)) {
      setError(t('generator.errors.invalid_url'));
      return;
    }
    setError(null);
    onGenerate(url, preferences);
  };

  const handleSectionToggle = (section: string) => {
    setHasManualChanges(true);
    setPreferences(prev => ({
      ...prev,
      includeSections: prev.includeSections.includes(section)
        ? prev.includeSections.filter(s => s !== section)
        : [...prev.includeSections, section]
    }));
  };

  const handlePresetSelect = (presetId: string) => {
    if (hasManualChanges && preferences.projectPurpose && preferences.projectPurpose !== presetId) {
      setPendingPreset(presetId);
      return;
    }
    applyPreset(presetId);
  };

  const applyPreset = (presetId: string) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, projectPurpose: presetId };
      setHasManualChanges(false);
      setPendingPreset(null);
      
      if (presetId === 'academic') {
        newPrefs.tone = 'technical';
        newPrefs.targetAudience = 'developer';
        newPrefs.verbosity = 'comprehensive';
        newPrefs.includeSections = [...ESSENTIAL_SECTIONS, 'Configuration', 'FAQ', 'Directory Structure', 'License'];
      } else if (presetId === 'opensource') {
        newPrefs.tone = 'professional';
        newPrefs.targetAudience = 'developer';
        newPrefs.verbosity = 'comprehensive';
        newPrefs.includeSections = [...ESSENTIAL_SECTIONS, 'Contributing', 'License', 'Roadmap', 'FAQ', 'Badges', 'Tech Stack', 'Authors'];
      } else if (presetId === 'portfolio') {
        newPrefs.tone = 'professional';
        newPrefs.targetAudience = 'developer';
        newPrefs.verbosity = 'comprehensive';
        newPrefs.includeSections = [...ESSENTIAL_SECTIONS, 'License', 'Tech Stack', 'Authors'];
      }
      
      return newPrefs;
    });
  };

  const getButtonText = () => {
    if (isLoading) return `${t('generator.button.generating')} (${elapsedTime}s)`;
    if (!preferences.projectPurpose) return t('generator.button.select_preset');
    
    // Get translated title for the selected preset
    const presetKey = preferences.projectPurpose === 'opensource' ? 'opensource' : preferences.projectPurpose;
    const title = t(`presets.${presetKey}.title`);
    return `${t('generator.button.generate_prefix')} (${title})`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="github-url" className="block text-sm font-medium text-gray-300 mb-2">
          {t('generator.step2')}
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
            placeholder={t('generator.placeholder')}
            disabled={isLoading}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-300 italic opacity-80">
            {t('presets.header')}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_CARDS.map((card) => (
            <button
              type="button"
              key={card.id}
              disabled={isLoading}
              onClick={() => handlePresetSelect(card.id)}
              className={`text-left p-4 rounded-xl border ${
                preferences.projectPurpose === card.id
                  ? 'bg-purple-900/40 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800'
              } transition-all duration-300 flex flex-col gap-2 relative overflow-hidden group`}
            >
              {preferences.projectPurpose === card.id && (
                 <div className="absolute top-0 right-0 w-8 h-8 bg-purple-500 transform translate-x-4 -translate-y-4 rotate-45"></div>
              )}
              <h3 className={`text-sm font-bold transition-colors ${preferences.projectPurpose === card.id ? 'text-purple-300' : 'text-gray-100'}`}>
                {t(card.title)}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{t(card.desc)}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !preferences.projectPurpose}
        className={`w-full flex justify-center items-center gap-2 font-bold py-4 px-4 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-4 focus:ring-purple-500/50 text-lg ${
            !preferences.projectPurpose || isLoading
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-900/30 hover:scale-[1.02]'
        }`}
      >
        {isLoading && (
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        )}
        <span className="flex flex-col items-center">
            <span>{getButtonText()}</span>
            {preferences.projectPurpose && !isLoading && (
               <span className="text-[10px] font-normal opacity-70 uppercase tracking-widest mt-1">
                 {preferences.includeSections.length} {t('generator.button.section_count')}
               </span>
            )}
        </span>
      </button>

      {/* Warning Dialog for Preset Reset */}
      {pendingPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-800 border border-purple-500/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">{t('generator.warning.title')}</h3>
            <p className="text-sm text-gray-400 mb-6">
              {t('generator.warning.desc')}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setPendingPreset(null)}
                className="flex-1 py-2 rounded-lg bg-gray-700 text-white text-sm font-semibold hover:bg-gray-600 transition-colors"
                type="button"
              >
                {t('generator.warning.cancel')}
              </button>
              <button 
                onClick={() => applyPreset(pendingPreset || '')}
                className="flex-1 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 shadow-lg shadow-purple-900/20 transition-all"
                type="button"
              >
                {t('generator.warning.continue')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-gray-700/50 mt-8">
        <button
          type="button"
          onClick={() => setShowCustomization(!showCustomization)}
          className="w-full flex items-center justify-between p-3 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">🛠️</span> {t('generator.pro_mode')}
          </span>
          <span className="text-gray-500">{showCustomization ? '▲' : '▼'}</span>
        </button>

        {showCustomization && (
          <div className="mt-4 p-5 bg-gray-900/60 rounded-lg border border-gray-700 space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {t('generator.options.lang_label')}
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded py-2 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="indonesian">{t('generator.options.lang_id')}</option>
                  <option value="english">{t('generator.options.lang_en')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {t('generator.options.tone_label')}
                </label>
                <select
                  value={preferences.tone}
                  onChange={(e) => setPreferences({ ...preferences, tone: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded py-2 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="professional">{t('generator.options.tone_prof')}</option>
                  <option value="technical">{t('generator.options.tone_tech')}</option>
                  <option value="casual">{t('generator.options.tone_casual')}</option>
                  <option value="creative">{t('generator.options.tone_creative')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {t('generator.options.audience_label')}
                </label>
                <select
                  value={preferences.targetAudience}
                  onChange={(e) => setPreferences({ ...preferences, targetAudience: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded py-2 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="developer">{t('generator.options.audience_dev')}</option>
                  <option value="end-user">{t('generator.options.audience_user')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {t('generator.options.verbosity_label')}
                </label>
                <select
                  value={preferences.verbosity}
                  onChange={(e) => setPreferences({ ...preferences, verbosity: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded py-2 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="comprehensive">{t('generator.options.verbosity_full')}</option>
                  <option value="minimal">{t('generator.options.verbosity_min')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {t('generator.options.logo_label')}
                </label>
                <input
                  type="text"
                  value={preferences.logoUrl}
                  onChange={(e) => setPreferences({ ...preferences, logoUrl: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded py-2 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-purple-500"
                  placeholder={t('generator.options.logo_placeholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {t('generator.options.screenshot_label')}
                </label>
                <input
                  type="text"
                  value={preferences.screenshotUrl}
                  onChange={(e) => setPreferences({ ...preferences, screenshotUrl: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded py-2 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-purple-500"
                  placeholder={t('generator.options.screenshot_placeholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {t('generator.options.visual_label')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={preferences.useEmojis}
                    onChange={(e) => setPreferences({ ...preferences, useEmojis: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-900 text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-purple-300 transition-colors">{t('generator.options.emoji')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={preferences.useIcons}
                    onChange={(e) => setPreferences({ ...preferences, useIcons: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-900 text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-purple-300 transition-colors">{t('generator.options.icons')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={preferences.includeTOC}
                    onChange={(e) => setPreferences({ ...preferences, includeTOC: e.target.checked })}
                    className="rounded border-gray-600 bg-gray-900 text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-purple-300 transition-colors">{t('generator.options.toc')}</span>
                </label>
              </div>
            </div>

            <div className="space-y-6">
              {/* Grup Essential Sections */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  {t('generator.groups.foundation')} <span className="text-[9px] font-normal lowercase opacity-60">({t('generator.groups.foundation_desc')})</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ESSENTIAL_SECTIONS.map((section) => (
                    <label key={section} className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={preferences.includeSections.includes(section)}
                        onChange={() => handleSectionToggle(section)}
                        className="rounded border-gray-600 bg-gray-900 text-purple-600 focus:ring-purple-500 h-4 w-4"
                      />
                      <span className="text-sm text-gray-300 group-hover:text-purple-300 transition-colors">
                        {sectionT(section)} <span className="text-[9px] opacity-40 ml-1 font-normal italic">({t('generator.recommended')})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Grup Standar */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                  {t('generator.groups.general')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STANDARD_SECTIONS.map((section) => (
                    <label key={section} className="flex items-center gap-2 cursor-pointer group p-2 rounded hover:bg-gray-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={preferences.includeSections.includes(section)}
                        onChange={() => handleSectionToggle(section)}
                        className="rounded border-gray-600 bg-gray-900 text-purple-600 focus:ring-purple-500 h-4 w-4"
                      />
                      <span className="text-sm text-gray-300 group-hover:text-purple-300 transition-colors">{sectionT(section)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Grup Lanjutan */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                  {t('generator.groups.extra')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {ADVANCED_SECTIONS.map((section) => (
                    <label key={section.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={preferences.includeSections.includes(section.id)}
                          onChange={() => handleSectionToggle(section.id)}
                          className="rounded border-gray-600 bg-gray-900 text-purple-600 focus:ring-purple-500 h-4 w-4"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-purple-300 transition-colors">{sectionT(section.id)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};
