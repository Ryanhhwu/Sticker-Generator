import React, { useState } from 'react';
import { AssistantMessage, Language } from '../types';
import { CloseIcon, ChatBubbleIcon, MicrophoneIcon } from './icons/Icons';
import LiveAssistantContent from './LiveAssistant';
import AssistantWidgetContent from './AssistantWidget';

interface AssistantModalProps {
    t: (key: string, replacements?: Record<string, string | number>) => string;
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    // Props for Text mode
    messages: AssistantMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const AssistantModal: React.FC<AssistantModalProps> = (props) => {
    const { isOpen, onClose, t, language } = props;
    const [mode, setMode] = useState<'text' | 'live'>('text');
    const avatarUrl = 'https://i.pinimg.com/736x/65/70/c6/6570c6d04325fde88255b9e05b2f466c.jpg';

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 transition-opacity duration-300 z-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg h-[80vh] rounded-2xl shadow-2xl flex flex-col border"
                style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-3 border-b" style={{ borderColor: 'var(--card-border-color)' }}>
                    <div className="flex items-center gap-3">
                        <img src={avatarUrl} alt="PiPi Avatar" className="w-10 h-10 rounded-full border-2 border-green-200 dark:border-green-800 object-cover" />
                        <h3 className="font-bold text-lg text-green-600">{t('assistantTitle')}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex rounded-lg p-1" style={{backgroundColor: 'var(--btn-secondary-bg)'}}>
                            <button 
                                onClick={() => setMode('text')} 
                                title={t('textChat')}
                                className={`p-2 sm:px-3 sm:py-1 rounded-md text-sm font-semibold flex items-center justify-center sm:gap-1.5 transition-colors ${mode === 'text' ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-500 dark:text-white' : 'text-gray-500 dark:text-gray-300'}`}
                            >
                                <ChatBubbleIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">{t('textChat')}</span>
                            </button>
                            <button 
                                onClick={() => setMode('live')} 
                                title={t('voiceChat')}
                                className={`p-2 sm:px-3 sm:py-1 rounded-md text-sm font-semibold flex items-center justify-center sm:gap-1.5 transition-colors ${mode === 'live' ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-500 dark:text-white' : 'text-gray-500 dark:text-gray-300'}`}
                            >
                                <MicrophoneIcon className="w-5 h-5"/>
                                <span className="hidden sm:inline">{t('voiceChat')}</span>
                            </button>
                        </div>
                        
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {mode === 'text' ? (
                        <AssistantWidgetContent
                            t={t}
                            messages={props.messages}
                            onSendMessage={props.onSendMessage}
                            isLoading={props.isLoading}
                            language={language}
                        />
                    ) : (
                        <LiveAssistantContent
                            t={t}
                            isActive={mode === 'live'}
                            onClose={onClose}
                            language={language}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssistantModal;