import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Task, TaskStep } from '../types';
import ReadAloud from '../components/ReadAloud';
import VideoModal from '../components/VideoModal';
import WhereToGo from '../components/WhereToGo';
import { StepIcon } from '../components/StepIcons';
import BookmarkIcon from '../components/BookmarkIcon';
import { fetchTaskById } from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';
import EligibilityCheck from '../components/EligibilityCheck';
import { eligibilityData } from '../data/eligibilityQuestions';
import ScamAlert from '../components/ScamAlert';
import { scamAlertData } from '../data/scamAlerts';
import { useScrollAnimator } from '../hooks/useScrollAnimator';
import FamilyShare from '../components/FamilyShare';

// Default View Components
const DefaultStep: React.FC<{ step: TaskStep; index: number; taskId: string; }> = ({ step, index, taskId }) => {
    // FIX: Destructured 't' from useAppContext to enable translation within the component.
    const { progress, updateProgress, t } = useAppContext();
    const isCompleted = progress[taskId]?.[step.id] || false;

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateProgress(taskId, step.id, e.target.checked);
    };

    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <details className="group" open={index === 0}>
                <summary className="flex justify-between items-center cursor-pointer list-none p-4 group-open:bg-indigo-50 dark:group-open:bg-gray-800/50 transition-colors">
                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={handleCheckboxChange}
                            className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-brand-indigo focus:ring-brand-indigo mt-1.5 flex-shrink-0 no-share"
                            onClick={e => e.stopPropagation()}
                        />
                        <div className="ml-4 flex items-center gap-3">
                             <StepIcon title={step.title} />
                            <div>
                                <h4 className={`text-lg font-semibold ${isCompleted ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                                    Step {index + 1}: {step.title}
                                </h4>
                                <p className="text-sm text-brand-gray dark:text-gray-400">{t('taskDetail.time')}: ~{step.timeEstimate}</p>
                            </div>
                        </div>
                    </div>
                    <span className="transition-transform duration-300 group-open:rotate-180 dark:text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </span>
                </summary>
                <div className="mt-4 pb-4 pl-16 pr-4 text-gray-700 dark:text-gray-300">
                    <p>{step.description}</p>
                </div>
            </details>
        </div>
    );
};

const DefaultTaskDetail: React.FC<{ task: Task, onVideoOpen: () => void, textToRead: string }> = ({ task, onVideoOpen, textToRead }) => {
    const { t, getTaskProgress, savedTasks, toggleSaveTask } = useAppContext();
    const progressPercentage = useMemo(() => getTaskProgress(task.id), [getTaskProgress, task.id, task.steps]);
    const isSaved = savedTasks.includes(task.id);
    const taskEligibility = eligibilityData[task.id];
    const taskAlerts = scamAlertData[task.id];
    const [overviewRef, isOverviewVisible] = useScrollAnimator<HTMLDivElement>();
    const [stepsRef, isStepsVisible] = useScrollAnimator<HTMLDivElement>();
    const [whereToGoRef, isWhereToGoVisible] = useScrollAnimator<HTMLDivElement>();


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link to="/life-tasks" className="inline-block mb-4 text-brand-indigo dark:text-brand-indigo-light font-semibold hover:underline no-print no-share">
                {t('taskDetail.backToTasks')}
            </Link>
            <div className="lg:grid lg:grid-cols-3 lg:gap-12 force-single-col">
                <div className="lg:col-span-2">
                    <span className="text-sm font-medium text-brand-indigo bg-indigo-100 px-2 py-1 rounded-full dark:bg-indigo-900/50 dark:text-indigo-300">{t(`tasks.${task.category.toLowerCase().replace(' ','')}`)||task.category}</span>
                    <div className="mt-4 flex items-center gap-4">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t(task.title, task.title)}</h1>
                        <div className="flex items-center ml-auto no-share">
                            <ReadAloud textToRead={textToRead} />
                            <BookmarkIcon
                                isSaved={isSaved}
                                onClick={() => toggleSaveTask(task.id)}
                                label={t('taskDetail.saveForLater')}
                                savedLabel={t('taskDetail.removeFromSaved')}
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

                    {taskAlerts && <ScamAlert alerts={taskAlerts} />}

                    {taskEligibility && (
                         <EligibilityCheck
                            questions={taskEligibility.questions}
                            onCheckComplete={(result) => { /* Can handle result if needed */ }}
                        />
                    )}
                    
                    <div ref={overviewRef} className={`mt-8 scroll-reveal ${isOverviewVisible ? 'scroll-reveal--visible' : ''}`}>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{t('taskDetail.overview')}</h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <p><strong className="font-semibold dark:text-gray-100">{t('taskDetail.what')}</strong> {task.overview.what}</p>
                            <p><strong className="font-semibold dark:text-gray-100">{t('taskDetail.why')}</strong> {task.overview.why}</p>
                            <p><strong className="font-semibold dark:text-gray-100">{t('taskDetail.who')}</strong> {task.overview.who}</p>
                        </div>
                    </div>

                    <div ref={stepsRef} className={`mt-12 scroll-reveal ${isStepsVisible ? 'scroll-reveal--visible' : ''}`} style={{transitionDelay: '150ms'}}>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{t('taskDetail.steps')}</h2>
                        <div className="border-t border-gray-200 dark:border-gray-700">
                            {task.steps.map((step, index) => (
                                <DefaultStep key={step.id} step={step} index={index} taskId={task.id} />
                            ))}
                        </div>
                    </div>
                     <div ref={whereToGoRef} className={`mt-12 scroll-reveal ${isWhereToGoVisible ? 'scroll-reveal--visible' : ''}`} style={{transitionDelay: '300ms'}}>
                        <WhereToGo completionMethods={task.completionMethods} officialLinks={task.officialLinks} />
                    </div>

                    <div className="mt-12 no-share">
                        <FamilyShare itemId={task.id} itemType="task" />
                    </div>
                </div>

                <aside className="mt-12 lg:mt-0 lg:col-span-1 no-print no-share">
                    <div className="sticky top-24 space-y-8">
                        <div className="bg-brand-off-white dark:bg-gray-700/50 p-6 rounded-lg border dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('taskDetail.progress')}</h3>
                            <div className="mt-4">
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                    <div className="bg-gradient-to-r from-brand-teal via-brand-indigo to-brand-pink h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                                <p className="text-right text-sm font-medium text-brand-indigo dark:text-brand-indigo-light mt-2">{Math.round(progressPercentage)}% {t('taskDetail.completed')}</p>
                            </div>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 rounded-r-lg">
                            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">{t('taskDetail.commonMistakes')}</h3>
                            <ul className="mt-2 list-disc list-inside text-yellow-700 dark:text-yellow-200 space-y-1">
                                {task.commonMistakes.map((mistake, i) => <li key={i}>{mistake}</li>)}
                            </ul>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg border dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('taskDetail.verifiedLinks')}</h3>
                            <ul className="mt-2 space-y-2">
                                {task.officialLinks.map((link, i) => (
                                    <li key={i}>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-brand-indigo dark:text-brand-indigo-light hover:underline break-words">
                                            {link.title} &rarr;
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {task.moreInfo && (
                             <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg border dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('taskDetail.moreInfo')}</h3>
                                <div className="mt-3">
                                    {task.moreInfo.type === 'video' ? (
                                        <button onClick={onVideoOpen} className="w-full text-left text-brand-indigo dark:text-brand-indigo-light hover:underline font-semibold">
                                            {t('taskDetail.watchVideo')}: {task.moreInfo.title} &rarr;
                                        </button>
                                    ) : (
                                            <a href={task.moreInfo.url} target="_blank" rel="noopener noreferrer" className="text-brand-indigo dark:text-brand-indigo-light hover:underline font-semibold break-words">
                                            {t('taskDetail.readArticle')}: {task.moreInfo.title} &rarr;
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};


// Visual Step Component for Simple View
const VisualStep: React.FC<{ step: TaskStep; index: number; }> = ({ step, index }) => {
    return (
        <div className="flex items-center gap-4 p-4 bg-brand-off-white dark:bg-gray-800 rounded-lg border-l-4 border-brand-indigo shadow-sm">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-brand-indigo text-white font-bold text-2xl">
                {index + 1}
            </div>
            <div className="flex items-center gap-3">
                <StepIcon title={step.title} />
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
            </div>
        </div>
    );
};


// Simple View Component
const SimpleTaskDetail: React.FC<{ task: Task, onVideoOpen: () => void, textToRead: string }> = ({ task, onVideoOpen, textToRead }) => {
    const { t, savedTasks, toggleSaveTask } = useAppContext();
    const isSaved = savedTasks.includes(task.id);
    const taskEligibility = eligibilityData[task.id];
    const taskAlerts = scamAlertData[task.id];
    const [stepsRef, isStepsVisible] = useScrollAnimator<HTMLDivElement>();
    const [whereToGoRef, isWhereToGoVisible] = useScrollAnimator<HTMLDivElement>();
    const [moreInfoRef, isMoreInfoVisible] = useScrollAnimator<HTMLDivElement>();

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link to="/life-tasks" className="inline-block mb-4 text-brand-indigo dark:text-brand-indigo-light font-semibold hover:underline no-print no-share">
                {t('taskDetail.backToTasks')}
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white text-center">{t(task.title, task.title)}</h1>
            <div className="mt-4 flex justify-center items-center gap-2 no-share">
                 <ReadAloud textToRead={textToRead} />
                 <BookmarkIcon
                    isSaved={isSaved}
                    onClick={() => toggleSaveTask(task.id)}
                    label={t('taskDetail.saveForLater')}
                    savedLabel={t('taskDetail.removeFromSaved')}
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
            
            {taskAlerts && <ScamAlert alerts={taskAlerts} />}

            {taskEligibility && (
                 <EligibilityCheck
                    questions={taskEligibility.questions}
                    onCheckComplete={(result) => { /* Can handle result if needed */ }}
                />
            )}

            <div ref={stepsRef} className={`mt-10 scroll-reveal ${isStepsVisible ? 'scroll-reveal--visible' : ''}`}>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{t('taskDetail.steps')}</h2>
                <div className="space-y-4">
                    {task.steps.map((step, index) => (
                        <VisualStep key={step.id} step={step} index={index} />
                    ))}
                </div>
            </div>

             <div ref={whereToGoRef} className={`mt-12 scroll-reveal ${isWhereToGoVisible ? 'scroll-reveal--visible' : ''}`} style={{ transitionDelay: '150ms' }}>
                <WhereToGo completionMethods={task.completionMethods} officialLinks={task.officialLinks} />
            </div>

             {task.moreInfo && (
                <div ref={moreInfoRef} className={`mt-12 text-center no-print scroll-reveal ${isMoreInfoVisible ? 'scroll-reveal--visible' : ''}`} style={{ transitionDelay: '300ms' }}>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{t('taskDetail.moreInfo')}</h2>
                     {task.moreInfo.type === 'video' ? (
                        <button onClick={onVideoOpen} className="button-like bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                            {t('taskDetail.watchVideo')}
                        </button>
                    ) : (
                        <a href={task.moreInfo.url} target="_blank" rel="noopener noreferrer" className="button-like inline-block bg-brand-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600 transition-colors">
                            {t('taskDetail.readArticle')}
                        </a>
                    )}
                </div>
            )}

             <div className="mt-12 no-share">
                <FamilyShare itemId={task.id} itemType="task" />
            </div>
        </div>
    );
};

const TaskDetailPage = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const { t, isSimpleMode, getTaskProgress, language } = useAppContext();
    const [task, setTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    
    useEffect(() => {
        const loadTask = async () => {
            if (!taskId) return;
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchTaskById(taskId, isSimpleMode);
                setTask(data);
            } catch (err) {
                setError('Failed to load task details.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadTask();
    }, [taskId, isSimpleMode]);

    const textToRead = useMemo(() => {
        if (!task) return "";
        const alerts = scamAlertData[task.id] || [];
        const alertText = alerts.map(a => (language === 'hi' ? a.message.hi : a.message.en)).join('. ');

        const parts = [
            t(task.title, task.title),
            alertText,
            isSimpleMode ? '' : `${t('taskDetail.overview')}.`,
            isSimpleMode ? '' : `${t('taskDetail.what')} ${task.overview?.what}`,
            isSimpleMode ? '' : `${t('taskDetail.why')} ${task.overview?.why}`,
            isSimpleMode ? '' : `${t('taskDetail.who')} ${task.overview?.who}`,
            `${t('taskDetail.steps')}.`,
            ...task.steps.map((step, index) => `Step ${index + 1}: ${step.title}. ${step.description}`),
            isSimpleMode ? '' : `${t('taskDetail.commonMistakes')}.`,
            ...(isSimpleMode ? [] : task.commonMistakes),
             t('taskDetail.familyShareAnnouncement'),
        ];
        return parts.filter(Boolean).join('\n');
    },[task, t, isSimpleMode, language]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="lg:grid lg:grid-cols-3 lg:gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <SkeletonLoader className="h-8 w-1/4 rounded-full" />
                        <SkeletonLoader className="h-12 w-3/4 rounded-lg" />
                        <div className="space-y-4">
                            <SkeletonLoader className="h-6 w-1/3 rounded-lg" />
                            <SkeletonLoader className="h-5 w-full rounded" />
                            <SkeletonLoader className="h-5 w-full rounded" />
                        </div>
                         <div className="space-y-4">
                            <SkeletonLoader className="h-6 w-1/3 rounded-lg" />
                            <SkeletonLoader className="h-16 w-full rounded" />
                            <SkeletonLoader className="h-16 w-full rounded" />
                        </div>
                    </div>
                    <div className="hidden lg:block space-y-8">
                        <SkeletonLoader className="h-32 w-full rounded-lg" />
                        <SkeletonLoader className="h-48 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    if (!task) {
        return <div className="text-center py-20 dark:text-white">Task not found.</div>;
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800">
                {isSimpleMode 
                    ? <SimpleTaskDetail task={task} onVideoOpen={() => setIsVideoModalOpen(true)} textToRead={textToRead} />
                    : <DefaultTaskDetail task={task} onVideoOpen={() => setIsVideoModalOpen(true)} textToRead={textToRead} />
                }
            </div>
             {task.moreInfo?.type === 'video' && (
                <VideoModal 
                    isOpen={isVideoModalOpen} 
                    onClose={() => setIsVideoModalOpen(false)} 
                    videoUrl={task.moreInfo.url} 
                />
            )}
        </>
    );
};


export default TaskDetailPage;