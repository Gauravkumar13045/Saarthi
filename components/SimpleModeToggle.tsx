import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

const SimpleModeToggle = () => {
  const { isSimpleMode, toggleSimpleMode, t } = useAppContext();

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
  
  const CloseIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
  );

  return (
    <div className="flex items-center space-x-3">
      <label htmlFor="simple-mode-toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer whitespace-nowrap">
        {t('nav.simpleModeLabel')}
      </label>
      <button
        id="simple-mode-toggle"
        onClick={toggleSimpleMode}
        aria-pressed={isSimpleMode}
        className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-indigo dark:ring-offset-gray-900 ${
          isSimpleMode ? 'bg-brand-teal' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-flex items-center justify-center w-6 h-6 transform bg-white rounded-full transition-transform duration-300 ease-in-out shadow-lg ring-1 ring-gray-900/5 ${
            isSimpleMode ? 'translate-x-7' : 'translate-x-1'
          }`}
        >
          <span className={`transition-opacity duration-200 ${isSimpleMode ? 'opacity-100' : 'opacity-0'}`}>
            <CheckIcon />
          </span>
           <span className={`absolute transition-opacity duration-200 ${!isSimpleMode ? 'opacity-100' : 'opacity-0'}`}>
            <CloseIcon />
          </span>
        </span>
      </button>
    </div>
  );
};

export default SimpleModeToggle;