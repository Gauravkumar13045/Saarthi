import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { detectLanguage, generateSpeech } from '../services/geminiService';
import { postToChatbot } from '../services/api';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { ChatbotIcon, CloseIcon, SendIcon, BotAvatarIcon, AudioLoadingIcon, SpeakerIcon } from '../assets/ChatbotIcon';
import { tasks } from '../data/tasks'; 

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

interface Message {
    id: string;
    role: 'user' | 'bot';
    text: string;
    audioState?: 'loading' | 'playing';
}

const SuggestionChip: React.FC<{ text: string, onClick: () => void }> = ({ text, onClick }) => (
    <button
        onClick={onClick}
        className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm text-brand-indigo dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-600 transition-all"
    >
        {text}
    </button>
);

const Chatbot = () => {
    const { t, schemes, setToast } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pageContext, setPageContext] = useState('');
    const [isExiting, setIsExiting] = useState(false);
    
    // Voice state
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Audio playback state
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const location = useLocation();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const suggestionPrompts = [
        "How to apply for PAN?",
        "Tell me about SSY",
        "Bank account kaise khole?"
    ];
    
    const closeChat = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsExiting(false);
        }, 200);
    }, []);
    
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
        setIsSpeaking(false);
    }, []);

    const playAudio = useCallback(async (text: string, messageId: string) => {
        if (isMuted || isSpeaking) {
            // If muted, just clear the loading state
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioState: undefined } : m));
            return;
        };

        stopPlayback();
        setIsSpeaking(true);

        try {
            // Remove markdown for cleaner speech
            const cleanText = text.replace(/###|[*_]/g, '').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
            const base64Audio = await generateSpeech(cleanText);
            if (!base64Audio) throw new Error("No audio data received.");
            
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioState: 'playing' } : m));

            const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = newAudioContext;

            const audioBytes = decode(base64Audio);
            const buffer = await decodeAudioData(audioBytes, newAudioContext, 24000, 1);
            
            const source = newAudioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(newAudioContext.destination);
            source.onended = () => {
                stopPlayback();
                setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioState: undefined } : m));
            };
            source.start();
            audioSourceRef.current = source;
        } catch (error) {
            console.error("TTS Error:", error);
            setIsSpeaking(false);
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioState: undefined } : m));
        }
    }, [isMuted, isSpeaking, stopPlayback]);


    const resetChat = () => {
        setMessages([{ id: 'init-0', role: 'bot', text: t('chatbot.initialMessage') }]);
    };

    useEffect(() => {
        if (isOpen) {
            resetChat();
        } else {
            stopPlayback();
        }
    }, [isOpen, t, stopPlayback]);
    
    useEffect(() => {
        // Speech Recognition setup
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            
            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                handleSendMessage(transcript);
            };
            
            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
            
            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'no-speech') {
                    setToast({ message: "I couldn't hear you. Please try again.", type: 'error' });
                } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    setToast({ message: "Microphone access denied. Please allow it in browser settings.", type: 'error' });
                } else {
                    setToast({ message: "Sorry, a voice recognition error occurred.", type: 'error' });
                }
                setIsListening(false);
            };
        }
    }, [setToast]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const path = location.pathname;
        let context = "a general page";

        if (path.startsWith('/task/')) {
            const taskId = path.split('/task/')[1];
            const task = tasks.find(t => t.id === taskId);
            if (task) context = `the task: "${task.title}"`;
        } else if (path.startsWith('/scheme/')) {
            const schemeId = path.split('/scheme/')[1];
            const scheme = schemes.find(s => s.id === schemeId);
            if (scheme) context = `the scheme: "${scheme.name}"`;
        } else if (path === '/') {
            context = "the Home page";
        }
        setPageContext(context);
    }, [location, schemes]);

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const detectedLang = await detectLanguage(messageText);
            const botResponseText = await postToChatbot(messageText, pageContext, detectedLang);
            const audioState = isMuted ? undefined : 'loading';
            const botMessage: Message = { id: `bot-${Date.now()}`, role: 'bot', text: botResponseText, audioState };
            
            setMessages(prev => [...prev, botMessage]);
            
            if (!isMuted) {
                playAudio(botResponseText, botMessage.id);
            }
        } catch (error) {
            const errorMessage: Message = { id: `err-${Date.now()}`, role: 'bot', text: "Sorry, I'm having trouble connecting." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(inputValue);
    };
    
    const handleSuggestionClick = (prompt: string) => {
        setInputValue(prompt);
        handleSendMessage(prompt);
    }
    
    const handleToggleListen = () => {
        if (!recognitionRef.current) {
            alert("Sorry, your browser doesn't support voice commands.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            stopPlayback();
            recognitionRef.current.lang = 'en-IN'; // Can be adapted based on app language
            recognitionRef.current.start();
        }
        setIsListening(!isListening);
    };

    const renderMessageWithLinks = (text: string) => {
        const paragraphs = text.split(/\n/);

        return paragraphs.map((para, paraIndex) => {
            if (!para.trim()) return null;

            if (para.trim().startsWith('_') && para.trim().endsWith('_')) {
                 return <p key={paraIndex} className="italic text-sm text-gray-500 dark:text-gray-400 mt-2">{para.trim().substring(1, para.trim().length - 1)}</p>
            }
            
            if (para.trim().startsWith('* ')) {
                return (
                    <ul key={paraIndex} className="list-disc list-inside space-y-1 my-1">
                        <li>{para.trim().substring(2)}</li>
                    </ul>
                );
            }

            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            const parts = para.split(linkRegex);

            return (
                <p key={paraIndex} className="my-1">
                    {parts.map((part, index) => {
                        if (index % 3 === 1) { // Link text
                            const url = parts[index + 1];
                            const toUrl = url.startsWith('/#') ? url.substring(2) : url;
                            return (
                                <Link key={index} to={toUrl} className="text-brand-indigo dark:text-brand-indigo-light font-bold hover:underline" onClick={closeChat}>
                                    {part}
                                </Link>
                            );
                        }
                        if (index % 3 === 2) { // URL, skip
                            return null;
                        }
                        return part; // Plain text
                    })}
                </p>
            );
        });
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-5 right-5 z-50 bg-brand-indigo text-white p-3.5 rounded-full shadow-lg hover:bg-brand-indigo-light transition-all duration-300 transform hover:scale-110 btn-glow no-print"
                aria-label={t('chatbot.help')}
            >
                <ChatbotIcon />
            </button>
        );
    }

    return (
        <div className={`fixed bottom-5 right-5 z-50 w-[calc(100%-2.5rem)] max-w-sm flex flex-col h-[70vh] max-h-[600px] bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 no-print ${isExiting ? 'chatbot-exit' : 'chatbot-enter'}`}>
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-brand-indigo to-brand-teal text-white rounded-t-2xl shadow-md">
                <div className="flex items-center gap-3">
                    <div className="p-1 bg-white/30 rounded-full"><BotAvatarIcon /></div>
                    <h3 className="font-bold text-lg">{t('chatbot.help')}</h3>
                </div>
                <button onClick={closeChat} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                    <CloseIcon />
                </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'bot' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-brand-indigo flex-shrink-0"><BotAvatarIcon /></div>}
                            <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] break-words shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-brand-indigo-light to-brand-indigo text-white rounded-br-lg' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg'}`}>
                                {renderMessageWithLinks(msg.text)}
                                {msg.role === 'bot' && (msg.audioState === 'loading' || msg.audioState === 'playing') && (
                                     <div className="flex justify-end items-center mt-2 pt-1 border-t border-gray-200 dark:border-gray-600">
                                        {msg.audioState === 'loading' && <AudioLoadingIcon />}
                                        {msg.audioState === 'playing' && <SpeakerIcon />}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2.5 justify-start">
                             <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-brand-indigo flex-shrink-0"><BotAvatarIcon /></div>
                             <div className="px-4 py-2.5 rounded-2xl rounded-bl-lg bg-white dark:bg-gray-700">
                                <div className="flex items-center space-x-1.5">
                                    <span className="h-2 w-2 bg-gray-400 rounded-full" style={{ animation: 'typing-bubble 1s infinite ease-in-out' }}></span>
                                    <span className="h-2 w-2 bg-gray-400 rounded-full" style={{ animation: 'typing-bubble 1s infinite ease-in-out 0.2s' }}></span>
                                    <span className="h-2 w-2 bg-gray-400 rounded-full" style={{ animation: 'typing-bubble 1s infinite ease-in-out 0.4s' }}></span>
                                </div>
                             </div>
                        </div>
                    )}
                    {messages.length === 1 && !isLoading && (
                        <div className="flex flex-wrap gap-2 pt-2">
                           {suggestionPrompts.map(p => <SuggestionChip key={p} text={p} onClick={() => handleSuggestionClick(p)} />)}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-b-2xl">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={t('chatbot.placeholder')}
                        className="flex-1 w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-transparent rounded-full focus:ring-2 focus:ring-brand-indigo focus:border-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <button type="button" onClick={handleToggleListen} className={`p-2.5 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-600 text-brand-indigo'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" /></svg>
                    </button>
                    <button type="submit" className="bg-gradient-to-r from-brand-indigo-light to-brand-indigo text-white p-2.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || !inputValue.trim()}>
                        <SendIcon />
                    </button>
                </form>
                <div className="flex items-center justify-between mt-2 px-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Aapki awaaz sirf madad ke liye use hoti hai.</p>
                    <button onClick={() => setIsMuted(!isMuted)} className="p-1 text-gray-500 dark:text-gray-400">
                        {isMuted ? 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            : 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" /><path d="M16.071 5.071a1 1 0 010 1.414A5.98 5.98 0 0115 10a5.98 5.98 0 01-1.071 3.515 1 1 0 11-1.414-1.414A3.982 3.982 0 0013 10a3.982 3.982 0 00-1.071-2.086 1 1 0 011.414-1.414A5.98 5.98 0 0116.071 5.071z" /></svg>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;