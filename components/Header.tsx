import React, { useState, useEffect } from 'react';
import { Language, Theme, View } from '../types';
// FIX: Corrected import path.
import { GlobeIcon, MoonIcon, SunIcon } from './icons/Icons';

interface HeaderProps {
    t: (key: string, replacements?: Record<string, string | number>) => string;
    currentView: View;
    theme: Theme;
    language: Language;
    handleThemeToggle: () => void;
    handleLanguageToggle: () => void;
    error: string | null;
    isLoading: boolean;
    loadingMessage: string;
    showLoadingOverlay: boolean;
}

const Header: React.FC<HeaderProps> = ({
    t,
    currentView,
    theme,
    handleThemeToggle,
    handleLanguageToggle,
    error,
    isLoading,
    loadingMessage,
    showLoadingOverlay
}) => {
    const slogans = t('slogans').split('|');
    const [sloganIndex, setSloganIndex] = useState(0);
    const [sloganOpacity, setSloganOpacity] = useState(1);

    useEffect(() => {
        if (slogans.length <= 1) return;

        const interval = setInterval(() => {
            setSloganOpacity(0);
            setTimeout(() => {
                setSloganIndex(prev => (prev + 1) % slogans.length);
                setSloganOpacity(1);
            }, 500); // match transition duration
        }, 5000); // Change slogan every 5 seconds

        return () => clearInterval(interval);
    }, [slogans.length]);

    return (
        <header className="mb-8 sm:mb-12 w-full text-center relative">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b" style={{ color: 'transparent', backgroundImage: 'linear-gradient(to bottom, var(--header-text-from), var(--header-text-to))' }}>
                <strong className="text-green-500">LINE</strong> {t('appTitle')}
            </h1>
            <p className="mt-4 text-lg sm:text-xl h-7" style={{ color: 'var(--text-muted-color)', transition: 'opacity 0.5s ease-in-out', opacity: sloganOpacity }}>
                {slogans[sloganIndex]}
            </p>

            {currentView === 'upload_style' && (
                 <div className="absolute top-0 left-4 sm:left-6">
                    <button onClick={handleLanguageToggle} title={t('langToggle')} className="p-2 rounded-full transition-colors" style={{ color: 'var(--text-muted-color)', backgroundColor: 'var(--btn-secondary-bg)' }}>
                        <GlobeIcon />
                    </button>
                 </div>
            )}
           
            <div className="absolute top-0 right-4 sm:right-6">
                <button onClick={handleThemeToggle} title={theme === 'dark' ? t('themeToggleLight') : t('themeToggleDark')} className="p-2 rounded-full transition-colors" style={{ color: 'var(--text-muted-color)', backgroundColor: 'var(--btn-secondary-bg)' }}>
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
            </div>
            
            {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-lg mx-auto dark:bg-red-900/50 dark:border-red-700 dark:text-red-200">
                    {error}
                </div>
            )}
            
            {isLoading && loadingMessage && currentView !== 'results' && !showLoadingOverlay && (
                 <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg max-w-lg mx-auto dark:bg-green-900/50 dark:border-green-700 dark:text-green-200 animate-pulse">
                    {loadingMessage}
                </div>
            )}
        </header>
    );
};

export default Header;