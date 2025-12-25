import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { EligibilityQuestion } from '../types';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { BackIcon } from '../assets/ChatbotIcon';
import FamilyShare from './FamilyShare';

// FIX: Add type definitions for Web Speech API to fix compilation errors
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onend: (() => void) | null;
    onerror: ((event: any) => void) | null;
    onresult: ((event: any) => void) | null;
    start(): void;
    stop(): void;
}
  
declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition };
        webkitSpeechRecognition: { new(): SpeechRecognition };
    }
}

interface EligibilityCheckProps {
  questions: EligibilityQuestion[];
  onCheckComplete: (result: { eligible: boolean; reason?: string }) => void;
}

const EligibilityCheck: React.FC<EligibilityCheckProps> = ({ questions, onCheckComplete }) => {
    const { t, language, setToast } = useAppContext();
    const { taskId, schemeId } = useParams();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<boolean[]>([]);
    const [isStarted, setIsStarted] = useState(false);
    const [result, setResult] = useState<{ eligible: boolean; reason?: string } | null>(null);

    // Voice state
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Audio playback state
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const stopPlayback = useCallback(() => {
        if (audioSourceRef.current) {
            audioSourceRef.current.onended = null;
            audioSourceRef.current.stop();
            audioSourceRef.current.disconnect();
            audioSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
             try { audioContextRef.current.close(); } catch(e) {}
             audioContextRef.current = null;
        }
    }, []);

    const playQuestionAudio = useCallback(async (text: string) => {
        if (isMuted) return;
        stopPlayback();
        try {
            const base64Audio = await generateSpeech(text);
            if (!base64Audio) throw new Error("No audio data received.");

            const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = newAudioContext;

            const audioBytes = decode(base64Audio);
            const buffer = await decodeAudioData(audioBytes, newAudioContext, 24000, 1);
            
            const source = newAudioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(newAudioContext.destination);
            source.onended = () => { stopPlayback(); };
            source.start();
            audioSourceRef.current = source;
        } catch (error) {
            console.error("TTS Error:", error);
        }
    }, [isMuted, stopPlayback]);

    const getCurrentQuestionText = useCallback(() => {
        if (!isStarted || currentQuestionIndex >= questions.length) return '';
        const q = questions[currentQuestionIndex];
        return language === 'hi' ? q.question.hi : q.question.en;
    }, [questions, currentQuestionIndex, language, isStarted]);

    // Read question aloud when it changes
    useEffect(() => {
        if (isStarted && result === null) {
            const questionText = getCurrentQuestionText();
            if (questionText) {
                playQuestionAudio(questionText);
            }
        }
    }, [isStarted, currentQuestionIndex, result, getCurrentQuestionText, playQuestionAudio]);
    
    // Setup voice recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

        recognitionRef.current.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            if (transcript.includes('haan') || transcript.includes('yes')) {
                handleAnswer(true);
            } else if (transcript.includes('nahi') || transcript.includes('no')) {
                handleAnswer(false);
            } else {
                 setToast({ message: "Could not understand. Please say 'Yes' or 'No'.", type: 'error' });
            }
        };
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
            if (event.error !== 'no-speech') {
              setToast({ message: "Voice recognition error.", type: 'error' });
            }
        };

        return () => {
            recognitionRef.current?.stop();
            stopPlayback();
        };
    }, [language, setToast, stopPlayback]);

    const handleAnswer = (answer: boolean) => {
        const newAnswers = [...answers.slice(0, currentQuestionIndex), answer];
        setAnswers(newAnswers);

        const currentQuestion = questions[currentQuestionIndex];
        if (answer !== currentQuestion.expects) {
            const reason = language === 'hi' ? currentQuestion.failReason.hi : currentQuestion.failReason.en;
            const finalResult = { eligible: false, reason };
            setResult(finalResult);
            onCheckComplete(finalResult);
            return;
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            const finalResult = { eligible: true };
            setResult(finalResult);
            onCheckComplete(finalResult);
        }
    };
    
    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            // Answers remain, so user just re-answers from previous point
        }
    };
    
    const startCheck = () => {
        setIsStarted(true);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setResult(null);
    }
    
    const toggleListen = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            stopPlayback();
            recognitionRef.current?.start();
        }
        setIsListening(!isListening);
    };

    const renderContent = () => {
        if (result) {
            const itemId = taskId || schemeId;
            const itemType = taskId ? 'task' : 'scheme';

            return (
                <div className="text-center p-6 transition-all duration-500 ease-in-out">
                    {result.eligible ? (
                        <>
                            <div className="text-6xl mb-4">✅</div>
                            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">Aap iske liye eligible hain!</h3>
                            <button onClick={() => window.scrollTo(0, 500)} className="button-like mt-6 bg-brand-indigo text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-indigo-light transition-colors">
                                Next Steps
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-6xl mb-4">❌</div>
                            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">Aap iske liye eligible nahi hain</h3>
                            <p className="mt-2 text-brand-gray dark:text-gray-300">{result.reason}</p>
                        </>
                    )}
                     <button onClick={startCheck} className="mt-4 text-sm text-brand-indigo dark:text-brand-indigo-light hover:underline">
                        Check Again
                    </button>
                    {itemId && (
                        <div className="mt-6 border-t pt-6 dark:border-gray-700">
                             <FamilyShare itemId={itemId} itemType={itemType} />
                        </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                        Eligibility ka result aapke jawab par based hai. Final decision official portal par hota hai.
                    </p>
                </div>
            );
        }

        if (isStarted) {
            return (
                 <div className="p-6 text-center voice-panel-enter">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={handleBack} disabled={currentQuestionIndex === 0} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30">
                            <BackIcon />
                        </button>
                        <span className="text-sm font-semibold text-gray-500">{currentQuestionIndex + 1} / {questions.length}</span>
                        <div className="flex items-center gap-2">
                             <button onClick={toggleListen} className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" /></svg>
                            </button>
                             <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-600">
                                {isMuted ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076a1 1 0 011.09-.217l3.707 3.707a1 1 0 010 1.414L4.586 17H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 5.168A1 1 0 008 6v8a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4z" /></svg>}
                            </button>
                        </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-semibold my-8 min-h-[6rem] flex items-center justify-center dark:text-white">
                        {getCurrentQuestionText()}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => handleAnswer(true)} className="w-32 h-16 bg-green-500 text-white text-2xl font-bold rounded-lg hover:bg-green-600 transition-transform hover:scale-105">YES</button>
                        <button onClick={() => handleAnswer(false)} className="w-32 h-16 bg-red-500 text-white text-2xl font-bold rounded-lg hover:bg-red-600 transition-transform hover:scale-105">NO</button>
                    </div>
                </div>
            );
        }

        return (
            <div className="text-center p-6">
                <h3 className="text-2xl font-bold dark:text-white">Kya aap eligible hain? Jaldi check karein.</h3>
                <p className="text-brand-gray dark:text-gray-300 mt-2">Find out in a few seconds with simple questions.</p>
                <button onClick={startCheck} className="button-like mt-6 bg-brand-indigo text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-indigo-light transition-colors">
                    Start Quick Check
                </button>
            </div>
        );
    }

    return (
        <div className="bg-brand-off-white dark:bg-gray-800 border-2 border-brand-indigo border-dashed rounded-xl my-8">
            {renderContent()}
        </div>
    );
};

export default EligibilityCheck;