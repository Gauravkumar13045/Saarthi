import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useScrollAnimator } from '../hooks/useScrollAnimator';

const HeroIllustration = () => {
    const [glowStyle, setGlowStyle] = useState({ 
        opacity: 0, 
        background: 'radial-gradient(circle, #fff, #fff)'
    });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const isDark = document.documentElement.classList.contains('dark');
        
        const lightGradient = `radial-gradient(300px circle at ${x}px ${y}px, rgba(251, 191, 36, 0.6), rgba(236, 72, 153, 0.5), rgba(20, 184, 166, 0.5), transparent 80%)`;
        const darkGradient = `radial-gradient(350px circle at ${x}px ${y}px, rgba(251, 191, 36, 0.35), rgba(236, 72, 153, 0.3), rgba(20, 184, 166, 0.3), transparent 70%)`;
        
        setGlowStyle({
            opacity: 1,
            background: isDark ? darkGradient : lightGradient
        });
    };

    const handleMouseLeave = () => {
        setGlowStyle(prev => ({ ...prev, opacity: 0 }));
    };
    
    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-lg mx-auto cursor-pointer"
        >
            <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:opacity-50"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:opacity-50"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:opacity-50"></div>
            
            <div className="relative p-4">
                 {/* The interactive glow effect div */}
                <div 
                    className="absolute inset-0 transition-opacity duration-500 ease-out"
                    style={{ 
                        ...glowStyle,
                        filter: document.documentElement.classList.contains('dark') ? 'blur(60px)' : 'blur(40px)',
                        zIndex: 0,
                    }}
                ></div>

                 <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="relative z-10 transition-transform duration-300 ease-in-out group-hover:scale-105">
                    <path
                        fill="#6366F1" d="M39.6,-61.6C51.6,-53.2,61.9,-42.6,69.9,-29.8C77.9,-17,83.6,-2.1,81.1,11.8C78.6,25.8,67.9,38.8,55.9,49.8C43.8,60.8,30.4,69.8,16.2,74.2C2,78.6,-12.9,78.4,-27.9,73.4C-42.9,68.4,-57.9,58.6,-66.3,45.6C-74.7,32.6,-76.5,16.3,-75.4,0.8C-74.4,-14.7,-70.5,-29.4,-61.8,-41.2C-53.1,-53,-39.6,-61.9,-26,-68.1C-12.4,-74.3,-6.2,-77.8,2,-79.3C10.2,-80.7,20.4,-80.1,29.1,-74.4C37.8,-68.7,45,-58.3,39.6,-61.6Z" transform="translate(100 100)" />
                </svg>
            </div>
        </div>
    );
};


const HomePage = () => {
    const { t, isSimpleMode } = useAppContext();
    const [howItWorksRef, isHowItWorksVisible] = useScrollAnimator<HTMLElement>();
    const [entryCardsRef, isEntryCardsVisible] = useScrollAnimator<HTMLElement>();
    const [step1Ref, isStep1Visible] = useScrollAnimator<HTMLDivElement>({ threshold: 0.2 });
    const [step2Ref, isStep2Visible] = useScrollAnimator<HTMLDivElement>({ threshold: 0.2 });
    const [step3Ref, isStep3Visible] = useScrollAnimator<HTMLDivElement>({ threshold: 0.2 });
    const [taskCardRef, isTaskCardVisible] = useScrollAnimator<HTMLDivElement>({ threshold: 0.2 });
    const [schemeCardRef, isSchemeCardVisible] = useScrollAnimator<HTMLDivElement>({ threshold: 0.2 });


  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-teal-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                {t('home.heroTitle')}
              </h1>
              <p className="mt-4 text-lg text-brand-gray dark:text-gray-300">
                {t('home.heroSubtitle')}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/life-tasks" className="w-full sm:w-auto text-center bg-brand-indigo text-white px-8 py-3 rounded-md font-semibold hover:bg-brand-indigo-light transition-transform hover:scale-105 btn-glow button-like">
                  {t('nav.startJourney')}
                </Link>
              </div>
            </div>
            <div className="group">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      {!isSimpleMode && (
          <section ref={howItWorksRef} className={`py-20 scroll-reveal ${isHowItWorksVisible ? 'scroll-reveal--visible' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">{t('home.howItWorksTitle')}</h2>
              <div className="mt-12 grid gap-8 md:grid-cols-3">
                <div ref={step1Ref} className={`text-center p-6 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all scroll-reveal ${isStep1Visible ? 'scroll-reveal--visible' : ''}`}>
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-indigo text-white mx-auto text-2xl font-bold transition-transform hover:scale-110">1</div>
                  <h3 className="mt-5 text-lg font-semibold dark:text-white">{t('home.step1Title')}</h3>
                  <p className="mt-2 text-base text-brand-gray dark:text-gray-400">{t('home.step1Desc')}</p>
                </div>
                <div ref={step2Ref} className={`text-center p-6 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all scroll-reveal ${isStep2Visible ? 'scroll-reveal--visible' : ''}`} style={{ transitionDelay: '150ms' }}>
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-teal text-white mx-auto text-2xl font-bold transition-transform hover:scale-110">2</div>
                  <h3 className="mt-5 text-lg font-semibold dark:text-white">{t('home.step2Title')}</h3>
                  <p className="mt-2 text-base text-brand-gray dark:text-gray-400">{t('home.step2Desc')}</p>
                </div>
                <div ref={step3Ref} className={`text-center p-6 rounded-lg hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all scroll-reveal ${isStep3Visible ? 'scroll-reveal--visible' : ''}`} style={{ transitionDelay: '300ms' }}>
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-brand-orange text-white mx-auto text-2xl font-bold transition-transform hover:scale-110">3</div>
                  <h3 className="mt-5 text-lg font-semibold dark:text-white">{t('home.step3Title')}</h3>
                  <p className="mt-2 text-base text-brand-gray dark:text-gray-400">{t('home.step3Desc')}</p>
                </div>
              </div>
            </div>
          </section>
      )}

      {/* Entry Cards Section */}
      <section ref={entryCardsRef} className={`py-20 bg-white dark:bg-gray-800 scroll-reveal ${isEntryCardsVisible ? 'scroll-reveal--visible' : ''}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <div ref={taskCardRef} className={`bg-brand-off-white dark:bg-gray-700/50 p-8 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-brand-teal simplified-card scroll-reveal hover:-translate-y-2 ${isTaskCardVisible ? 'scroll-reveal--visible' : ''}`}>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tasks.title')}</h3>
            <p className="mt-2 text-brand-gray dark:text-gray-300">{t('tasks.description')}</p>
            <Link to="/life-tasks" className="inline-block mt-6 text-brand-indigo dark:text-brand-indigo-light font-semibold hover:underline">
              {t('home.exploreTasks')} &rarr;
            </Link>
          </div>
          <div ref={schemeCardRef} className={`bg-brand-off-white dark:bg-gray-700/50 p-8 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-brand-orange simplified-card scroll-reveal hover:-translate-y-2 ${isSchemeCardVisible ? 'scroll-reveal--visible' : ''}`} style={{ transitionDelay: '150ms' }}>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('schemes.title')}</h3>
            <p className="mt-2 text-brand-gray dark:text-gray-300">{t('schemes.description')}</p>
            <Link to="/govt-schemes" className="inline-block mt-6 text-brand-indigo dark:text-brand-indigo-light font-semibold hover:underline">
              {t('home.exploreSchemes')} &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;