
import React, { useState, useEffect } from 'react';
import { LoadingSpinnerIcon } from './icons/Icons';

interface LoadingOverlayProps {
    t: (key: string, replacements?: Record<string, string | number>) => string;
    loadingMessage: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ t, loadingMessage }) => {
    const [encouragingMessage, setEncouragingMessage] = useState('');

    useEffect(() => {
        // FIX: The translation now provides a single pipe-delimited string. Split it to get an array of messages.
        const messages = t('encouragingMessages').split('|');
        if (messages.length > 0) {
            setEncouragingMessage(messages[Math.floor(Math.random() * messages.length)]);

            const interval = setInterval(() => {
                setEncouragingMessage(messages[Math.floor(Math.random() * messages.length)]);
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [t]);

    return (
        <div className="fixed inset-0 bg-gray-900/80 dark:bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
            <LoadingSpinnerIcon className="text-green-500 h-12 w-12 mb-4" />
            <p className="text-white text-lg font-semibold transition-opacity duration-500">{encouragingMessage}</p>
            <p className="text-gray-300 mt-2">{loadingMessage}</p>
        </div>
    );
};

export default LoadingOverlay;
