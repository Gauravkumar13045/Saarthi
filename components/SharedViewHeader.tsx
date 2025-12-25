import React from 'react';
import Logo from '../assets/logo';
import { useAppContext } from '../hooks/useAppContext';

const SharedViewHeader = () => {
    const { t } = useAppContext();
    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm print:shadow-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center gap-4">
                    <Logo className="h-10 w-10" />
                    <span className="font-bold text-xl text-brand-indigo">{t('app_name')}</span>
                </div>
                 <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-r-lg">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                        {t('familyShare.cscNote')}
                    </p>
                </div>
            </div>
        </header>
    );
};

export default SharedViewHeader;
