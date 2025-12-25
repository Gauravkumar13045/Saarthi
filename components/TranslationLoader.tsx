import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { INDIAN_LANGUAGES } from '../constants';

const TranslationLoader: React.FC = () => {
    const { language } = useAppContext();
    const langName = INDIAN_LANGUAGES.find(l => l.code === language)?.name || 'your language';
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[200] flex flex-col justify-center items-center text-white text-center p-4">
            <svg className="animate-spin h-12 w-12 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-xl font-semibold">Translating to {langName}...</h2>
            <p className="mt-2 text-gray-300">This may take a moment. Future visits will be faster.</p>
        </div>
    );
};

export default TranslationLoader;