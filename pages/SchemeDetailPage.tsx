import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import ReadAloud from '../components/ReadAloud';
import VideoModal from '../components/VideoModal';
import { Scheme } from '../types';
import WhereToGo from '../components/WhereToGo';
import BookmarkIcon from '../components/BookmarkIcon';
import { fetchSchemeById } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import EligibilityCheck from '../components/EligibilityCheck';
import { eligibilityData } from '../data/eligibilityQuestions';
import ScamAlert from '../components/ScamAlert';
import { scamAlertData } from '../data/scamAlerts';
import { useScrollAnimator } from '../hooks/useScrollAnimator';
import FamilyShare from '../components/FamilyShare';

// Default View Components
const DetailSection: React.FC<{ title: string; children: React.ReactNode; delay?: number }> = ({ title, children, delay = 0 }) => {
    const [ref, isVisible] = useScrollAnimator<HTMLDivElement>();
    return (
        <div ref={ref} className={`py-6 border-b border-gray-200 dark:border-gray-700 scroll-reveal ${isVisible ? 'scroll-reveal--visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-2">{children}</div>
        </div>
    );
};

const DefaultSchemeDetail: React.FC<{ scheme: Scheme, onVideoOpen: () => void, textToRead: string }> = ({ scheme, onVideoOpen, textToRead }) => {
    const { t, savedSchemes, toggleSaveScheme } = useAppContext();
    const isSaved = savedSchemes.includes(scheme.id);
    const schemeEligibility = eligibilityData[scheme.id];
    const schemeAlerts = scamAlertData[scheme.id];
    const [whereToGoRef, isWhereToGoVisible] = useScrollAnimator<HTMLDivElement>();
    const [disclaimerRef, isDisclaimerVisible] = useScrollAnimator<HTMLDivElement>();


    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
             <Link to="/govt-schemes" className="inline-block mb-4 text-brand-indigo dark:text-brand-indigo-light font-semibold hover:underline no-print no-share">
                {t('schemeDetail.backToSchemes')}
            </Link>
            <div className="flex items-start">
                <div className="flex-grow">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t(scheme.name, scheme.name)}</h1>
                    <p className="mt-2 text-lg text-brand-gray dark:text-gray-400">{scheme.category} / {scheme.type} {scheme.state ? `(${scheme.state})` : ''}</p>
                </div>
                <div className="flex items-center ml-auto flex-shrink-0 no-share">
                    <ReadAloud textToRead={textToRead} />
                    <BookmarkIcon
                        isSaved={isSaved}
                        onClick={() => toggleSaveScheme(scheme.id)}
                        label={t('schemeDetail.saveForLater')}
                        savedLabel={t('schemeDetail.removeFromSaved')}
                    />
                    <button 
                        onClick={() => window.print()}
                        className="no-print p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title={t('whereToGo.printPage')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                    </button>
                </div>
            </div>

            {schemeAlerts && <ScamAlert alerts={schemeAlerts} />}

            {schemeEligibility && (
                <EligibilityCheck
                    questions={schemeEligibility.questions}
                    onCheckComplete={(result) => { /* Optional: handle result */ }}
                />
            )}

            <div className="mt-10">
                <DetailSection title={t('schemeDetail.simpleExplanation')}>
                    <p>{scheme.description}</p>
                </DetailSection>

                <DetailSection title={t('schemeDetail.eligibility')} delay={100}>
                    <ul className="list-disc list-inside">
                        {scheme.eligibility.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </DetailSection>

                <DetailSection title={t('schemeDetail.benefits')} delay={200}>
                    <ul className="list-disc list-inside">
                        {scheme.benefits.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </DetailSection>
                
                <DetailSection title={t('schemeDetail.importantDates')} delay={300}>
                    <p><strong>{t('schemeDetail.launchDate')}:</strong> {new Date(scheme.launchDate).toLocaleDateString()}</p>
                    {scheme.deadline && <p><strong>{t('schemeDetail.deadline')}:</strong> {scheme.deadline}</p>}
                </DetailSection>

                <DetailSection title={t('schemeDetail.requiredDocuments')} delay={400}>
                    <ul className="list-disc list-inside">
                        {scheme.documents.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </DetailSection>
                
                <DetailSection title={t('schemeDetail.howToApply')} delay={500}>
                    <p>{scheme.applicationProcess}</p>
                    <a href={scheme.officialLink} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 bg-brand-indigo text-white px-6 py-2 rounded-md font-semibold hover:bg-brand-indigo-light transition-colors no-print">
                        {t('schemeDetail.officialPortal')} &rarr;
                    </a>
                </DetailSection>
                
                <div ref={whereToGoRef} className={`py-6 border-b border-gray-200 dark:border-gray-700 scroll-reveal ${isWhereToGoVisible ? 'scroll-reveal--visible' : ''}`} style={{ transitionDelay: '600ms' }}>
                    <WhereToGo completionMethods={scheme.completionMethods} officialLinks={[{title: t('schemeDetail.officialPortal'), url: scheme.officialLink}]} />
                </div>

                {scheme.moreInfo && (
                    <DetailSection title={t('schemeDetail.moreInfo')} delay={700}>
                        {scheme.moreInfo.type === 'video' ? (
                            <button onClick={onVideoOpen} className="w-full text-left text-brand-indigo dark:text-brand-indigo-light hover:underline font-semibold no-print">
                                {t('schemeDetail.watchVideo')}: {scheme.moreInfo.title} &rarr;
                            </button>
                        ) : (
                            <a href={scheme.moreInfo.url} target="_blank" rel="noopener noreferrer" className="text-brand-indigo dark:text-brand-indigo-light hover:underline font-semibold break-words no-print">
                                {t('schemeDetail.readArticle')}: {scheme.moreInfo.title} &rarr;
                            </a>
                        )}
                    </DetailSection>
                )}
                
                 <div className="mt-12 no-share">
                    <FamilyShare itemId={scheme.id} itemType="scheme" />
                </div>

                <div ref={disclaimerRef} className={`mt-12 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-r-lg scroll-reveal ${isDisclaimerVisible ? 'scroll-reveal--visible' : ''}`} style={{ transitionDelay: '800ms' }}>
                    <p className="text-sm text-red-700 dark:text-red-300">{t('schemeDetail.disclaimer')}</p>
                </div>
            </div>
        </div>
    );
};

// Simple View Component
const SimpleSchemeDetail: React.FC<{ scheme: Scheme, onVideoOpen: () => void, textToRead: string }> = ({ scheme, onVideoOpen, textToRead }) => {
    const { t, savedSchemes, toggleSaveScheme } = useAppContext();
    const isSaved = savedSchemes.includes(scheme.id);
    const schemeEligibility = eligibilityData[scheme.id];
    const schemeAlerts = scamAlertData[scheme.id];

    
    const SimpleInfoSection: React.FC<{title: string, items: string[], delay?: number}> = ({ title, items, delay = 0 }) => {
        const [ref, isVisible] = useScrollAnimator<HTMLDivElement>();
        return (
            <div ref={ref} className={`mt-8 scroll-reveal ${isVisible ? 'scroll-reveal--visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
                <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{title}</h2>
                <ul className="space-y-3">
                    {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-brand-off-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                            <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span className="text-gray-800 dark:text-gray-200">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )
    };

    const [howToApplyRef, isHowToApplyVisible] = useScrollAnimator<HTMLDivElement>();
    const [whereToGoRef, isWhereToGoVisible] = useScrollAnimator<HTMLDivElement>();
    const [moreInfoRef, isMoreInfoVisible] = useScrollAnimator<HTMLDivElement>();

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link to="/govt-schemes" className="inline-block mb-4 text-brand-indigo dark:text-brand-indigo-light font-semibold hover:underline no-print no-share">
                {t('schemeDetail.backToSchemes')}
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white text-center">{t(scheme.name, scheme.name)}</h1>
            <div className="mt-4 flex justify-center items-center gap-2 no-share">
                 <ReadAloud textToRead={textToRead} />
                 <BookmarkIcon
                    isSaved={isSaved}
                    onClick={() => toggleSaveScheme(scheme.id)}
                    label={t('schemeDetail.saveForLater')}
                    savedLabel={t('schemeDetail.removeFromSaved')}
                  />
                 <button 
                    onClick={() => window.print()}
                    className="no-print p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title={t('whereToGo.printPage')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                </button>
            </div>

            {schemeAlerts && <ScamAlert alerts={schemeAlerts} />}

            {schemeEligibility && (
                <EligibilityCheck
                    questions={schemeEligibility.questions}
                    onCheckComplete={(result) => { /* Optional: handle result */ }}
                />
            )}

            <div className="mt-8">
                <p className="text-lg text-center text-gray-700 dark:text-gray-300">{scheme.description}</p>
            </div>
            
            <SimpleInfoSection title={t('schemeDetail.eligibility')} items={scheme.eligibility} />
            <SimpleInfoSection title={t('schemeDetail.benefits')} items={scheme.benefits} delay={100} />
            <SimpleInfoSection title={t('schemeDetail.requiredDocuments')} items={scheme.documents} delay={200} />

            <div ref={howToApplyRef} className={`mt-10 text-center scroll-reveal ${isHowToApplyVisible ? 'scroll-reveal--visible' : ''}`} style={{ transitionDelay: '300ms' }}>
                 <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">{t('schemeDetail.howToApply')}</h2>
                 <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">{scheme.applicationProcess}</p>
                 <a href={scheme.officialLink} target="_blank" rel="noopener noreferrer" className="button-like inline-block bg-brand-indigo text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-indigo-light transition-colors no-print">
                    {t('schemeDetail.officialPortal')} &rarr;
                </a>
            </div>
            
             <div ref={whereToGoRef} className={`mt-12 scroll-reveal ${isWhereToGoVisible ? 'scroll-reveal--visible' : ''}`} style={{ transitionDelay: '400ms' }}>
                <WhereToGo completionMethods={scheme.completionMethods} officialLinks={[{title: t('schemeDetail.officialPortal'), url: scheme.officialLink}]} />
            </div>

            {scheme.moreInfo && (
                <div ref={moreInfoRef} className={`mt-12 text-center no-print scroll-reveal ${isMoreInfoVisible ? 'scroll-reveal--visible' : ''}`} style={{ transitionDelay: '500ms' }}>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{t('schemeDetail.moreInfo')}</h2>
                     {scheme.moreInfo.type === 'video' ? (
                        <button onClick={onVideoOpen} className="button-like bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                            {t('schemeDetail.watchVideo')}
                        </button>
                    ) : (
                        <a href={scheme.moreInfo.url} target="_blank" rel="noopener noreferrer" className="button-like inline-block bg-brand-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600 transition-colors">
                            {t('schemeDetail.readArticle')}
                        </a>
                    )}
                </div>
            )}

            <div className="mt-12 no-share">
                <FamilyShare itemId={scheme.id} itemType="scheme" />
            </div>
        </div>
    );
};


const SchemeDetailPage = () => {
    const { schemeId } = useParams<{ schemeId: string }>();
    const { t, isSimpleMode, language } = useAppContext();
    const [scheme, setScheme] = useState<Scheme | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    useEffect(() => {
        const loadScheme = async () => {
            if (!schemeId) return;
            setIsLoading(true);
            try {
                const data = await fetchSchemeById(schemeId);
                setScheme(data);
            } catch (err) {
                setError("Failed to load scheme details.");
            } finally {
                setIsLoading(false);
            }
        };
        loadScheme();
    }, [schemeId]);

    const textToRead = useMemo(() => {
        if (!scheme) return "";
        const alerts = scamAlertData[scheme.id] || [];
        const alertText = alerts.map(a => (language === 'hi' ? a.message.hi : a.message.en)).join('. ');

        const parts = [
            t(scheme.name, scheme.name),
            alertText,
            isSimpleMode ? '' : `${t('schemeDetail.simpleExplanation')}.`,
            `${scheme.description}`,
            `${t('schemeDetail.eligibility')}. ${scheme.eligibility.join(', ')}`,
            `${t('schemeDetail.benefits')}. ${scheme.benefits.join(', ')}`,
            `${t('schemeDetail.requiredDocuments')}. ${scheme.documents.join(', ')}`,
            `${t('schemeDetail.howToApply')}. ${scheme.applicationProcess}`,
            t('schemeDetail.familyShareAnnouncement'),
        ];
        return parts.filter(Boolean).join('\n');
    }, [scheme, t, isSimpleMode, language]);

    if (isLoading) {
        return (
             <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
                 <SkeletonLoader className="h-12 w-3/4 rounded-lg" />
                 <SkeletonLoader className="h-6 w-1/4 rounded-lg" />
                 <div className="space-y-4 pt-8">
                    <SkeletonLoader className="h-8 w-1/3 rounded-lg" />
                    <SkeletonLoader className="h-5 w-full rounded" />
                    <SkeletonLoader className="h-5 w-5/6 rounded" />
                 </div>
                 <div className="space-y-4 pt-4">
                    <SkeletonLoader className="h-8 w-1/3 rounded-lg" />
                    <SkeletonLoader className="h-5 w-full rounded" />
                    <SkeletonLoader className="h-5 w-4/6 rounded" />
                 </div>
             </div>
        )
    }
    
    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    if (!scheme) {
        return <div className="text-center py-20 dark:text-white">Scheme not found.</div>;
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800">
               {isSimpleMode 
                    ? <SimpleSchemeDetail scheme={scheme} onVideoOpen={() => setIsVideoModalOpen(true)} textToRead={textToRead} />
                    : <DefaultSchemeDetail scheme={scheme} onVideoOpen={() => setIsVideoModalOpen(true)} textToRead={textToRead} />
                }
            </div>
            {scheme.moreInfo?.type === 'video' && (
                <VideoModal 
                    isOpen={isVideoModalOpen} 
                    onClose={() => setIsVideoModalOpen(false)} 
                    videoUrl={scheme.moreInfo.url} 
                />
            )}
        </>
    );
};

export default SchemeDetailPage;