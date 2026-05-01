import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from './icons';

type SectionType = 'faq' | 'privacy' | 'tos' | null;


export const InfoSection: React.FC = () => {
    const [activeSection, setActiveSection] = useState<SectionType>(null);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const { t } = useTranslation();
    const FAQ_ITEMS = t('info.faq.items', { returnObjects: true }) as any[];

    const toggleSection = (section: SectionType) => {
        if (activeSection === section) {
            setActiveSection(null);
        } else {
            setActiveSection(section);
        }
    };

    return (
        <div className="mt-12 w-full max-w-4xl mx-auto space-y-4 pb-12">
            <div className="flex items-center gap-3 mb-6 px-2">
                <div className="h-px flex-1 bg-gray-800"></div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">{t('info.header')}</h2>
                <div className="h-px flex-1 bg-gray-800"></div>
            </div>

            {/* Horizontal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard 
                    title={t('info.faq.title')} 
                    active={activeSection === 'faq'} 
                    onClick={() => toggleSection('faq')} 
                />
                <InfoCard 
                    title={t('info.privacy.title')} 
                    active={activeSection === 'privacy'} 
                    onClick={() => toggleSection('privacy')} 
                />
                <InfoCard 
                    title={t('info.tos.title')} 
                    active={activeSection === 'tos'} 
                    onClick={() => toggleSection('tos')} 
                />
            </div>

            {/* Expanded Content Area */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeSection ? 'max-h-[2000px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm relative shadow-2xl">
                    <button 
                        onClick={() => setActiveSection(null)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {activeSection === 'faq' && (
                        <div className="animate-fadeIn">
                             <h3 className="text-xl font-bold text-white mb-6">{t('info.faq.header')}</h3>
                             <div className="space-y-4">
                                {FAQ_ITEMS.map((item, index) => {
                                    const isExpanded = expandedFaq === index;
                                    return (
                                        <div key={index} className="border-b border-gray-700/50 pb-4">
                                            <button 
                                                className="w-full flex items-center justify-between text-left group"
                                                onClick={() => setExpandedFaq(isExpanded ? null : index)}
                                            >
                                                <span className={`text-sm font-semibold transition-colors ${isExpanded ? 'text-purple-400' : 'text-gray-200 group-hover:text-purple-300'}`}>
                                                    {item.q}
                                                </span>
                                                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-purple-400' : ''}`} />
                                            </button>
                                            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-60 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap pl-1">
                                                    {item.a}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                             </div>
                        </div>
                    )}

                    {activeSection === 'privacy' && (
                        <div className="animate-fadeIn prose prose-invert prose-sm max-w-none">
                            <h3 className="text-xl font-bold text-white mb-4">{t('info.privacy.header')}</h3>
                            <p className="text-gray-400">{t('info.privacy.updated')}</p>
                            <p className="text-gray-300 mt-4 leading-relaxed">
                                {t('info.privacy.desc')}
                            </p>
                            <ul className="list-disc pl-5 mt-4 text-gray-400 space-y-2">
                                {(t('info.privacy.points', { returnObjects: true }) as string[]).map((point, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: point }}></li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {activeSection === 'tos' && (
                        <div className="animate-fadeIn prose prose-invert prose-sm max-w-none">
                            <h3 className="text-xl font-bold text-white mb-4">{t('info.tos.header')}</h3>
                            <p className="text-gray-400">{t('info.tos.updated')}</p>
                            <p className="text-gray-300 mt-4 leading-relaxed">
                                {t('info.tos.desc')}
                            </p>
                            <ul className="list-disc pl-5 mt-4 text-gray-400 space-y-2">
                                {(t('info.tos.points', { returnObjects: true }) as string[]).map((point, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: point }}></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface InfoCardProps {
    title: string;
    active: boolean;
    onClick: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`p-4 rounded-xl border transition-all duration-300 text-left group relative overflow-hidden ${
            active 
            ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/50' 
            : 'bg-gray-800/40 border-gray-700/50 hover:border-purple-500/30 hover:bg-gray-800/60'
        }`}
    >
        <div className="flex items-center justify-between relative z-10">
            <span className={`text-sm font-bold transition-colors ${active ? 'text-purple-400' : 'text-gray-400 group-hover:text-gray-200'}`}>
                {title}
            </span>
            <ChevronDownIcon className={`w-4 h-4 transition-all duration-300 ${active ? 'rotate-180 text-purple-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
        </div>
        {active && (
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
        )}
    </button>
);
