import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useScrollAnimator } from '../hooks/useScrollAnimator';

// Simple SVG Icons for illustration
const IconChoose = () => (
    <svg className="w-full h-full text-brand-indigo" viewBox="0 0 200 200">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A5B4FC" />
                <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
        </defs>
        <rect x="20" y="40" width="160" height="120" rx="10" fill="url(#grad1)"/>
        <path d="M40 70h100" stroke="white" strokeWidth="6" strokeLinecap="round"/>
        <path d="M40 95h120" stroke="white" strokeWidth="6" strokeLinecap="round"/>
        <path d="M40 120h80" stroke="white" strokeWidth="6" strokeLinecap="round"/>
    </svg>
);

const IconFollow = () => (
    <svg className="w-full h-full text-brand-teal" viewBox="0 0 200 200">
        <path d="M30 60 L170 60" stroke="#14B8A6" strokeWidth="8" strokeLinecap="round" />
        <path d="M30 100 L170 100" stroke="#14B8A6" strokeWidth="8" strokeLinecap="round" />
        <path d="M30 140 L170 140" stroke="#14B8A6" strokeWidth="8" strokeLinecap="round" />
        <circle cx="50" cy="60" r="10" fill="#A7F3D0" stroke="#14B8A6" strokeWidth="4"/>
        <circle cx="80" cy="100" r="10" fill="#A7F3D0" stroke="#14B8A6" strokeWidth="4"/>
        <circle cx="40" cy="140" r="10" fill="#A7F3D0" stroke="#14B8A6" strokeWidth="4"/>
    </svg>
);

const IconAchieve = () => (
    <svg className="w-full h-full text-brand-orange" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="#FDBA74" />
        <path d="m70 105 25 25 45-45" stroke="white" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
);


const HowItWorksPage = () => {
    const { t } = useAppContext();
    const [step1Ref, isStep1Visible] = useScrollAnimator<HTMLDivElement>();
    const [step2Ref, isStep2Visible] = useScrollAnimator<HTMLDivElement>();
    const [step3Ref, isStep3Visible] = useScrollAnimator<HTMLDivElement>();

    return (
        <div className="bg-white dark:bg-gray-800 py-12 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">{t('howItWorksPage.title')}</h1>
                    <p className="mt-4 text-lg text-brand-gray max-w-3xl mx-auto dark:text-gray-300">{t('howItWorksPage.subtitle')}</p>
                </div>

                <div className="mt-20">
                    {/* Step 1 */}
                    <div ref={step1Ref} className={`grid md:grid-cols-2 gap-12 items-center scroll-reveal ${isStep1Visible ? 'scroll-reveal--visible' : ''}`}>
                        <div>
                            <span className="inline-block px-3 py-1 text-sm font-semibold text-brand-indigo bg-indigo-100 rounded-full dark:bg-indigo-900/50 dark:text-indigo-300">Step 1</span>
                            <h2 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">{t('howItWorksPage.step1Title')}</h2>
                            <p className="mt-4 text-lg text-brand-gray dark:text-gray-300">{t('howItWorksPage.step1Desc')}</p>
                        </div>
                        <div className="p-8 bg-indigo-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center h-64 transition-transform hover:scale-105">
                            <IconChoose />
                        </div>
                    </div>

                    <hr className="my-16 border-t border-gray-200 dark:border-gray-700" />

                    {/* Step 2 */}
                    <div ref={step2Ref} className={`grid md:grid-cols-2 gap-12 items-center scroll-reveal ${isStep2Visible ? 'scroll-reveal--visible' : ''}`}>
                        <div className="p-8 bg-teal-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center h-64 md:order-last transition-transform hover:scale-105">
                           <IconFollow />
                        </div>
                        <div>
                             <span className="inline-block px-3 py-1 text-sm font-semibold text-brand-teal bg-teal-100 rounded-full dark:bg-teal-900/50 dark:text-teal-300">Step 2</span>
                            <h2 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">{t('howItWorksPage.step2Title')}</h2>
                            <p className="mt-4 text-lg text-brand-gray dark:text-gray-300">{t('howItWorksPage.step2Desc')}</p>
                        </div>
                    </div>

                    <hr className="my-16 border-t border-gray-200 dark:border-gray-700" />

                    {/* Step 3 */}
                    <div ref={step3Ref} className={`grid md:grid-cols-2 gap-12 items-center scroll-reveal ${isStep3Visible ? 'scroll-reveal--visible' : ''}`}>
                        <div>
                             <span className="inline-block px-3 py-1 text-sm font-semibold text-brand-orange bg-orange-100 rounded-full dark:bg-orange-900/50 dark:text-orange-300">Step 3</span>
                            <h2 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">{t('howItWorksPage.step3Title')}</h2>
                            <p className="mt-4 text-lg text-brand-gray dark:text-gray-300">{t('howItWorksPage.step3Desc')}</p>
                        </div>
                         <div className="p-8 bg-orange-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-center h-64 transition-transform hover:scale-105">
                            <IconAchieve />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorksPage;