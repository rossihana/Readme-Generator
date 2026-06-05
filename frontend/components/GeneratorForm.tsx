import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings2, 
  Layout, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  Globe,
  MessageSquare,
  Users,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
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
  deployUrl: string;
  includeTOC: boolean;
}

interface GeneratorFormProps {
  onGenerate: (githubUrl: string, preferences: OutputPreferences) => void;
  isLoading: boolean;
  elapsedTime: number;
  isDark?: boolean;
}

const PRESET_CARDS = [
  {
    id: 'portfolio',
    title: 'presets.portfolio.title',
    desc: 'presets.portfolio.desc',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'academic',
    title: 'presets.academic.title',
    desc: 'presets.academic.desc',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'opensource',
    title: 'presets.opensource.title',
    desc: 'presets.opensource.desc',
    icon: <Globe className="w-5 h-5" />
  }
];

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, isLoading, elapsedTime, isDark = true }) => {
  const [url, setUrl] = useState<string>('');
  const [showCustomization, setShowCustomization] = useState<boolean>(false);
  const [hasManualChanges, setHasManualChanges] = useState<boolean>(false);
  const [pendingPreset, setPendingPreset] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<OutputPreferences>({
    projectPurpose: null,
    language: 'indonesian',
    tone: 'professional',
    complexity: 'standard',
    includeSections: ['Features', 'Installation', 'Usage'],
    targetAudience: 'developer',
    verbosity: 'comprehensive',
    useEmojis: true,
    useIcons: true,
    logoUrl: '',
    screenshotUrl: '',
    deployUrl: '',
    includeTOC: true
  });
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

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
        newPrefs.includeSections = [...ESSENTIAL_SECTIONS, 'Badges', 'License', 'Tech Stack', 'Authors'];
      }
      
      return newPrefs;
    });
  };

  const getButtonText = () => {
    if (isLoading) return `${t('generator.button.generating')} (${elapsedTime}s)`;
    if (!preferences.projectPurpose) return t('generator.button.select_preset');
    const presetKey = preferences.projectPurpose === 'opensource' ? 'opensource' : preferences.projectPurpose;
    const title = t(`presets.${presetKey}.title`);
    return `${t('generator.button.generate_prefix')} (${title})`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step 1: GitHub URL */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label htmlFor="github-url" className={`block text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          <GitHubIcon className="w-4 h-4 text-purple-400" />
          {t('generator.step2')}
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <LinkIcon className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input
            type="text"
            id="github-url"
            value={url}
            onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
            }}
            className={`w-full border rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-inner ${
              isDark
                ? 'bg-gray-900/50 border-gray-700 text-gray-100 placeholder-gray-600'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
            placeholder={t('generator.placeholder')}
            disabled={isLoading}
          />
        </div>
        {error && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 text-sm text-red-400 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </motion.div>

      {/* Step 2: Presets */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <label className={`block text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Layout className="w-4 h-4 text-purple-400" />
            {t('presets.header')}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_CARDS.map((card, idx) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              key={card.id}
              disabled={isLoading}
              onClick={() => handlePresetSelect(card.id)}
              className={`text-left p-5 rounded-2xl border transition-all duration-300 flex flex-col gap-3 relative overflow-hidden group ${
                preferences.projectPurpose === card.id
                  ? 'bg-purple-900/30 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.2)] ring-1 ring-purple-500'
                  : isDark
                  ? 'bg-gray-800/40 border-gray-700 hover:border-gray-500 hover:bg-gray-800/60'
                  : 'bg-gray-50 border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'
              }`}
            >
              <div className={`p-2 rounded-lg w-fit ${
                preferences.projectPurpose === card.id
                  ? 'bg-purple-500 text-white'
                  : isDark ? 'bg-gray-700 text-gray-400 group-hover:text-gray-200' : 'bg-gray-200 text-gray-500 group-hover:text-gray-700'
              }`}>
                {card.icon}
              </div>
              <div>
                <h3 className={`text-sm font-bold mb-1 transition-colors ${
                  preferences.projectPurpose === card.id
                    ? 'text-white'
                    : isDark ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {t(card.title)}
                </h3>
                <p className={`text-xs leading-relaxed transition-colors ${isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-700'}`}>
                  {t(card.desc)}
                </p>
              </div>
              {preferences.projectPurpose === card.id && (
                <motion.div 
                  layoutId="activePreset"
                  className="absolute top-2 right-2 text-purple-400"
                >
                  <CheckCircle2 className="w-5 h-5 fill-purple-400 text-gray-900" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={isLoading || !preferences.projectPurpose}
        className={`w-full flex flex-col justify-center items-center py-5 px-6 rounded-2xl shadow-xl transition-all duration-500 group relative overflow-hidden ${
            !preferences.projectPurpose || isLoading
              ? isDark
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          {isLoading ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
          ) : (
            <Sparkles className={`w-6 h-6 ${preferences.projectPurpose ? 'animate-pulse' : ''}`} />
          )}
          <span className="text-lg font-bold tracking-tight">{getButtonText()}</span>
        </div>
        
        <AnimatePresence>
          {preferences.projectPurpose && !isLoading && (
            <motion.span 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.7, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1"
            >
              {preferences.includeSections.length} {t('generator.button.section_count')}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Advanced Options Toggle */}
      <div className="pt-4">
        <button
          type="button"
          onClick={() => setShowCustomization(!showCustomization)}
          className={`w-full flex items-center justify-between p-4 border rounded-xl text-sm font-semibold transition-all group ${
            isDark
              ? 'bg-gray-800/30 hover:bg-gray-800/60 border-gray-800 text-gray-400 hover:text-gray-200'
              : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-3">
            <Settings2 className={`w-5 h-5 transition-transform duration-500 ${showCustomization ? 'rotate-90 text-purple-400' : 'group-hover:rotate-45'}`} />
            {t('generator.pro_mode')}
          </span>
          {showCustomization ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showCustomization && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className={`mt-4 p-6 rounded-2xl border space-y-8 ${
                isDark ? 'bg-gray-900/40 border-gray-800' : 'bg-gray-50 border-gray-200'
              }`}>
                {/* Select Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      <Globe className="w-3 h-3" /> {t('generator.options.lang_label')}
                    </label>
                    <div className="relative group/select">
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                        className={`w-full border rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer hover:border-gray-500 transition-all ${
                          isDark ? 'bg-gray-950 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="indonesian" className="bg-gray-900">{t('generator.options.lang_id')}</option>
                        <option value="english" className="bg-gray-900">{t('generator.options.lang_en')}</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover/select:text-purple-400 pointer-events-none transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      <MessageSquare className="w-3 h-3" /> {t('generator.options.tone_label')}
                    </label>
                    <div className="relative group/select">
                      <select
                        value={preferences.tone}
                        onChange={(e) => setPreferences({ ...preferences, tone: e.target.value })}
                        className={`w-full border rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer hover:border-gray-500 transition-all ${
                          isDark ? 'bg-gray-950 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="professional" className="bg-gray-900">{t('generator.options.tone_prof')}</option>
                        <option value="technical" className="bg-gray-900">{t('generator.options.tone_tech')}</option>
                        <option value="casual" className="bg-gray-900">{t('generator.options.tone_casual')}</option>
                        <option value="creative" className="bg-gray-900">{t('generator.options.tone_creative')}</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover/select:text-purple-400 pointer-events-none transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Target & Verbosity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      <Users className="w-3 h-3" /> {t('generator.options.audience_label')}
                    </label>
                    <div className="relative group/select">
                      <select
                        value={preferences.targetAudience}
                        onChange={(e) => setPreferences({ ...preferences, targetAudience: e.target.value })}
                        className={`w-full border rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer hover:border-gray-500 transition-all ${
                          isDark ? 'bg-gray-950 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="developer" className="bg-gray-900">{t('generator.options.audience_dev')}</option>
                        <option value="end-user" className="bg-gray-900">{t('generator.options.audience_user')}</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover/select:text-purple-400 pointer-events-none transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      <FileText className="w-3 h-3" /> {t('generator.options.verbosity_label')}
                    </label>
                    <div className="relative group/select">
                      <select
                        value={preferences.verbosity}
                        onChange={(e) => setPreferences({ ...preferences, verbosity: e.target.value })}
                        className={`w-full border rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer hover:border-gray-500 transition-all ${
                          isDark ? 'bg-gray-950 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="comprehensive" className="bg-gray-900">{t('generator.options.verbosity_full')}</option>
                        <option value="minimal" className="bg-gray-900">{t('generator.options.verbosity_min')}</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover/select:text-purple-400 pointer-events-none transition-colors" />
                    </div>
                  </div>
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      <ImageIcon className="w-3 h-3" /> {t('generator.options.logo_label')}
                    </label>
                    <input
                      type="text"
                      value={preferences.logoUrl}
                      onChange={(e) => setPreferences({ ...preferences, logoUrl: e.target.value })}
                      className={`w-full border rounded-lg py-2.5 px-4 text-sm ${
                        isDark ? 'bg-gray-800/50 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('generator.options.logo_placeholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      <ImageIcon className="w-3 h-3" /> {t('generator.options.screenshot_label')}
                    </label>
                    <input
                      type="text"
                      value={preferences.screenshotUrl}
                      onChange={(e) => setPreferences({ ...preferences, screenshotUrl: e.target.value })}
                      className={`w-full border rounded-lg py-2.5 px-4 text-sm ${
                        isDark ? 'bg-gray-800/50 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('generator.options.screenshot_placeholder')}
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      <LinkIcon className="w-3 h-3" /> {t('generator.options.deploy_label')}
                    </label>
                    <input
                      type="text"
                      value={preferences.deployUrl}
                      onChange={(e) => setPreferences({ ...preferences, deployUrl: e.target.value })}
                      className={`w-full border rounded-lg py-2.5 px-4 text-sm ${
                        isDark ? 'bg-gray-800/50 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('generator.options.deploy_placeholder')}
                    />
                  </div>
                </div>

                {/* Section Selection */}
                <div className={`space-y-6 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                  {/* Section group headers pick up from isDark context */}
                  <div>
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{t('generator.groups.foundation')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {ESSENTIAL_SECTIONS.map((section) => (
                        <label key={section} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            preferences.includeSections.includes(section)
                              ? isDark
                                ? 'bg-purple-900/20 border-purple-500/50 text-purple-200'
                                : 'bg-purple-100 border-purple-400 text-purple-800'
                              : isDark
                                ? 'bg-gray-800/30 border-gray-700 text-gray-400 hover:border-gray-600'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50'
                          }`}>
                          <input
                            type="checkbox"
                            checked={preferences.includeSections.includes(section)}
                            onChange={() => handleSectionToggle(section)}
                            className="hidden"
                          />
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${preferences.includeSections.includes(section) ? 'bg-purple-500 border-purple-500' : isDark ? 'border-gray-600' : 'border-gray-400'}`}>
                            {preferences.includeSections.includes(section) && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-xs font-semibold">{sectionT(section)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{t('generator.groups.general')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {STANDARD_SECTIONS.map((section) => (
                        <label key={section} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            preferences.includeSections.includes(section)
                              ? isDark
                                ? 'bg-purple-900/20 border-purple-500/50 text-purple-200'
                                : 'bg-purple-100 border-purple-400 text-purple-800'
                              : isDark
                                ? 'bg-gray-800/30 border-gray-700 text-gray-400 hover:border-gray-600'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50'
                          }`}>
                          <input
                            type="checkbox"
                            checked={preferences.includeSections.includes(section)}
                            onChange={() => handleSectionToggle(section)}
                            className="hidden"
                          />
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${preferences.includeSections.includes(section) ? 'bg-purple-500 border-purple-500' : isDark ? 'border-gray-600' : 'border-gray-400'}`}>
                            {preferences.includeSections.includes(section) && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-xs font-semibold">{sectionT(section)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{t('generator.groups.extra')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {ADVANCED_SECTIONS.map((section) => (
                        <label key={section.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            preferences.includeSections.includes(section.id)
                              ? isDark
                                ? 'bg-purple-900/20 border-purple-500/50 text-purple-200'
                                : 'bg-purple-100 border-purple-400 text-purple-800'
                              : isDark
                                ? 'bg-gray-800/30 border-gray-700 text-gray-400 hover:border-gray-600'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-purple-50'
                          }`}>
                          <input
                            type="checkbox"
                            checked={preferences.includeSections.includes(section.id)}
                            onChange={() => handleSectionToggle(section.id)}
                            className="hidden"
                          />
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${preferences.includeSections.includes(section.id) ? 'bg-purple-500 border-purple-500' : isDark ? 'border-gray-600' : 'border-gray-400'}`}>
                            {preferences.includeSections.includes(section.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-xs font-semibold">{sectionT(section.id)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Warning Dialog */}
      <AnimatePresence>
        {pendingPreset && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`border rounded-3xl p-8 max-w-sm w-full shadow-2xl ${
                isDark ? 'bg-gray-900 border-purple-500/30' : 'bg-white border-purple-300/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('generator.warning.title')}</h3>
              <p className={`text-sm leading-relaxed mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('generator.warning.desc')}
              </p>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setPendingPreset(null)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${
                    isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('generator.warning.cancel')}
                </button>
                <button 
                  type="button"
                  onClick={() => applyPreset(pendingPreset || '')}
                  className="flex-1 py-3 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-500 shadow-lg shadow-purple-900/30 transition-all"
                >
                  {t('generator.warning.continue')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};
