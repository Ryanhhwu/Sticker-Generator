
import React, { useState, useEffect, useCallback } from 'react';
import { Language, Theme, View, UploadedImage, StickerType, OutlineStyle, TextMode, StickerIdea, GeneratedSticker, EditingStickerInfo } from './types';
import { useTranslations } from './utils/translations';
import { createEnhancedPrompt } from './utils/promptHelper';
import * as geminiService from './services/geminiService';
import { removeGreenScreenAndResize, cropImageToSquare } from './utils/imageProcessing';
import { STICKER_SPECS, TEXT_LANGUAGE_OPTIONS_I18N, MAX_UPLOAD_COUNT } from './constants';

import Header from './components/Header';
import Step1CharacterStyle from './components/Step1_CharacterStyle';
import Step2ThemeIdeas from './components/Step2_ThemeIdeas';
import Step3Results from './components/Step3_Results';
import Step4Export from './components/Step4_Export';
import Completion from './components/Completion';
import LoadingOverlay from './components/LoadingOverlay';
import EditModal from './components/EditModal';
import CameraModal from './components/CameraModal';

function App() {
    // Internationalization and Theming
    const [language, setLanguage] = useState<Language>('zh-Hant');
    const [theme, setTheme] = useState<Theme>('light');
    const { t, setLanguage: setT } = useTranslations(language);

    // App State
    const [currentView, setCurrentView] = useState<View>('upload_style');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    // Step 1: Style and Character
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [stickerType, setStickerType] = useState<StickerType>('static');
    const [selectedStyleId, setSelectedStyleId] = useState('anime');
    const [stickerCount, setStickerCount] = useState(8);
    const [outlineStyle, setOutlineStyle] = useState<OutlineStyle>('white');
    const [characterDescription, setCharacterDescription] = useState('');
    const [textMode, setTextMode] = useState<TextMode>('none');
    const [textLanguage, setTextLanguage] = useState('chinese_traditional');
    const [stylePreviewImage, setStylePreviewImage] = useState<string | null>(null);
    
    // Step 2: Ideas
    const [stickerIdeas, setStickerIdeas] = useState<StickerIdea[]>([]);
    const [stickerTheme, setStickerTheme] = useState('');

    // Step 3: Results
    const [generatedStickers, setGeneratedStickers] = useState<GeneratedSticker[]>([]);
    const [editingSticker, setEditingSticker] = useState<EditingStickerInfo | null>(null);

    // Step 4: Export
    const [stickerPackTitle, setStickerPackTitle] = useState('');
    const [stickerPackDescription, setStickerPackDescription] = useState('');
    const [includedStickerIds, setIncludedStickerIds] = useState<string[]>([]);
    const [mainStickerId, setMainStickerId] = useState<string | null>(null);
    const [tabStickerId, setTabStickerId] = useState<string | null>(null);

    // Theme toggle effect
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const handleThemeToggle = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const handleLanguageToggle = () => {
        const newLang = language === 'zh-Hant' ? 'en' : (language === 'en' ? 'ja' : 'zh-Hant');
        setLanguage(newLang);
        setT(newLang);
    };

    const handleCaptureImage = useCallback(async (imageBase64: string) => {
        setIsCameraOpen(false);
        if (uploadedImages.length >= MAX_UPLOAD_COUNT) {
            setError(t('maxUploads', { count: MAX_UPLOAD_COUNT }));
            return;
        }

        setIsLoading(true);
        setLoadingMessage(t('processingAndPacking'));
        setError(null);
        
        try {
            const croppedImage = await cropImageToSquare(imageBase64);
            const newImage: UploadedImage = { base64: croppedImage, name: `capture-${Date.now()}.png` };
            setUploadedImages(prev => [...prev, newImage]);
        } catch (err) {
            setError(t('errorImageProcessing'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [uploadedImages.length, t]);

    const processAndSetStickerImage = async (stickerId: string, originalSrc: string, prompt: string) => {
        const spec = STICKER_SPECS[stickerType];
        try {
            const displaySrc = await removeGreenScreenAndResize(originalSrc, spec.width, spec.height);
            setGeneratedStickers(prev => prev.map(s => s.id === stickerId ? { ...s, originalSrc, displaySrc, prompt, isGenerating: false } : s));
        } catch (e) {
            console.error("Error processing image:", e);
            setGeneratedStickers(prev => prev.map(s => s.id === stickerId ? { ...s, originalSrc: null, displaySrc: null, prompt, isGenerating: false } : s));
        }
    };
    
    const generateSticker = useCallback(async (idea: StickerIdea) => {
        const langOption = TEXT_LANGUAGE_OPTIONS_I18N[language].find(opt => opt.id === textLanguage);
        const langForPrompt = langOption ? langOption.prompt : 'Traditional Chinese';
        const prompt = createEnhancedPrompt(idea, selectedStyleId, textMode, langForPrompt, characterDescription, outlineStyle, stickerType);
        try {
            const imageUrl = await geminiService.generateImage(prompt, uploadedImages, stylePreviewImage);
            await processAndSetStickerImage(idea.id, imageUrl, prompt);
        } catch (error) {
            console.error(`Failed to generate sticker for idea: ${idea.text}`, error);
            setGeneratedStickers(prev => prev.map(s => s.id === idea.id ? { ...s, isGenerating: false } : s));
        }
    }, [selectedStyleId, textMode, textLanguage, characterDescription, outlineStyle, stickerType, language, uploadedImages, stylePreviewImage]);

    const processConcurrently = async <T,>(
        items: T[],
        processor: (item: T) => Promise<void>,
        concurrencyLimit: number
    ) => {
        const queue = [...items];
        const activePromises = new Set<Promise<any>>();

        const processNext = async () => {
            while (queue.length > 0) {
                if (activePromises.size >= concurrencyLimit) {
                    await Promise.race(activePromises);
                    continue;
                }
                const item = queue.shift();
                if (item) {
                    const promise = processor(item).finally(() => {
                        activePromises.delete(promise);
                        processNext();
                    });
                    activePromises.add(promise);
                }
            }
        };
        
        const initialWorkers = Array.from({ length: Math.min(concurrencyLimit, queue.length) }, processNext);
        await Promise.all(initialWorkers);
        
        while (activePromises.size > 0) {
            await Promise.all(Array.from(activePromises));
        }
    };


    const handleStartGeneration = useCallback(async () => {
        setCurrentView('results');

        const initialStickers = stickerIdeas.map(idea => {
            const langOption = TEXT_LANGUAGE_OPTIONS_I18N[language].find(opt => opt.id === textLanguage);
            const langForPrompt = langOption ? langOption.prompt : 'Traditional Chinese';
            return {
                id: idea.id,
                originalSrc: null,
                displaySrc: null,
                prompt: createEnhancedPrompt(idea, selectedStyleId, textMode, langForPrompt, characterDescription, outlineStyle, stickerType),
                isGenerating: true,
                hashtags: []
            };
        });
        setGeneratedStickers(initialStickers);

        await processConcurrently(stickerIdeas, generateSticker, 8);

    }, [stickerIdeas, generateSticker, language, textLanguage, selectedStyleId, textMode, characterDescription, outlineStyle, stickerType]);


    const regenerateSticker = useCallback(async (stickerId: string, prompt: string) => {
        setGeneratedStickers(prev => prev.map(s => s.id === stickerId ? { ...s, isGenerating: true } : s));
        try {
            const imageUrl = await geminiService.generateImage(prompt, uploadedImages, stylePreviewImage);
            await processAndSetStickerImage(stickerId, imageUrl, prompt);
        } catch (error) {
            console.error(`Failed to re-generate sticker: ${stickerId}`, error);
            setGeneratedStickers(prev => prev.map(s => s.id === stickerId ? { ...s, isGenerating: false } : s));
        }
    }, [uploadedImages, stylePreviewImage]);

    const regenerateAllStickers = async () => {
        const stickersToRegenerate = generatedStickers.filter(s => s.displaySrc);
        // FIX: Explicitly typing the `sticker` parameter as `GeneratedSticker` fixes a type inference issue
        // where it was incorrectly inferred as `unknown`, causing errors when accessing `sticker.id` and `sticker.prompt`.
        await processConcurrently(stickersToRegenerate, (sticker: GeneratedSticker) => regenerateSticker(sticker.id, sticker.prompt), 8);
    };
    
    const handleSaveAndRegenerateFromEdit = async (stickerId: string, userRequest: string) => {
        const sticker = generatedStickers.find(s => s.id === stickerId);
        if (!sticker) return;
        
        setGeneratedStickers(prev => prev.map(s => s.id === stickerId ? { ...s, isGenerating: true } : s));
        
        try {
            const newPrompt = await geminiService.translateAndRefinePrompt(sticker.prompt, userRequest);
            const imageUrl = await geminiService.generateImage(newPrompt, uploadedImages, stylePreviewImage);
            await processAndSetStickerImage(stickerId, imageUrl, newPrompt);
        } catch (error) {
            console.error(`Failed to regenerate with custom prompt: ${stickerId}`, error);
            setGeneratedStickers(prev => prev.map(s => s.id === stickerId ? { ...s, isGenerating: false } : s));
        }
    };

    const handleUpdateIdeaAndRegenerate = useCallback(async (stickerId: string, newText: string) => {
        const ideaToUpdate = stickerIdeas.find(i => i.id === stickerId);
        if (!ideaToUpdate) return;

        const updatedIdeas = stickerIdeas.map(idea => 
            idea.id === stickerId 
            ? { ...idea, text: newText, base: newText, memeText: textMode === 'with_text' ? newText : '' } 
            : idea
        );
        setStickerIdeas(updatedIdeas);

        const updatedIdea = updatedIdeas.find(i => i.id === stickerId)!;
        const langOption = TEXT_LANGUAGE_OPTIONS_I18N[language].find(opt => opt.id === textLanguage);
        const langForPrompt = langOption ? langOption.prompt : 'Traditional Chinese';
        const newPrompt = createEnhancedPrompt(updatedIdea, selectedStyleId, textMode, langForPrompt, characterDescription, outlineStyle, stickerType);
        
        await regenerateSticker(stickerId, newPrompt);
    }, [stickerIdeas, textMode, language, textLanguage, selectedStyleId, characterDescription, outlineStyle, stickerType, regenerateSticker]);

    const generateStylePreview = async () => {
        if (uploadedImages.length === 0) {
            setError(t('errorNoCharacterImage'));
            return;
        }
        setError(null);
        setShowLoadingOverlay(true);
        setLoadingMessage(t('generatingPreview'));
        try {
            const langOption = TEXT_LANGUAGE_OPTIONS_I18N[language].find(opt => opt.id === textLanguage);
            const langForPrompt = langOption ? langOption.prompt : 'Traditional Chinese';
            const prompt = createEnhancedPrompt({ base: 'a neutral standing pose', memeText: '' }, selectedStyleId, textMode, langForPrompt, characterDescription, outlineStyle, stickerType);
            const image = await geminiService.generateImage(prompt, uploadedImages);
            setStylePreviewImage(image);
        } catch (err: any) {
            setError(err.message || '無法產生風格預覽，請稍後再試。');
            console.error(err);
        } finally {
            setShowLoadingOverlay(false);
        }
    };

    const handleGoToExport = async () => {
        const successfulStickers = generatedStickers.filter(s => s.displaySrc);
        if (successfulStickers.length === 0) {
            setError('沒有成功生成的貼圖可供匯出。');
            return;
        }
        
        setShowLoadingOverlay(true);
        setLoadingMessage('正在生成商店資訊與關鍵字...');

        try {
            const ideaTexts = stickerIdeas
                .filter(idea => successfulStickers.some(s => s.id === idea.id))
                .map(idea => idea.text);
            
            const languageMap: Record<Language, string> = {
                'zh-Hant': 'Traditional Chinese',
                'en': 'English',
                'ja': 'Japanese'
            };
            const langForPrompt = languageMap[language];

            const storeInfo = await geminiService.generateStoreInfo(stickerTheme, ideaTexts, langForPrompt);
            
            const updatedStickersWithHashtags = [];
            for (const sticker of successfulStickers) {
                let currentSticker = sticker;
                if (sticker.hashtags.length === 0) {
                    const idea = stickerIdeas.find(i => i.id === sticker.id);
                    if (idea) {
                        try {
                            const hashtags = await geminiService.generateHashtags(idea.text, langForPrompt);
                            currentSticker = { ...sticker, hashtags };
                        } catch (e) {
                             console.error(`Failed to generate hashtags for sticker ${sticker.id}`, e);
                        }
                    }
                }
                updatedStickersWithHashtags.push(currentSticker);
            }

            setStickerPackTitle(storeInfo.title);
            setStickerPackDescription(storeInfo.description);
            setGeneratedStickers(prev => prev.map(s => {
                const updated = updatedStickersWithHashtags.find(u => u.id === s.id);
                return updated || s;
            }));

            const successfulIds = successfulStickers.map(s => s.id);
            setIncludedStickerIds(successfulIds);
            setMainStickerId(prev => successfulIds.includes(prev!) ? prev : successfulIds[0]);
            setTabStickerId(prev => successfulIds.includes(prev!) ? prev : successfulIds[0]);

            setCurrentView('export');
        } catch (err) {
            setError('準備匯出頁面時發生錯誤，請稍後再試。');
        } finally {
            setShowLoadingOverlay(false);
        }
    };


    // Main effect for view transitions
    useEffect(() => {
        if (currentView === 'upload_style') {
            // Reset state when going back to start
            setStickerIdeas([]);
            setGeneratedStickers([]);
            setStylePreviewImage(null);
            setUploadedImages([]);
            setError(null);
            setCharacterDescription('');
            setStickerTheme('');
            setStickerPackTitle('');
            setStickerPackDescription('');
            setIncludedStickerIds([]);
            setMainStickerId(null);
            setTabStickerId(null);
        }
    }, [currentView]);

    const renderView = () => {
        switch (currentView) {
            case 'upload_style':
                return <Step1CharacterStyle t={t} language={language} uploadedImages={uploadedImages} setUploadedImages={setUploadedImages} stickerType={stickerType} setStickerType={setStickerType} selectedStyleId={selectedStyleId} setSelectedStyleId={setSelectedStyleId} stickerCount={stickerCount} setStickerCount={setStickerCount} outlineStyle={outlineStyle} setOutlineStyle={setOutlineStyle} characterDescription={characterDescription} setCharacterDescription={setCharacterDescription} textMode={textMode} setTextMode={setTextMode} textLanguage={textLanguage} setTextLanguage={setTextLanguage} setCurrentView={setCurrentView} setError={setError} setStylePreviewImage={setStylePreviewImage} setIsLoading={setIsLoading} setLoadingMessage={setLoadingMessage} stylePreviewImage={stylePreviewImage} generateStylePreview={generateStylePreview} setIsCameraOpen={setIsCameraOpen} />;
            case 'ideas':
                return <Step2ThemeIdeas t={t} language={language} uploadedImages={uploadedImages} stylePreviewImage={stylePreviewImage} selectedStyleId={selectedStyleId} stickerCount={stickerCount} characterDescription={characterDescription} textMode={textMode} textLanguage={textLanguage} stickerIdeas={stickerIdeas} setStickerIdeas={setStickerIdeas} stickerTheme={stickerTheme} setStickerTheme={setStickerTheme} setCurrentView={setCurrentView} setError={setError} handleStartGeneration={handleStartGeneration} setShowLoadingOverlay={setShowLoadingOverlay} setLoadingMessage={setLoadingMessage} generateStylePreview={generateStylePreview} />;
            case 'results':
                return <Step3Results t={t} generatedStickers={generatedStickers} stickerIdeas={stickerIdeas} regenerateSticker={regenerateSticker} regenerateAllStickers={regenerateAllStickers} setEditingSticker={setEditingSticker} setCurrentView={setCurrentView} handleGoToExport={handleGoToExport} handleUpdateIdeaAndRegenerate={handleUpdateIdeaAndRegenerate} />;
            case 'export':
                return <Step4Export t={t} generatedStickers={generatedStickers} stickerIdeas={stickerIdeas} setCurrentView={setCurrentView} stickerPackTitle={stickerPackTitle} setStickerPackTitle={setStickerPackTitle} stickerPackDescription={stickerPackDescription} setStickerPackDescription={setStickerPackDescription} includedStickerIds={includedStickerIds} setIncludedStickerIds={setIncludedStickerIds} mainStickerId={mainStickerId} setMainStickerId={setMainStickerId} tabStickerId={tabStickerId} setTabStickerId={setTabStickerId} />;
            case 'complete':
                 return <Completion t={t} setCurrentView={setCurrentView} generatedStickers={generatedStickers.filter(s => includedStickerIds.includes(s.id))} stickerIdeas={stickerIdeas} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <Header t={t} currentView={currentView} theme={theme} language={language} handleThemeToggle={handleThemeToggle} handleLanguageToggle={handleLanguageToggle} error={error} isLoading={isLoading} loadingMessage={loadingMessage} showLoadingOverlay={showLoadingOverlay} />
                <main>
                    {renderView()}
                </main>
                {showLoadingOverlay && <LoadingOverlay t={t} loadingMessage={loadingMessage} />}
                {editingSticker && <EditModal t={t} editingSticker={editingSticker} setEditingSticker={setEditingSticker} onSaveAndRegenerate={handleSaveAndRegenerateFromEdit} />}
                {isCameraOpen && <CameraModal t={t} onClose={() => setIsCameraOpen(false)} onCapture={handleCaptureImage} />}
            </div>
        </div>
    );
}

export default App;
