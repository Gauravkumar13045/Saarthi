import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { PlaceType } from '../types';

interface WhereToGoProps {
    completionMethods: PlaceType[];
    officialLinks: { title: string; url: string }[];
}

type LocationState = 'prompt' | 'loading' | 'success' | 'manual' | 'error';

const WhereToGo: React.FC<WhereToGoProps> = ({ completionMethods, officialLinks }) => {
    const { t } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [locationState, setLocationState] = useState<LocationState>('prompt');
    const [locationString, setLocationString] = useState('');
    const [manualInput, setManualInput] = useState('');
    
    const physicalMethods = completionMethods.filter(m => m !== 'Online');
    const onlineMethod = completionMethods.find(m => m === 'Online');
    const primaryMethod = physicalMethods.length > 0 ? physicalMethods[0] : null;

    const handleAllowLocation = () => {
        setLocationState('loading');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocationString(`${position.coords.latitude},${position.coords.longitude}`);
                setLocationState('success');
            },
            () => {
                setLocationState('error');
            }
        );
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualInput.trim()) {
            setLocationString(manualInput.trim());
            setLocationState('success');
        }
    };
    
    const getTranslatedPlaceType = (place: PlaceType) => {
        const key = `whereToGo.placeTypes.${place}`;
        return t(key, place);
    };

    if (physicalMethods.length === 0 && !onlineMethod) {
        return null;
    }

    return (
        <details className="bg-brand-off-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg group" onToggle={(e) => setIsOpen(e.currentTarget.open)}>
            <summary className="text-xl font-bold text-gray-800 dark:text-white p-4 sm:p-6 cursor-pointer list-none flex justify-between items-center">
                {t('whereToGo.title')}
                <span className="transition-transform duration-300 group-open:rotate-180 text-brand-indigo dark:text-indigo-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
            </summary>
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-600">
                {isOpen && (
                    <>
                        {locationState !== 'success' && (
                            <div className="p-4 bg-white dark:bg-gray-700 rounded-md">
                                {locationState === 'prompt' && (
                                    <div className="text-center">
                                        <p className="font-semibold text-lg dark:text-gray-200">{t('whereToGo.locationPrompt')}</p>
                                        <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                                            <button onClick={handleAllowLocation} className="button-like bg-brand-teal text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-teal-600 transition-colors no-print">
                                                {t('whereToGo.allowLocation')}
                                            </button>
                                            <button onClick={() => setLocationState('manual')} className="button-like bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors no-print">
                                                {t('whereToGo.manualLocation')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                {locationState === 'loading' && <p className="text-center font-semibold text-brand-gray dark:text-gray-300">{t('whereToGo.findingLocation')}</p>}
                                
                                {locationState === 'error' && <p className="text-center font-semibold text-red-500 mb-4">{t('whereToGo.locationError')}</p>}

                                {(locationState === 'manual' || locationState === 'error') && (
                                     <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="text"
                                            value={manualInput}
                                            onChange={e => setManualInput(e.target.value)}
                                            placeholder={t('whereToGo.enterLocationPlaceholder')}
                                            className="flex-1 min-w-0 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-indigo focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        />
                                        <button type="submit" className="button-like bg-brand-indigo text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-indigo-light transition-colors no-print">{t('whereToGo.getLocation')}</button>
                                    </form>
                                )}
                            </div>
                        )}

                        {locationState === 'success' && primaryMethod && (
                            <div className="space-y-6">
                                <p className="text-lg text-center font-semibold text-gray-800 dark:text-gray-200">
                                    {t('whereToGo.primaryOptionText').replace('{place}', getTranslatedPlaceType(primaryMethod))}
                                </p>
                                <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                                    <iframe
                                        className="absolute top-0 left-0 w-full h-full"
                                        loading="lazy"
                                        src={`https://maps.google.com/maps?q=${encodeURIComponent(`${primaryMethod} near ${locationString}`)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                    ></iframe>
                                </div>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(locationString)}&destination=${encodeURIComponent(primaryMethod)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center button-like bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors no-print"
                                >
                                    {t('whereToGo.getRoute')}
                                </a>
                            </div>
                        )}
                        
                        {onlineMethod && officialLinks[0] && (
                            <div className={`p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-r-lg mt-6`}>
                                <p className="font-semibold text-blue-800 dark:text-blue-300">{t('whereToGo.onlineOption')}</p>
                                <a href={officialLinks[0].url} target="_blank" rel="noopener noreferrer" className="text-brand-indigo dark:text-brand-indigo-light hover:underline font-bold">
                                    {t('whereToGo.goToPortal')} &rarr;
                                </a>
                            </div>
                        )}
                         <div className="mt-8 text-center space-y-4">
                            <p className="text-sm text-brand-gray dark:text-gray-400">{t('whereToGo.showAtCenter')}</p>
                         </div>
                    </>
                )}
            </div>
        </details>
    );
};

export default WhereToGo;