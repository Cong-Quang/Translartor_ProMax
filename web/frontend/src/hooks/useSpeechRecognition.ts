
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
    clearTranscriptOnListen?: boolean;
}

export const useSpeechRecognition = ({
    lang = 'vi-VN',
    continuous = true,
    interimResults = true,
    clearTranscriptOnListen = false
}: UseSpeechRecognitionProps = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
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
            if (recognitionRef.current) {
                // recognitionRef.current.stop(); // Don't auto-stop on unmount to avoid fighting with strict mode re-renders, or do?
                recognitionRef.current.abort();
            }
        };
    }, []);

    // Update lang dynamically
    useEffect(() => {
        if (recognitionRef.current && recognitionRef.current.lang !== lang) {
            recognitionRef.current.lang = lang;
        }
    }, [lang]);

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;
        if (isListening) return; // Prevent double start

        setError(null);
        if (clearTranscriptOnListen) {
            setTranscript('');
        }

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            let newTranscript = '';

            // If continuous, we might want to accumulate OR just show the stream.
            // But the user requested "new sentence replaces old". 
            // The standard 'results' list accumulates EVERYTHING in the session.
            // To get "latest" behavior, we should rely on resultIndex.

            // Logic: Just show what's currently being spoken or just finished in this "event batch"
            // If we want to drop history, we only iterate from event.resultIndex

            const startIndex = event.resultIndex; // This effectively drops history before the current 'gap'

            for (let i = startIndex; i < event.results.length; ++i) {
                newTranscript += event.results[i][0].transcript;
            }

            setTranscript(newTranscript);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
            // console.error("Speech recognition error", event.error); // Ignore repeated errors
            if (event.error === 'no-speech') {
                return; // Ignore no-speech errors usually
            }
            if (event.error === 'not-allowed') {
                setError('Microphone access denied.');
            }
            setIsListening(false);
        };

        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (err) {
            // Usually "already started"
            console.warn(err);
        }
    }, [isListening, clearTranscriptOnListen]);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return;
        recognitionRef.current.stop();
        setIsListening(false);
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isSupported,
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        error
    };
};
