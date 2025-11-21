
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightIcon } from './icons/Icons';
import { AUDIO_URLS } from '../constants';

interface LandingPageProps {
    onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
    const [isLeaving, setIsLeaving] = useState(false);
    const introAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio(AUDIO_URLS.INTRO_BGM);
        audio.loop = true;
        audio.volume = 0;
        introAudioRef.current = audio;
        
        // Attempt to play immediately on mount. 
        // Note: Modern browsers often block autoplay until interaction. 
        // We handle this by catching the error, and the audio might only start if user has interacted with the domain previously or we retry.
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Fade in effect
                let vol = 0;
                const fadeInterval = setInterval(() => {
                    if (vol < 0.4) {
                        vol += 0.02;
                        audio.volume = Math.min(vol, 0.4);
                    } else {
                        clearInterval(fadeInterval);
                    }
                }, 100);
            }).catch(error => {
                // Autoplay was prevented.
                // This is normal for browsers if the user hasn't interacted with the DOM yet.
                // We silently catch this to avoid the red console error.
                // The music will simply not play until/unless we added an interaction handler, 
                // but for this design, silence on landing is an acceptable fallback if autoplay is blocked.
                // We do NOT log this as an error to keep the console clean.
            });
        }
        
        return () => {
            audio.pause();
            audio.src = "";
        };
    }, []);

    const handleStart = () => {
        // Play Start Sound Effect
        const sfx = new Audio(AUDIO_URLS.START_SFX);
        sfx.volume = 0.6;
        // Handle potential playback error for SFX too
        sfx.play().catch(e => console.log("SFX play failed (likely due to interaction policy or format)", e));

        // Fade out Intro Music
        const audio = introAudioRef.current;
        if (audio) {
            let vol = audio.volume;
            const fadeOut = setInterval(() => {
                if (vol > 0) {
                    vol -= 0.05;
                    // Ensure we don't set negative volume
                    audio.volume = Math.max(0, vol);
                } else {
                    clearInterval(fadeOut);
                    audio.pause();
                }
            }, 100);
        }

        setIsLeaving(true);
        // Wait for the fade-out animation to complete before switching views
        setTimeout(() => {
            onEnterApp();
        }, 1200); 
    };

    return (
        <div id="intro-view" className={`absolute inset-0 flex flex-col z-50 transition-all duration-1000 ${isLeaving ? 'fade-out-scale' : ''}`}>
            
            {/* Intro Text Sequence */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                <h1 className="intro-text-1 absolute text-3xl md:text-4xl font-light tracking-[0.2em] text-gray-800 dark:text-white/90">您好</h1>
                <h1 className="intro-text-2 absolute text-2xl md:text-3xl font-light tracking-[0.15em] text-gray-700 dark:text-white/80 text-center leading-relaxed">
                    歡迎回到<br/><span className="text-primary font-medium">貼圖工作室</span>
                </h1>
            </div>

            {/* Main Landing Content */}
            <div className="main-content-reveal relative z-10 flex h-full flex-col">
                <header className="flex items-center justify-between px-6 sm:px-10 py-6 opacity-90 hover:opacity-100 transition-opacity duration-500">
                    <div className="flex items-center gap-3">
                        <div className="text-primary">
                            <svg className="h-8 w-8 drop-shadow-[0_0_10px_rgba(19,236,128,0.5)]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-gray-800 dark:text-white text-lg font-bold tracking-wider font-display">STICKER GEN</h2>
                    </div>
                    <div className="hidden sm:flex items-center gap-8">
                        <button className="text-gray-600 dark:text-white/60 hover:text-primary transition-colors text-sm tracking-widest font-light">畫廊</button>
                        <button className="text-gray-600 dark:text-white/60 hover:text-primary transition-colors text-sm tracking-widest font-light">教學</button>
                    </div>
                </header>

                <main className="flex flex-1 items-center justify-center p-6">
                    <div className="flex flex-col items-center text-center max-w-4xl">
                        <div className="mb-10 relative group cursor-default">
                            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-in-out"></div>
                            <div className="relative bg-white/20 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-700 ease-out">
                                <span className="material-symbols-outlined text-primary block" style={{fontSize: '48px', fontWeight: 200}}>auto_fix</span>
                            </div>
                        </div>
                        <h1 className="text-5xl sm:text-7xl font-light text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
                            讓創意 <br className="sm:hidden" />
                            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-gray-600 to-gray-400 dark:from-white dark:via-white dark:to-white/50">成為對話的溫度</span>
                        </h1>
                        <p className="text-gray-600 dark:text-white/50 text-lg sm:text-xl font-light mb-12 max-w-lg mx-auto leading-relaxed tracking-wide">
                            極簡創作，無限可能。<br/>為您的每一句問候，畫上獨一無二的表情。
                        </p>
                        
                        {/* Start Button */}
                        <button 
                            id="start-btn" 
                            onClick={handleStart} 
                            className="btn-reveal group relative flex items-center justify-center min-w-[200px] h-14 px-8 rounded-full bg-transparent border border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-500 ease-out cursor-pointer"
                        >
                            <div className="flex items-center pointer-events-none">
                                <span className="text-primary group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300 text-lg font-medium tracking-[0.2em] mr-2">點擊開始</span>
                                <span className="material-symbols-outlined text-primary group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300 group-hover:translate-x-1 transform text-xl">arrow_forward</span>
                            </div>
                            <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(19,236,128,0)] group-hover:shadow-[0_0_30px_rgba(19,236,128,0.3)] transition-shadow duration-500 pointer-events-none"></div>
                        </button>
                    </div>
                </main>
                
                <footer className="py-8 text-center">
                    <p className="text-gray-400 dark:text-white/20 text-xs tracking-[0.2em] font-light">DESIGNED FOR CREATORS</p>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
