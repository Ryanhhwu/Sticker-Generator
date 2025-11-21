import React, { useState } from 'react';
import { StickerIdea, Language, UploadedImage, StickerType } from '../types';
import { INSPIRATION_THEMES, TEXT_LANGUAGE_OPTIONS_I18N } from '../constants';
import * as geminiService from '../services/geminiService';
import { PlusIcon, RemoveIcon, RefreshIcon, LoadingSpinnerIcon, SearchIdeaIcon } from './icons/Icons';

interface Step2Props {
    t: (key: string, replacements?: Record<string, string | number>) => string;
    language: Language;
    uploadedImages: UploadedImage[];
    stylePreviewImage: string | null;
    selectedStyleIds: string[];
    stickerCount: number;
    characterDescription: string;
    textMode: 'with_text' | 'none';
    textLanguage: string;
    stickerIdeas: StickerIdea[];
    setStickerIdeas: React.Dispatch<React.SetStateAction<StickerIdea[]>>;
    stickerTheme: string;
    setStickerTheme: React.Dispatch<React.SetStateAction<string>>;
    setCurrentView: (view: any) => void;
    setError: (error: string | null) => void;
    handleStartGeneration: () => Promise<void>;
    setShowLoadingOverlay: React.Dispatch<React.SetStateAction<boolean>>;
    // FIX: Add setLoadingMessage to props to allow setting the loading message.
    setLoadingMessage: React.Dispatch<React.SetStateAction<string>>;
    onRegeneratePreview: () => Promise<void>;
    stickerType: StickerType;
}


