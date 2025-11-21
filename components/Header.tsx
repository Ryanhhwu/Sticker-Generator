
import React from 'react';
import { Language, Theme, View } from '../types';
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
    return (
        <header className="h-16 w-full flex items-center justify-between px-4 sm:px-6 mb-6 rounded-2xl border border-gray-200 dark:border-white/5 bg-white/30 dark:bg-background-dark/80 backdrop-blur-md z-20 shadow-sm transition-colors duration-500">
            <div className="flex items-center gap-4">
                 <div className="text-primary">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
                    </svg>
                </div>
                <span className="text-gray-300 dark:text-white/40 text-sm">/</span>
                <h1 className="text-gray-800 dark:text-white text-lg font-bold tracking-wide font-display">
                    STICKER <span className="text-primary">STUDIO</span>
                </h1>
            </div>
            
            {/* Central Status / Error Message Area (Visible if there is space) */}
            <div className="hidden md:flex flex-1 justify-center">
                 {error && (
                    <div className="px-3 py-1 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-200 rounded text-xs flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {error}
                    </div>
                )}
                {isLoading && loadingMessage && !showLoadingOverlay && (
                     <div className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary-dim dark:text-primary rounded text-xs flex items-center gap-2 animate-pulse">
                        <span className="material-symbols-outlined text-xs">hourglass_empty</span>
                        {loadingMessage}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                {currentView === 'upload_style' && (
                     <button 
                        onClick={handleLanguageToggle} 
                        title={t('langToggle')} 
                        className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                        <GlobeIcon />
                    </button>
                )}
                <button 
                    onClick={handleThemeToggle} 
                    title={theme === 'dark' ? t('themeToggleLight') : t('themeToggleDark')} 
                    className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded hover:bg-gray-100 dark:hover:bg-white/5"
                >
                    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
            </div>
        </header>
    );
};

export default Header;
