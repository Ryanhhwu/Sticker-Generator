
import React, { useState } from 'react';
import { GeneratedSticker, StickerIdea } from '../types';
import { CheckCircleIcon, ArrowRightIcon, RefreshIcon } from './icons/Icons';

interface CompletionProps {
    t: (key: string) => string;
    setCurrentView: (view: any) => void;
    generatedStickers: GeneratedSticker[];
    stickerIdeas: StickerIdea[];
    stickerPackTitle: string;
    stickerPackDescription: string;
}

const Completion: React.FC<CompletionProps> = ({ t, setCurrentView, generatedStickers, stickerIdeas, stickerPackTitle, stickerPackDescription }) => {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const handleCreateAnother = () => {
        setCurrentView('upload_style');
    };

    const handleCopy = (id: string, hashtags: string[]) => {
        if (hashtags.length > 0) {
            navigator.clipboard.writeText(hashtags.join(', '));
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const allStickersForMarquee = [...generatedStickers, ...generatedStickers]; // Double for seamless loop

    return (
        <div className="w-full max-w-4xl p-8 sm:p-12 rounded-3xl shadow-xl border mx-auto text-center flex flex-col items-center" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)' }}>
            <CheckCircleIcon />
            <h2 className="text-3xl font-bold mt-6 mb-3">{t('completionTitle')}</h2>
            <p className="text-lg mb-8 max-w-md" style={{ color: 'var(--text-muted-color)'}}>
                {t('completionDesc')}
            </p>

            <div className="w-full text-left bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg mb-8 border" style={{ borderColor: 'var(--card-border-color)' }}>
                <h3 className="text-xl font-bold mb-2">{stickerPackTitle}</h3>
                <p style={{ color: 'var(--text-muted-color)'}}>{stickerPackDescription}</p>
            </div>

            <div className="w-full overflow-hidden whitespace-nowrap mb-8">
                <div className="marquee-container">
                    {allStickersForMarquee.map((sticker, index) => (
                        sticker.displaySrc ? (
                            <img key={`${sticker.id}-${index}`} src={sticker.displaySrc} className="h-24 w-24 object-contain rounded-lg mx-4 p-1" style={{backgroundColor: 'var(--input-bg-color)'}} />
                        ) : null
                    ))}
                </div>
            </div>
            
            <h3 className="font-bold text-lg mb-4">{t('allStickersInPack')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-left w-full">
                {generatedStickers.map(sticker => {
                    const idea = stickerIdeas.find(i => i.id === sticker.id);
                    return (
                        <div key={sticker.id} className="p-3 border rounded-lg flex flex-col items-center" style={{backgroundColor: 'var(--input-bg-color)', borderColor: 'var(--card-border-color)'}}>
                             {sticker.displaySrc && <img src={sticker.displaySrc} className="w-24 h-24 object-contain mb-2" />}
                            <p className="font-semibold text-sm break-words text-center w-full mb-2">{idea?.text || '...'}</p>
                             <div className="flex justify-between items-center mt-auto w-full">
                                <p className="text-xs flex-1 truncate" style={{color: 'var(--text-muted-color)'}} title={sticker.hashtags.join(', ')}>
                                    {sticker.hashtags.length > 0 ? sticker.hashtags.join(', ') : t('noKeywords')}
                                </p>
                                {sticker.hashtags.length > 0 && (
                                     <button 
                                        onClick={() => handleCopy(sticker.id, sticker.hashtags)}
                                        className="text-xs ml-2 px-2 py-0.5 rounded"
                                        style={{backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)'}}
                                     >
                                        {copiedId === sticker.id ? t('copied') : t('copy')}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-lg">
                <a href="https://creator.line.me/en/" target="_blank" rel="noopener noreferrer" className="flex-1 text-lg py-3 rounded-xl btn-primary text-white flex items-center justify-center gap-2 no-underline">
                    {t('viewOnLCM')} <ArrowRightIcon/>
                </a>
                <button onClick={handleCreateAnother} className="flex-1 text-lg py-3 rounded-xl btn-secondary flex items-center justify-center gap-2">
                   <RefreshIcon/> {t('createAnother')}
                </button>
            </div>
        </div>
    );
};

export default Completion;
