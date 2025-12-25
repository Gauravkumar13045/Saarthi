
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { INDIAN_LANGUAGES } from '../constants';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage } = useAppContext();

  if (!isOpen) return null;

  const handleLanguageSelect = async (langCode: string) => {
    onClose();
    await setLanguage(langCode);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-white">Select Language</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">&times;</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INDIAN_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`p-2 border rounded-md text-center transition-colors dark:border-gray-600 dark:text-gray-200 ${
                language === lang.code
                  ? 'bg-brand-indigo text-white border-brand-indigo'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
         <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Note: Translations for custom languages are provided by an automated AI service and may not be perfect.
        </p>
      </div>
    </div>
  );
};

export default LanguageModal;