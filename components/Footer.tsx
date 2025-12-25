import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo';
import { useAppContext } from '../hooks/useAppContext';

const Footer = () => {
  const { t } = useAppContext();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t-4 border-brand-indigo no-print">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: About Saarthi */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo className="h-10 w-10" />
              <span className="font-bold text-2xl text-brand-indigo">{t('app_name')}</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Saarthi simplifies essential life tasks and government schemes for every Indian, providing clear guidance in simple language.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/life-tasks" className="text-base text-gray-500 hover:text-brand-indigo dark:text-gray-400 dark:hover:text-brand-indigo-light transition-colors">{t('nav.lifeTasks')}</Link>
              </li>
              <li>
                <Link to="/govt-schemes" className="text-base text-gray-500 hover:text-brand-indigo dark:text-gray-400 dark:hover:text-brand-indigo-light transition-colors">{t('nav.govtSchemes')}</Link>
              </li>
               <li>
                <Link to="/how-it-works" className="text-base text-gray-500 hover:text-brand-indigo dark:text-gray-400 dark:hover:text-brand-indigo-light transition-colors">{t('nav.howItWorks')}</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-base text-gray-500 hover:text-brand-indigo dark:text-gray-400 dark:hover:text-brand-indigo-light transition-colors">{t('nav.dashboard')}</Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Legal/Important */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">Important</h3>
             <ul className="mt-4 space-y-2">
              <li>
                <Link to="#" className="text-base text-gray-500 hover:text-brand-indigo dark:text-gray-400 dark:hover:text-brand-indigo-light transition-colors">Disclaimer</Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-base text-gray-500 dark:text-gray-400 text-center">&copy; {new Date().getFullYear()} Saarthi. All rights reserved.</p>
           <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
                This is a conceptual project. Information may not be accurate. Always consult official sources.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;