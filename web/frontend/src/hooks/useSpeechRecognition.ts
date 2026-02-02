
import { useState, useEffect, useRef, useCallback } from 'react';

// Polyfill definitions for TypeScript if not available globally
interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
}

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface Window {
    SpeechRecognition?: { new(): SpeechRecognition };
    webkitSpeechRecognition?: { new(): SpeechRecognition };
}

export interface UseSpeechRecognitionProps {
    lang?: string;
    continuous?: boolean;
    interimResults?: boolean;
}

export const useSpeechRecognition = ({
    lang = 'vi-VN',
    continuous = true,
    interimResults = true
}: UseSpeechRecognitionProps = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const win = window as unknown as Window;
        const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

        if (SpeechRecognitionCtor) {
            setIsSupported(true);
            recognitionRef.current = new SpeechRecognitionCtor();
            recognitionRef.current.continuous = continuous;
            recognitionRef.current.interimResults = interimResults;
            recognitionRef.current.lang = lang;
        } else {
            setIsSupported(false);
            setError("Trình duyệt không hỗ trợ Web Speech API.");
        }

        return () => {
            if (recognitionRef.current && isListening) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Update lang dynamically if needed
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = lang;
        }
    }, [lang]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;

        setError(null);
        // Clean up previous listeners to avoid duplicates if any (though usually re-assigning handles this)

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = '';
            let newFinalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    newFinalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            // Append new final chunks to our stored final transcript
            setFinalTranscript(prev => prev + newFinalTranscript);
            setTranscript(interimTranscript);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error", event.error);
            setError(`Lỗi nhận dạng: ${event.error}`);
            setIsListening(false);
        };

        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (err) {
            console.error("Failed to start recognition:", err);
        }
    }, []);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;
        recognitionRef.current.stop();
        setIsListening(false);
    }, []);

    const resetTranscript = useCallback(() => {
        setFinalTranscript('');
        setTranscript('');
    }, []);

    return {
        isSupported,
        isListening,
        transcript: finalTranscript + (transcript ? ' ' + transcript : ''), // Combine final + interim
        interimTranscript: transcript,
        startListening,
        stopListening,
        resetTranscript,
        error
    };
};