const Step2ThemeIdeas: React.FC<Step2Props> = (props) => {
    const { t, language, uploadedImages, stylePreviewImage, selectedStyleIds, stickerCount, characterDescription, textMode, textLanguage, stickerIdeas, setStickerIdeas, stickerTheme, setStickerTheme, setCurrentView, setError, handleStartGeneration, setShowLoadingOverlay, setLoadingMessage, onRegeneratePreview, stickerType } = props;
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
    const [customIdeaInput, setCustomIdeaInput] = useState('');
    const [inspirationSuggestions, setInspirationSuggestions] = useState<string[]>([]);
    
    const selectedStyleLabels = selectedStyleIds.map(id => 
        t(`style${id.charAt(0).toUpperCase() + id.slice(1)}Label`)
    ).join(' + ');


    const handleGenerateIdeas = async () => {
        if (!stickerTheme.trim()) return;
        setIsGeneratingIdeas(true);
        setError(null);
        try {
            const languageMap: Record<Language, string> = {
                'zh-Hant': 'Traditional Chinese',
                'en': 'English',
                'ja': 'Japanese'
            };
            const langForPrompt = languageMap[language];

            const ideas = await geminiService.generateStickerIdeas(
                stickerTheme,
                characterDescription,
                stickerCount,
                langForPrompt,
                textMode === 'with_text',
                stickerType
            );
            setStickerIdeas(ideas);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGeneratingIdeas(false);
        }
    };

    const handleGetInspiration = async () => {
        setShowLoadingOverlay(true);
        setLoadingMessage(t('analyzingForInspiration'));
        setError(null);
        
        const languageMap: Record<Language, string> = {
            'zh-Hant': 'Traditional Chinese',
            'en': 'English',
            'ja': 'Japanese'
        };
        const languageForPrompt = languageMap[language] || 'English';

        try {
            const suggestions = await geminiService.getInspirationFromImages(uploadedImages, languageForPrompt);
            setInspirationSuggestions(suggestions);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setShowLoadingOverlay(false);
        }
    }
    
    const handleAddCustomIdea = () => {
        if (!customIdeaInput.trim()) return;
        const newIdea: StickerIdea = {
            id: new Date().toISOString(),
            text: customIdeaInput,
            base: customIdeaInput, // For custom ideas, base and text are the same initially
            memeText: textMode === 'with_text' ? customIdeaInput : ''
        };
        setStickerIdeas(prev => [...prev, newIdea]);
        setCustomIdeaInput('');
    };

    const handleRemoveIdea = (idToRemove: string) => {
        setStickerIdeas(prev => prev.filter(idea => idea.id !== idToRemove));
    };

    const handleIdeaTextChange = (idToUpdate: string, newText: string) => {
        setStickerIdeas(prevIdeas => 
            prevIdeas.map(idea => 
                idea.id === idToUpdate 
                ? { ...idea, text: newText, base: newText, memeText: textMode === 'with_text' ? newText : '' } 
                : idea
            )
        );
    };

    const handleNextStep = async () => {
        if (stickerIdeas.length === 0) {
            setError(t('errorNoIdeas'));
            return;
        }
        setError(null);
        await handleStartGeneration();
    };

    return (
        <div className="w-full max-w-7xl p-6 sm:p-8 rounded-3xl shadow-xl border mx-auto" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)' }}>
            <h2 className="text-2xl font-bold mb-6 text-green-600 dark:text-primary">{t('step2Title')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-3">{t('stylePreview')}</h3>
                    <div className="aspect-square w-full max-w-sm mx-auto rounded-2xl border flex items-center justify-center relative shadow-inner" style={{ backgroundColor: 'var(--input-bg-color)', borderColor: 'var(--input-border-color)' }}>
                        {stylePreviewImage ? (
                            <img src={stylePreviewImage} alt="Style Preview" className="w-full h-full object-contain rounded-2xl" />
                        ) : (
                            <div className="animate-pulse w-full h-full bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                                <LoadingSpinnerIcon className="h-12 w-12 text-green-500" />
                            </div>
                        )}
                         <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-center text-sm p-2 rounded-lg backdrop-blur-sm">
                            {t('yourCharacterInStyle', { styleName: selectedStyleLabels })}
                        </div>
                    </div>
                    <button onClick={onRegeneratePreview} title={t('regeneratePreview')} className="w-full max-w-sm mx-auto mt-4 btn-secondary px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                        <RefreshIcon /> {t('regeneratePreview')}
                    </button>
                </div>

                <div className="lg:col-span-2 space-y-6">
                     <div>
                        <h3 className="text-lg font-semibold mb-2">{t('stickerThemeIdeas')}</h3>
                        <div className="p-4 rounded-lg border" style={{backgroundColor: 'var(--input-bg-color)', borderColor: 'var(--input-border-color)'}}>
                            <label htmlFor="theme-input" className="block text-base font-medium mb-2">{t('selectInspiration')}</label>
                            <p className="text-sm -mt-2 mb-3" style={{ color: 'var(--text-muted-color)'}}>{t('selectInspirationHint')}</p>
                             <div className="w-full overflow-x-auto whitespace-nowrap mb-4 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                <div className="marquee-container hover:pause-animation">
                                    {[...INSPIRATION_THEMES[language], ...INSPIRATION_THEMES[language]].map((theme, index) => (
                                        <div key={`${theme}-${index}`} className="marquee-item" onClick={() => setStickerTheme(theme)}>
                                            {theme}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleGetInspiration} className="w-full btn-secondary py-2 rounded-lg flex items-center justify-center gap-2 mb-3">
                                <SearchIdeaIcon/> {t('getInspiration')}
                            </button>
                            {inspirationSuggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2 justify-center mb-3">
                                    {inspirationSuggestions.map(s => (
                                        <button key={s} onClick={() => setStickerTheme(s)} className="marquee-item hover:bg-green-500">{s}</button>
                                    ))}
                                </div>
                            )}
                            <p className="text-center my-2 font-semibold" style={{color: 'var(--text-muted-color)'}}>{t('orEnterTheme')}</p>
                            <input id="theme-input" type="text" value={stickerTheme} onChange={e => setStickerTheme(e.target.value)} placeholder={t('customThemePlaceholder')} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-base" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--input-border-color)', color: 'var(--text-color)' }} />
                            <button onClick={handleGenerateIdeas} disabled={isGeneratingIdeas || !stickerTheme.trim()} className="w-full mt-4 py-2 rounded-lg btn-primary text-white flex items-center justify-center gap-2">
                               {isGeneratingIdeas && <LoadingSpinnerIcon className="h-5 w-5"/>}
                               {isGeneratingIdeas ? t('generatingIdeas') : t('generateIdeas')}
                            </button>
                        </div>
                    </div>
                    
                    {stickerIdeas.length > 0 && (
                      <>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 style-grid">
                            {stickerIdeas.map((idea) => (
                                <div key={idea.id} className="flex items-center gap-2 p-2 rounded-lg border" style={{ backgroundColor: 'var(--input-bg-color)', borderColor: 'var(--input-border-color)' }}>
                                    <input 
                                        type="text"
                                        value={idea.text}
                                        onChange={(e) => handleIdeaTextChange(idea.id, e.target.value)}
                                        className="flex-1 text-base bg-transparent focus:outline-none focus:ring-1 focus:ring-green-500 rounded px-2 py-1"
                                        style={{ color: 'var(--text-color)' }}
                                    />
                                    <button onClick={() => handleRemoveIdea(idea.id)} className="p-1 text-red-500 hover:text-red-400"><RemoveIcon /></button>
                                </div>
                            ))}
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-2">{t('customIdeas')}</h3>
                            <div className="flex gap-2">
                                <input type="text" value={customIdeaInput} onChange={e => setCustomIdeaInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCustomIdea()} placeholder={t('customIdeaPlaceholder')} className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-base" style={{ backgroundColor: 'var(--input-bg-color)', borderColor: 'var(--input-border-color)', color: 'var(--text-color)' }} />
                                <button onClick={handleAddCustomIdea} className="p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"><PlusIcon /></button>
                            </div>
                        </div>
                      </>
                    )}
                    
                    <div className="flex gap-4 items-center">
                         <button onClick={() => setCurrentView('upload_style')} className="btn-secondary px-6 py-3 rounded-xl">{t('back')}</button>
                         <button onClick={handleNextStep} disabled={stickerIdeas.length === 0} className="flex-1 text-lg py-3 rounded-xl btn-primary text-white">{t('nextGenerateStickers', {count: stickerIdeas.length})}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step2ThemeIdeas;