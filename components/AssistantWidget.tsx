import React, { useState, useRef, useEffect } from 'react';
import { AssistantMessage, Language } from '../types';
import { SendIcon, MicrophoneIcon } from './icons/Icons';
import { PIPI_STICKERS } from '../constants';

// FIX: Add type definitions for the Web Speech API to resolve 'SpeechRecognition' not found errors.
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    onstart: () => void;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}


// Extend the window object to include webkitSpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

interface AssistantWidgetContentProps {
    t: (key: string, replacements?: Record<string, string | number>) => string;
    messages: AssistantMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    language: Language;
}

const AssistantWidgetContent: React.FC<AssistantWidgetContentProps> = ({ t, messages, onSendMessage, isLoading, language }) => {
    const [userInput, setUserInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const avatarUrl = 'https://i.pinimg.com/736x/65/70/c6/6570c6d04325fde88255b9e05b2f466c.jpg';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.trim() && !isLoading) {
            onSendMessage(userInput);
            setUserInput('');
        }
    };

    const handleToggleListening = () => {
        if (!SpeechRecognition) {
            console.error("Speech Recognition API not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            
            const langMap: Record<Language, string> = {
                'zh-Hant': 'zh-TW',
                'en': 'en-US',
                'ja': 'ja-JP'
            };

            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = langMap[language];

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                     if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    }
                }
                if (transcript) {
                    setUserInput(prev => prev + transcript);
                }
            };
            
            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        }
    };
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);


    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => {
                    if (msg.role === 'user') {
                        return (
                            <div key={index} className="flex justify-end">
                                <div
                                    className="max-w-xs md:max-w-sm rounded-xl px-4 py-2 whitespace-pre-wrap bg-green-500 text-white"
                                >
                                    {msg.content}
                                </div>
                            </div>
                        );
                    } else { // assistant
                        const sticker = msg.stickerId ? PIPI_STICKERS[msg.stickerId] : null;
                        return (
                            <div key={index} className="flex items-start gap-3">
                                <img src={avatarUrl} alt="PiPi Avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                <div className="flex flex-col items-start gap-2">
                                    <div
                                        className="max-w-xs md:max-w-sm rounded-xl px-4 py-2 whitespace-pre-wrap bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm"
                                    >
                                        {msg.content}
                                    </div>
                                    {sticker && (
                                        <div className="rounded-xl bg-white dark:bg-gray-600 p-2 self-start shadow-sm">
                                            <img
                                                src={sticker.url}
                                                alt={sticker.description[language]}
                                                className="w-32 h-32 object-contain rounded-md"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }
                })}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <img src={avatarUrl} alt="PiPi Avatar" className="w-8 h-8 rounded-full object-cover" />
                        <div className="max-w-xs md:max-w-sm rounded-xl px-4 py-2 bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm">
                            <div className="flex items-center">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse mr-1.5"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse mr-1.5" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--card-border-color)' }}>
                <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={isListening ? t('assistantListening') : t('assistantPlaceholder')}
                        className="flex-1 w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-base"
                        style={{ backgroundColor: 'var(--input-bg-color)', borderColor: 'var(--input-border-color)', color: 'var(--text-color)' }}
                        disabled={isLoading}
                    />
                     {SpeechRecognition && (
                        <button
                            type="button"
                            onClick={handleToggleListening}
                            title={t('assistantMic')}
                            className={`p-3 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'btn-secondary'}`}
                        >
                            <MicrophoneIcon className="w-5 h-5"/>
                        </button>
                    )}
                    <button type="submit" disabled={isLoading || !userInput.trim()} className="p-3 rounded-lg btn-primary text-white disabled:opacity-50">
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AssistantWidgetContent;