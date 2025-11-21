
import React from 'react';
import { GeneratedSticker, EditingStickerInfo, StickerIdea, EditingIdeaInfo } from '../types';
import { EditIcon, RefreshIcon, LoadingSpinnerIcon } from './icons/Icons';

interface Step3Props {
    t: (key: string, replacements?: Record<string, string | number>) => string;
    generatedStickers: GeneratedSticker[];
    stickerIdeas: StickerIdea[];
    requestRegenerateSticker: (stickerId: string, prompt: string) => void;
    requestRegenerateAll: () => void;
    setEditingSticker: (info: EditingStickerInfo | null) => void;
    setCurrentView: (view: any) => void;
    handleGoToExport: () => Promise<void>;
    setEditingIdea: (info: EditingIdeaInfo | null) => void;
}

const Step3Results: React.FC<Step3Props> = (props) => {
    const { t, generatedStickers, stickerIdeas, requestRegenerateSticker, requestRegenerateAll, setEditingSticker, setCurrentView, handleGoToExport, setEditingIdea } = props;
    const isAnyStickerGenerating = generatedStickers.some(s => s.isGenerating);

    return (
        <div className="w-full max-w-7xl p-6 sm:p-8 rounded-3xl shadow-xl border mx-auto" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold text-green-600">{t('step3Title')}</h2>
                <div className="flex gap-4">
                     <button onClick={() => setCurrentView('ideas')} className="btn-secondary px-4 py-2 rounded-lg">{t('back')}</button>
                     <button onClick={requestRegenerateAll} disabled={isAnyStickerGenerating} className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
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
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {generatedStickers.map(sticker => {
                    const idea = stickerIdeas.find(i => i.id === sticker.id);
                    return (
                        <div key={sticker.id} className="group p-4 rounded-xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col" style={{ backgroundColor: 'var(--card-hover-bg)', borderColor: 'var(--card-border-color)' }}>
                            <div className="relative mb-4">
                                {sticker.isGenerating ? (
                                    <div className="w-full aspect-square flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                                        <LoadingSpinnerIcon className="h-8 w-8 text-green-500"/>
                                    </div>
                                ) : sticker.displaySrc ? (
                                    <img src={sticker.displaySrc} alt={idea?.text || `Generated Sticker ${sticker.id}`} className="w-full h-auto aspect-square object-contain rounded-md transition-transform duration-300 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full aspect-square flex flex-col items-center justify-center bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 text-center p-2 rounded-md">
                                        <p className="text-sm font-semibold">{t('errorTitle')}</p>
                                    </div>
                                )}
                            </div>
                            
                            {idea && (
                                <p 
                                    onClick={() => !sticker.isGenerating && setEditingIdea({ id: sticker.id, text: idea.text })}
                                    className="text-sm mb-4 text-justify" 
                                    style={{ color: 'var(--text-muted-color)', cursor: sticker.isGenerating ? 'default' : 'pointer', minHeight: '3.5rem' }}
                                    title={t('editIdeaTitle')}
                                >
                                    {idea.text}
                                </p>
                            )}
                            
                            <div className="flex justify-around items-center pt-3 border-t mt-auto" style={{borderColor: 'var(--input-border-color)'}}>
                                <button 
                                    onClick={() => requestRegenerateSticker(sticker.id, sticker.prompt)} 
                                    disabled={sticker.isGenerating}
                                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={t('regenerate')}
                                >
                                    <RefreshIcon />
                                    <span className="text-sm font-medium">{t('regenerate')}</span>
                                </button>
                                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                                <button 
                                    onClick={() => sticker.displaySrc && setEditingSticker({ id: sticker.id, src: sticker.displaySrc!, prompt: sticker.prompt })} 
                                    disabled={!sticker.displaySrc || sticker.isGenerating}
                                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={t('edit')}
                                >
                                    <EditIcon />
                                    <span className="text-sm font-medium">{t('edit')}</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button 
                onClick={handleGoToExport} 
                disabled={isAnyStickerGenerating} 
                className="block w-full max-w-lg mx-auto mt-12 btn-primary text-white text-lg font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {t('nextExport')}
            </button>
        </div>
    );
};

export default Step3Results;