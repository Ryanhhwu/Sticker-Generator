import React, { useState } from 'react';
import { GeneratedSticker, EditingStickerInfo, StickerIdea } from '../types';
import { EditIcon, RefreshIcon, LoadingSpinnerIcon } from './icons/Icons';

interface Step3Props {
    t: (key: string, replacements?: Record<string, string | number>) => string;
    generatedStickers: GeneratedSticker[];
    stickerIdeas: StickerIdea[];
    regenerateSticker: (stickerId: string, prompt: string) => void;
    regenerateAllStickers: () => Promise<void>;
    setEditingSticker: (info: EditingStickerInfo | null) => void;
    setCurrentView: (view: any) => void;
    handleGoToExport: () => Promise<void>;
    handleUpdateIdeaAndRegenerate: (stickerId: string, newText: string) => Promise<void>;
}

const Step3Results: React.FC<Step3Props> = (props) => {
    const { t, generatedStickers, stickerIdeas, regenerateSticker, regenerateAllStickers, setEditingSticker, setCurrentView, handleGoToExport, handleUpdateIdeaAndRegenerate } = props;
    const isAnyStickerGenerating = generatedStickers.some(s => s.isGenerating);
    const [editingIdea, setEditingIdea] = useState<{ id: string; text: string } | null>(null);

    const handleSaveIdea = async () => {
        if (!editingIdea || !editingIdea.text.trim()) return;
        await handleUpdateIdeaAndRegenerate(editingIdea.id, editingIdea.text);
        setEditingIdea(null);
    };

    return (
        <div className="w-full max-w-7xl p-6 sm:p-8 rounded-3xl shadow-xl border mx-auto" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)' }}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-green-600">{t('step3Title')}</h2>
                <div className="flex gap-4">
                     <button onClick={() => setCurrentView('ideas')} className="btn-secondary px-4 py-2 rounded-lg">{t('back')}</button>
                     <button onClick={regenerateAllStickers} disabled={isAnyStickerGenerating} className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <RefreshIcon /> {t('regenerateAll')}
                    </button>
                </div>
            </div>
            
            {isAnyStickerGenerating ? (
                <div className="mb-4 text-center p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg dark:bg-green-900/50 dark:border-green-700 dark:text-green-200">
                    <div className="flex items-center justify-center">
                        <LoadingSpinnerIcon className="h-5 w-5 mr-3 text-green-600"/>
                        <span>{t('generatingStickersNonBlocking')}</span>
                    </div>
                </div>
            ) : (
                <p className="mb-6 text-center" style={{ color: 'var(--text-muted-color)'}}>{t('generationComplete')}</p>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {generatedStickers.map(sticker => {
                    const idea = stickerIdeas.find(i => i.id === sticker.id);
                    return (
                        <div key={sticker.id} className="flex flex-col border rounded-lg shadow-sm overflow-hidden" style={{borderColor: 'var(--input-border-color)'}}>
                            <div className="relative aspect-square group w-full">
                                {sticker.isGenerating ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
                                        <LoadingSpinnerIcon className="h-8 w-8 text-green-500"/>
                                    </div>
                                ) : sticker.displaySrc ? (
                                    <img src={sticker.displaySrc} alt={`Generated Sticker ${sticker.id}`} className="w-full h-full object-contain p-2" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 text-center p-2">
                                        <p className="text-sm font-semibold">{t('errorTitle')}</p>
                                        <button onClick={() => regenerateSticker(sticker.id, sticker.prompt)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600 transition-colors flex items-center gap-1">
                                            <RefreshIcon /> {t('regenerate')}
                                        </button>
                                    </div>
                                )}
                                
                                {!sticker.isGenerating && sticker.displaySrc && (
                                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="flex gap-4">
                                            <button onClick={() => setEditingSticker({ id: sticker.id, prompt: sticker.prompt })} title={t('edit')} className="p-3 bg-white/20 rounded-full text-white hover:bg-white/40 backdrop-blur-sm">
                                                <EditIcon />
                                            </button>
                                            <button onClick={() => regenerateSticker(sticker.id, sticker.prompt)} title={t('regenerate')} className="p-3 bg-white/20 rounded-full text-white hover:bg-white/40 backdrop-blur-sm">
                                                <RefreshIcon />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {idea && (
                                <div className="p-2 text-center border-t bg-white/50 dark:bg-black/20" style={{borderColor: 'var(--input-border-color)'}}>
                                     {editingIdea?.id === sticker.id ? (
                                        <div className="flex gap-1 items-center">
                                            <input 
                                                type="text"
                                                value={editingIdea.text}
                                                onChange={(e) => setEditingIdea({ ...editingIdea, text: e.target.value })}
                                                className="flex-1 text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-green-500 rounded px-1 py-0.5"
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveIdea(); }}
                                                autoFocus
                                            />
                                            <button onClick={handleSaveIdea} className="px-2 py-1 bg-green-500 text-white rounded text-xs">{t('save')}</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 group">
                                            <p className="text-xs break-words" style={{color: 'var(--text-muted-color)'}} title={idea.text}>
                                                {idea.text}
                                            </p>
                                            <button onClick={() => setEditingIdea({ id: sticker.id, text: idea.text })} className="text-gray-400 hover:text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <EditIcon />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <button onClick={handleGoToExport} disabled={isAnyStickerGenerating} className="w-full text-lg mt-8 py-3 rounded-xl btn-primary text-white">{t('nextExport')}</button>
        </div>
    );
};

export default Step3Results;