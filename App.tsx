
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Language, Theme, View, UploadedImage, StickerType, OutlineStyle, TextMode, StickerIdea, GeneratedSticker, EditingStickerInfo, EditingIdeaInfo, AssistantMessage } from './types';
import { useTranslations } from './utils/translations';
import { createEnhancedPrompt } from './utils/promptHelper';
import * as geminiService from './services/geminiService';
import { removeGreenScreenAndResize, cropImageToSquare } from './utils/imageProcessing';
import { STICKER_SPECS, TEXT_LANGUAGE_OPTIONS_I18N, MAX_UPLOAD_COUNT, NO_THREE_VIEW_STYLES } from './constants';

import Header from './components/Header';
import Step1CharacterStyle from './components/Step1_CharacterStyle';
import Step2ThemeIdeas from './components/Step2_ThemeIdeas';
import Step3Results from './components/Step3_Results';
import Step4Export from './components/Step4_Export';
import Completion from './components/Completion';
import LoadingOverlay from './components/LoadingOverlay';
import ImageEditModal from './components/EditModal';
import IdeaEditModal from './components/IdeaEditModal';
import CameraModal from './components/CameraModal';
import PreviewSelectionModal from './components/PreviewSelectionModal';
import ConfirmationModal from './components/ConfirmationModal';
import AssistantModal from './components/AssistantModal';
import { SparklesIcon } from './components/icons/Icons';

