import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import LanguageModal from './LanguageModal';
import { Theme } from '../types';
import Logo from '../assets/logo';
import SimpleModeToggle from './SimpleModeToggle';

const ThemeToggle = () => {
    const { theme, setTheme } = useAppContext();

    const cycleTheme = () => {
        const themes: Theme[] = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const Icon = () => {
        if (theme === 'light') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>;
        if (theme === 'dark') return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>;
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>;
    };

    return (
        <button onClick={cycleTheme} className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Icon />
        </button>
    );
};

const Navbar = () => {
  const { t, language, setLanguage, isSimpleMode } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: {isActive: boolean}) => 
    `py-2 px-3 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-brand-indigo-light text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`;

  const mobileNavLinkClass = ({ isActive }: {isActive: boolean}) => 
    `block py-2 px-3 rounded-md text-base font-medium transition-colors ${isActive ? 'bg-brand-indigo text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <NavLink to="/" className="flex-shrink-0 flex items-center gap-4">
                <Logo className="h-10 w-10 transition-transform duration-300 ease-in-out hover:scale-110" />
                <span className="font-bold text-xl text-brand-indigo">{t('app_name')}</span>
              </NavLink>
              <div className="hidden lg:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {!isSimpleMode && <NavLink to="/how-it-works" className={navLinkClass}>{t('nav.howItWorks')}</NavLink>}
                  <NavLink to="/life-tasks" className={navLinkClass}>{t('nav.lifeTasks')}</NavLink>
                  <NavLink to="/govt-schemes" className={navLinkClass}>{t('nav.govtSchemes')}</NavLink>
                </div>
              </div>
            </div>
            <div className="flex items-center">
                <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                  <SimpleModeToggle />
                  <ThemeToggle />
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 text-sm font-semibold">
                    <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded-full transition-colors ${language === 'en' ? 'bg-white dark:bg-gray-600 shadow text-brand-indigo dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>E</button>
                    <button onClick={() => setLanguage('hi')} className={`px-3 py-1 rounded-full transition-colors ${language === 'hi' ? 'bg-white dark:bg-gray-600 shadow text-brand-indigo dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>H</button>
                    <button onClick={() => setIsModalOpen(true)} className={`px-3 py-1 rounded-full transition-colors ${language !== 'en' && language !== 'hi' ? 'bg-white dark:bg-gray-600 shadow text-brand-indigo dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>C</button>
                  </div>
                  <NavLink to="/dashboard" className="bg-brand-indigo text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-indigo-light transition-colors">
                    {t('nav.dashboard')}
                  </NavLink>
                </div>
                <div className="flex lg:hidden ml-4">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="bg-gray-200 dark:bg-gray-700 inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none">
                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
                    </svg>
                  </button>
                </div>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {!isSimpleMode && <NavLink to="/how-it-works" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>{t('nav.howItWorks')}</NavLink>}
              <NavLink to="/life-tasks" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>{t('nav.lifeTasks')}</NavLink>
              <NavLink to="/govt-schemes" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>{t('nav.govtSchemes')}</NavLink>
              
              {/* Controls for mobile only */}
              <div className="md:hidden border-t border-gray-200 dark:border-gray-700 mt-3 pt-3 space-y-3">
                <NavLink to="/dashboard" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>{t('nav.dashboard')}</NavLink>
                <div className="px-3">
                    <SimpleModeToggle />
                </div>
                <div className="flex items-center justify-between px-3">
                    <span className="text-base font-medium text-gray-700 dark:text-gray-200">Theme</span>
                    <ThemeToggle />
                </div>
                <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 text-sm font-semibold mt-2">
                      <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded-full transition-colors ${language === 'en' ? 'bg-white dark:bg-gray-600 shadow text-brand-indigo dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>E</button>
                      <button onClick={() => setLanguage('hi')} className={`px-3 py-1 rounded-full transition-colors ${language === 'hi' ? 'bg-white dark:bg-gray-600 shadow text-brand-indigo dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>H</button>
                      <button onClick={() => setIsModalOpen(true)} className={`px-3 py-1 rounded-full transition-colors ${language !== 'en' && language !== 'hi' ? 'bg-white dark:bg-gray-600 shadow text-brand-indigo dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>C</button>
                  </div>
              </div>
            </div>
          </div>
        )}
      </nav>
      <LanguageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Navbar;