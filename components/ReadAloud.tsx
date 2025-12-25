import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { useAppContext } from '../hooks/useAppContext';

interface ReadAloudProps {
    textToRead: string;
}

type Status = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

const ReadAloud: React.FC<ReadAloudProps> = ({ textToRead }) => {
    const { t, setToast } = useAppContext();
    const [status, setStatus] = useState<Status>('idle');
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    
    const stopPlayback = useCallback(() => {
        if (audioSourceRef.current) {
            audioSourceRef.current.onended = null;
            audioSourceRef.current.stop();
            audioSourceRef.current.disconnect();
            audioSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        audioBufferRef.current = null;
        setStatus('idle');
    }, []);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopPlayback();
        };
    }, [stopPlayback]);

    const handlePlay = async () => {
        if (status === 'loading') return;
        
        // Resume if paused
        if (status === 'paused' && audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
            setStatus('playing');
            return;
        }
        
        // Start new playback
        stopPlayback();
        setStatus('loading');

        try {
            const translatedText = textToRead; // Already translated on the page
            const base64Audio = await generateSpeech(translatedText);

            if (!base64Audio) {
                throw new Error("Failed to generate audio.");
            }
            
            const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = newAudioContext;

            const audioBytes = decode(base64Audio);
            const buffer = await decodeAudioData(audioBytes, newAudioContext, 24000, 1);
            audioBufferRef.current = buffer;

            const source = newAudioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(newAudioContext.destination);
            source.onended = () => {
                 if (status !== 'paused') {
                    stopPlayback();
                 }
            };
            source.start();
            
            audioSourceRef.current = source;
            setStatus('playing');

        } catch (error) {
            console.error("Text-to-speech error:", error);
            setToast({ message: 'Could not generate audio.', type: 'error' });
            setStatus('error');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };
    
    const handlePause = () => {
        if (status === 'playing' && audioContextRef.current) {
            audioContextRef.current.suspend();
            setStatus('paused');
        }
    };

    const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.2132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" /></svg>;
    const LoadingIcon = () => <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

    const renderButton = () => {
        switch (status) {
            case 'loading':
                return <button className="p-2 text-gray-500" disabled title={t('tts.loading')}><LoadingIcon /></button>;
            case 'playing':
                return <button onClick={handlePause} className="p-2 text-brand-indigo hover:text-brand-indigo-light" title={t('tts.pause')}><PauseIcon /></button>;
            case 'paused':
                return <button onClick={handlePlay} className="p-2 text-brand-indigo hover:text-brand-indigo-light" title={t('tts.resume')}><PlayIcon /></button>;
            case 'error':
            case 'idle':
            default:
                return <button onClick={handlePlay} className="p-2 text-brand-indigo hover:text-brand-indigo-light" title={t('tts.play')}><PlayIcon /></button>;
        }
    };
    
    return (
        <div className="flex items-center gap-2 no-print">
            {renderButton()}
            {status !== 'idle' && (
                <button onClick={stopPlayback} className="p-2 text-red-600 hover:text-red-800" title={t('tts.stop')}>
                    <StopIcon />
                </button>
            )}
        </div>
    );
};

export default ReadAloud;