const LOCAL_STORAGE_KEY = 'stickerMakerProgress';

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
    const isInitialRender = useRef(true);

    // Step 1: Style and Character
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [stickerType, setStickerType] = useState<StickerType>('static');
    const [selectedStyleIds, setSelectedStyleIds] = useState<string[]>(['anime']);
    const [stickerCount, setStickerCount] = useState(8);
    const [outlineStyle, setOutlineStyle] = useState<OutlineStyle>('white');
    const [characterDescription, setCharacterDescription] = useState('');
    const [textMode, setTextMode] = useState<TextMode>('none');
    const [textLanguage, setTextLanguage] = useState('chinese_traditional');
    const [stylePreviewImage, setStylePreviewImage] = useState<string | null>(null);
    const [styleStrength, setStyleStrength] = useState(3);
    const [stylePreviewCandidates, setStylePreviewCandidates] = useState<string[]>([]);
    const [showPreviewSelectionModal, setShowPreviewSelectionModal] = useState(false);
    
    // Step 2: Ideas
    const [stickerIdeas, setStickerIdeas] = useState<StickerIdea[]>([]);
    const [stickerTheme, setStickerTheme] = useState('');

    // Step 3: Results
    const [generatedStickers, setGeneratedStickers] = useState<GeneratedSticker[]>([]);
    const [editingSticker, setEditingSticker] = useState<EditingStickerInfo | null>(null);
    const [editingIdea, setEditingIdea] = useState<EditingIdeaInfo | null>(null);
    const [regenerateConfirm, setRegenerateConfirm] = useState<{ type: 'single' | 'all', stickerId?: string, prompt?: string } | null>(null);

    // Step 4: Export
    const [stickerPackTitle, setStickerPackTitle] = useState('');
    const [stickerPackDescription, setStickerPackDescription] = useState('');
    const [includedStickerIds, setIncludedStickerIds] = useState<string[]>([]);
    const [mainStickerId, setMainStickerId] = useState<string | null>(null);
    const [tabStickerId, setTabStickerId] = useState<string | null>(null);

    // Assistant State
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);
    const [isAssistantLoading, setIsAssistantLoading] = useState(false);
    
    useEffect(() => {
        // Initialize with a welcome message whenever the language changes and messages are empty
        if (assistantMessages.length === 0) {
            setAssistantMessages([
                { role: 'assistant', content: t('assistantWelcome'), stickerId: 'pipi_hello' }
            ]);
        }
    }, [t, assistantMessages.length]);

    const handleSendAssistantMessage = async (message: string) => {
        const newHistory: AssistantMessage[] = [...assistantMessages, { role: 'user', content: message }];
        setAssistantMessages(newHistory);
        setIsAssistantLoading(true);

        try {
            const response = await geminiService.getAssistantResponse(newHistory, language);
            setAssistantMessages(prev => [...prev, response]);
        } catch (err) {
            const errorMessage = { role: 'assistant' as const, content: 'Sorry, I encountered an error. Please try again.' };
            setAssistantMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsAssistantLoading(false);
        }
    };


    // Load state from localStorage on initial render
    useEffect(() => {
        try {
            const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedStateJSON) {
                const savedData = JSON.parse(savedStateJSON);

                const EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours
                if (savedData.timestamp && (new Date().getTime() - savedData.timestamp > EXPIRATION_TIME_MS)) {
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                    return; // Data is expired, start fresh.
                }

                const savedState = savedData.state || savedData; // Handle old format without timestamp wrapper
                
                setCurrentView(savedState.currentView ?? 'upload_style');
                setLanguage(savedState.language ?? 'zh-Hant');
                setTheme(savedState.theme ?? 'light');
                setUploadedImages(savedState.uploadedImages ?? []);
                setStickerType(savedState.stickerType ?? 'static');
                setSelectedStyleIds(savedState.selectedStyleIds ?? ['anime']);
                setStickerCount(savedState.stickerCount ?? 8);
                setOutlineStyle(savedState.outlineStyle ?? 'white');
                setCharacterDescription(savedState.characterDescription ?? '');
                setTextMode(savedState.textMode ?? 'none');
                setTextLanguage(savedState.textLanguage ?? 'chinese_traditional');
                setStylePreviewImage(savedState.stylePreviewImage ?? null);
                setStyleStrength(savedState.styleStrength ?? 3);
                setStickerIdeas(savedState.stickerIdeas ?? []);
                setStickerTheme(savedState.stickerTheme ?? '');
                setGeneratedStickers(savedState.generatedStickers ?? []);
                setStickerPackTitle(savedState.stickerPackTitle ?? '');
                setStickerPackDescription(savedState.stickerPackDescription ?? '');
                setIncludedStickerIds(savedState.includedStickerIds ?? []);
                setMainStickerId(savedState.mainStickerId ?? null);
                setTabStickerId(savedState.tabStickerId ?? null);
            }
        } catch (error) {
            console.error("Failed to load state from localStorage:", error);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }, []);

    const saveState = useCallback(() => {
        try {
            const stateToSave = {
                currentView, language, theme, uploadedImages, stickerType,
                selectedStyleIds, stickerCount, outlineStyle, characterDescription,
                textMode, textLanguage, stylePreviewImage, styleStrength,
                stickerIdeas, stickerTheme, generatedStickers, stickerPackTitle,
                stickerPackDescription, includedStickerIds, mainStickerId,
                tabStickerId,
            };
            const dataToSave = {
                state: stateToSave,
                timestamp: new Date().getTime(),
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (error: any) {
            console.error("Failed to save state to localStorage:", error);
        }
    }, [
        currentView, language, theme, uploadedImages, stickerType, selectedStyleIds,
        stickerCount, outlineStyle, characterDescription, textMode, textLanguage,
        stylePreviewImage, styleStrength, stickerIdeas, stickerTheme, generatedStickers,
        stickerPackTitle, stickerPackDescription, includedStickerIds, mainStickerId,
        tabStickerId
    ]);

    // Save state whenever it changes, with debouncing
    useEffect(() => {
        if (currentView !== 'complete') {
            const handler = setTimeout(() => {
                saveState();
            }, 500);
            return () => clearTimeout(handler);
        }
    }, [currentView, saveState]);


    // Theme toggle effect
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const handleThemeToggle = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const handleLanguageToggle = () => {
        const newLang = language === 'zh-Hant' ? 'en' : (language === 'en' ? 'ja' : 'zh-Hant');
        setLanguage(newLang);
        setT(newLang);
        // Reset assistant messages for new language
        setAssistantMessages([]);
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
        const prompt = createEnhancedPrompt(idea, selectedStyleIds, textMode, langForPrompt, characterDescription, outlineStyle, stickerType, styleStrength);
        try {
            const imageUrl = await geminiService.generateImage(prompt, uploadedImages, stylePreviewImage);
            await processAndSetStickerImage(idea.id, imageUrl, prompt);
        } catch (error) {
            console.error(`Failed to generate sticker for idea: ${idea.text}`, error);
            setGeneratedStickers(prev => prev.map(s => s.id === idea.id ? { ...s, isGenerating: false } : s));
        }
    }, [selectedStyleIds, textMode, textLanguage, characterDescription, outlineStyle, stickerType, language, uploadedImages, stylePreviewImage, styleStrength]);

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
                prompt: createEnhancedPrompt(idea, selectedStyleIds, textMode, langForPrompt, characterDescription, outlineStyle, stickerType, styleStrength),
                isGenerating: true,
                hashtags: []
            };
        });
        setGeneratedStickers(initialStickers);

        await processConcurrently(stickerIdeas, generateSticker, 8);

    }, [stickerIdeas, generateSticker, language, textLanguage, selectedStyleIds, textMode, characterDescription, outlineStyle, stickerType, styleStrength]);


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
    
    const handleSaveEditedImage = async (stickerId: string, finalImageSrc: string) => {
        setGeneratedStickers(prev => prev.map(s => s.id === stickerId ? { ...s, isGenerating: true } : s));
        const spec = STICKER_SPECS[stickerType];
        try {
            const displaySrc = await removeGreenScreenAndResize(finalImageSrc, spec.width, spec.height);
            const originalPrompt = generatedStickers.find(s => s.id === stickerId)?.prompt || '';
            setGeneratedStickers(prev => prev.map(s => s.id === stickerId ? { ...s, originalSrc: finalImageSrc, displaySrc, prompt: originalPrompt, isGenerating: false } : s));
        } catch (e) {
            console.error("Error processing edited image:", e);
            setError(t('errorImageProcessing'));
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
        const newPrompt = createEnhancedPrompt(updatedIdea, selectedStyleIds, textMode, langForPrompt, characterDescription, outlineStyle, stickerType, styleStrength);
        
        await regenerateSticker(stickerId, newPrompt);
    }, [stickerIdeas, textMode, language, textLanguage, selectedStyleIds, characterDescription, outlineStyle, stickerType, regenerateSticker, styleStrength]);
    
    const handleUpdateIdeaAndRegenerateAndCloseModal = async (stickerId: string, newText: string) => {
        setEditingIdea(null);
        await handleUpdateIdeaAndRegenerate(stickerId, newText);
    };

    const generatePreviewCandidates = async () => {
        if (uploadedImages.length === 0) {
            setError(t('errorNoCharacterImage'));
            return;
        }
        setError(null);
        setShowLoadingOverlay(true);
        setLoadingMessage(t('generatingPreviewCandidates'));
        try {
            const langOption = TEXT_LANGUAGE_OPTIONS_I18N[language].find(opt => opt.id === textLanguage);
            const langForPrompt = langOption ? langOption.prompt : 'Traditional Chinese';
            
            const strengths = styleStrength === 1 
                ? [1, 2, 3] 
                : styleStrength === 5
                ? [3, 4, 5]
                : [styleStrength - 1, styleStrength, styleStrength + 1];

            const poses = [
                'a neutral standing pose',
                'a character looking forward with a gentle smile',
                'a character in a simple, iconic pose that captures their personality'
            ];
            
            const threeViewPose = 'reference sheet showing the character in three views: front, side, and back';

            const previewPromises = selectedStyleIds.length > 1
                // For multiple styles, generate one preview per style
                ? selectedStyleIds.map((styleId, index) => {
                    const shouldUseThreeView = !NO_THREE_VIEW_STYLES.includes(styleId) && styleId !== 'original';
                    const pose = shouldUseThreeView ? threeViewPose : poses[index % poses.length];
                    const prompt = createEnhancedPrompt({ base: pose, memeText: '' }, [styleId], textMode, langForPrompt, characterDescription, outlineStyle, stickerType, styleStrength);
                    return geminiService.generateImage(prompt, uploadedImages);
                })
                // For a single style, generate strength variations
                : strengths.map((strength, index) => {
                    const styleId = selectedStyleIds[0];
                    const shouldUseThreeView = !NO_THREE_VIEW_STYLES.includes(styleId) && styleId !== 'original';
                    const pose = shouldUseThreeView ? threeViewPose : poses[index % poses.length];
                    const prompt = createEnhancedPrompt({ base: pose, memeText: '' }, selectedStyleIds, textMode, langForPrompt, characterDescription, outlineStyle, stickerType, strength);
                    return geminiService.generateImage(prompt, uploadedImages);
                });


            const results = await Promise.allSettled(previewPromises);
            const successfulImages = results
                .filter(r => r.status === 'fulfilled')
                .map(r => (r as PromiseFulfilledResult<string>).value);

            if (successfulImages.length === 0) {
                const firstRejected = results.find(r => r.status === 'rejected') as PromiseRejectedResult | undefined;
                const reason = firstRejected?.reason?.message || 'Failed to generate any previews.';
                throw new Error(reason);
            }

            setStylePreviewCandidates(successfulImages);
            setShowPreviewSelectionModal(true);
        } catch (err: any) {
            setError(err.message || 'Could not generate style previews. Please try again.');
            console.error(err);
        } finally {
            setShowLoadingOverlay(false);
        }
    };

    const handleSelectStylePreview = (selectedImage: string) => {
        setStylePreviewImage(selectedImage);
        setShowPreviewSelectionModal(false);
        setCurrentView('ideas');
    };

    const regenerateSinglePreview = async () => {
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
            
            const lastStyle = selectedStyleIds[selectedStyleIds.length - 1];
            const shouldUseThreeView = !NO_THREE_VIEW_STYLES.includes(lastStyle) && lastStyle !== 'original';
            const pose = shouldUseThreeView ? 'reference sheet showing the character in three views: front, side, and back' : 'a neutral standing pose';
            
            const prompt = createEnhancedPrompt({ base: pose, memeText: '' }, selectedStyleIds, textMode, langForPrompt, characterDescription, outlineStyle, stickerType, styleStrength);
            const image = await geminiService.generateImage(prompt, uploadedImages);
            setStylePreviewImage(image);
        } catch (err: any) {
            setError(err.message || 'Could not generate style preview. Please try again.');
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

    const handleRegenerate = async () => {
        if (!regenerateConfirm) return;
    
        const { type, stickerId, prompt } = regenerateConfirm;
        setRegenerateConfirm(null); // Close modal immediately
    
        if (type === 'single' && stickerId && prompt) {
            await regenerateSticker(stickerId, prompt);
        } else if (type === 'all') {
            await regenerateAllStickers();
        }
    };


    // Main effect for view transitions
    useEffect(() => {
        // If it's the first render, do nothing.
        // The loading effect handles the initial state from localStorage.
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        
        // On subsequent changes, if we navigate to the upload_style view,
        // it's an intentional full reset (e.g., from the "Create Another" button).
        if (currentView === 'upload_style') {
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
            // Clear saved progress on a full reset
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }, [currentView]);

    const renderView = () => {
        switch (currentView) {
            case 'upload_style':
                return <Step1CharacterStyle t={t} language={language} uploadedImages={uploadedImages} setUploadedImages={setUploadedImages} stickerType={stickerType} setStickerType={setStickerType} selectedStyleIds={selectedStyleIds} setSelectedStyleIds={setSelectedStyleIds} stickerCount={stickerCount} setStickerCount={setStickerCount} outlineStyle={outlineStyle} setOutlineStyle={setOutlineStyle} characterDescription={characterDescription} setCharacterDescription={setCharacterDescription} textMode={textMode} setTextMode={setTextMode} textLanguage={textLanguage} setTextLanguage={setTextLanguage} setError={setError} setIsLoading={setIsLoading} setLoadingMessage={setLoadingMessage} stylePreviewImage={stylePreviewImage} onGeneratePreviews={generatePreviewCandidates} setIsCameraOpen={setIsCameraOpen} styleStrength={styleStrength} setStyleStrength={setStyleStrength} />;
            case 'ideas':
                return <Step2ThemeIdeas t={t} language={language} uploadedImages={uploadedImages} stylePreviewImage={stylePreviewImage} selectedStyleIds={selectedStyleIds} stickerCount={stickerCount} characterDescription={characterDescription} textMode={textMode} textLanguage={textLanguage} stickerIdeas={stickerIdeas} setStickerIdeas={setStickerIdeas} stickerTheme={stickerTheme} setStickerTheme={setStickerTheme} setCurrentView={setCurrentView} setError={setError} handleStartGeneration={handleStartGeneration} setShowLoadingOverlay={setShowLoadingOverlay} setLoadingMessage={setLoadingMessage} onRegeneratePreview={regenerateSinglePreview} stickerType={stickerType} />;
            case 'results':
                return <Step3Results t={t} generatedStickers={generatedStickers} stickerIdeas={stickerIdeas} requestRegenerateSticker={(stickerId, prompt) => setRegenerateConfirm({ type: 'single', stickerId, prompt })} requestRegenerateAll={() => setRegenerateConfirm({ type: 'all' })} setEditingSticker={setEditingSticker} setCurrentView={setCurrentView} handleGoToExport={handleGoToExport} setEditingIdea={setEditingIdea} />;
            case 'export':
                return <Step4Export t={t} generatedStickers={generatedStickers} stickerIdeas={stickerIdeas} setCurrentView={setCurrentView} stickerPackTitle={stickerPackTitle} setStickerPackTitle={setStickerPackTitle} stickerPackDescription={stickerPackDescription} setStickerPackDescription={setStickerPackDescription} includedStickerIds={includedStickerIds} setIncludedStickerIds={setIncludedStickerIds} mainStickerId={mainStickerId} setMainStickerId={setMainStickerId} tabStickerId={tabStickerId} setTabStickerId={setTabStickerId} />;
            case 'complete':
                 return <Completion t={t} setCurrentView={setCurrentView} generatedStickers={generatedStickers.filter(s => includedStickerIds.includes(s.id))} stickerIdeas={stickerIdeas} stickerPackTitle={stickerPackTitle} stickerPackDescription={stickerPackDescription} />;
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
                {editingSticker && <ImageEditModal t={t} editingSticker={editingSticker} onClose={() => setEditingSticker(null)} onSave={handleSaveEditedImage} />}
                {editingIdea && (
                    <IdeaEditModal
                        t={t}
                        editingIdea={editingIdea}
                        onClose={() => setEditingIdea(null)}
                        onSave={handleUpdateIdeaAndRegenerateAndCloseModal}
                    />
                )}
                {isCameraOpen && <CameraModal t={t} onClose={() => setIsCameraOpen(false)} onCapture={handleCaptureImage} />}
                {showPreviewSelectionModal && (
                    <PreviewSelectionModal
                        t={t}
                        candidates={stylePreviewCandidates}
                        onSelect={handleSelectStylePreview}
                        onClose={() => setShowPreviewSelectionModal(false)}
                    />
                )}
                {regenerateConfirm && (
                    <ConfirmationModal
                        t={t}
                        title={t(regenerateConfirm.type === 'single' ? 'regenerateConfirmTitle' : 'regenerateAllConfirmTitle')}
                        message={t(regenerateConfirm.type === 'single' ? 'regenerateConfirmText' : 'regenerateAllConfirmText')}
                        confirmText={t(regenerateConfirm.type === 'single' ? 'regenerateConfirmAction' : 'regenerateAllConfirmAction')}
                        onConfirm={handleRegenerate}
                        onClose={() => setRegenerateConfirm(null)}
                    />
                )}
            </div>
            
            <button
                onClick={() => setIsAssistantOpen(true)}
                title={t('talkToAssistant')}
                className="fixed bottom-6 right-6 w-16 h-16 rounded-full btn-primary text-white flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform z-40"
            >
                <SparklesIcon />
            </button>

            <AssistantModal
                t={t}
                isOpen={isAssistantOpen}
                onClose={() => setIsAssistantOpen(false)}
                language={language}
                messages={assistantMessages}
                onSendMessage={handleSendAssistantMessage}
                isLoading={isAssistantLoading}
            />
        </div>
    );
}

export default App;