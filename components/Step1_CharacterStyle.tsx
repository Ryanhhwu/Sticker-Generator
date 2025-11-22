
import React, { useState, ChangeEvent } from 'react';
import { UploadedImage, Language, StickerType, OutlineStyle, TextMode } from '../types';
import { toBase64, cropImageToSquare } from '../utils/imageProcessing';
import { MAX_UPLOAD_COUNT, STICKER_SPECS, STYLE_IDS, TEXT_LANGUAGE_OPTIONS_I18N, STYLE_CARD_THUMBNAILS, STYLE_DESCRIPTION_IMAGES } from '../constants';
import { PlusIcon, RemoveIcon, UploadIcon, ChevronDownIcon, CameraIcon } from './icons/Icons';

interface Step1Props {
    t: (key: string, replacements?: Record<string, string | number>) => string;
    language: Language;
    uploadedImages: UploadedImage[];
    setUploadedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
    stickerType: StickerType;
    setStickerType: React.Dispatch<React.SetStateAction<StickerType>>;
    selectedStyleIds: string[];
    setSelectedStyleIds: React.Dispatch<React.SetStateAction<string[]>>;
    stickerCount: number;
    setStickerCount: React.Dispatch<React.SetStateAction<number>>;
    outlineStyle: OutlineStyle;
    setOutlineStyle: React.Dispatch<React.SetStateAction<OutlineStyle>>;
    characterDescription: string;
    setCharacterDescription: React.Dispatch<React.SetStateAction<string>>;
    textMode: TextMode;
    setTextMode: React.Dispatch<React.SetStateAction<TextMode>>;
    textLanguage: string;
    setTextLanguage: React.Dispatch<React.SetStateAction<string>>;
    setError: (error: string | null) => void;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setLoadingMessage: React.Dispatch<React.SetStateAction<string>>;
    stylePreviewImage: string | null;
    onGeneratePreviews: () => Promise<void>;
    setIsCameraOpen: React.Dispatch<React.SetStateAction<boolean>>;
    styleStrength: number;
    setStyleStrength: React.Dispatch<React.SetStateAction<number>>;
}

const Step1CharacterStyle: React.FC<Step1Props> = (props) => {
    const { t, language, uploadedImages, setUploadedImages, stickerType, setStickerType, selectedStyleIds, setSelectedStyleIds, stickerCount, setStickerCount, outlineStyle, setOutlineStyle, characterDescription, setCharacterDescription, textMode, setTextMode, textLanguage, setTextLanguage, setError, setIsLoading, setLoadingMessage, onGeneratePreviews, setIsCameraOpen, styleStrength, setStyleStrength } = props;
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isMultiStyleMode, setIsMultiStyleMode] = useState(false);

    const processFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        if (uploadedImages.length + files.length > MAX_UPLOAD_COUNT) {
            setError(t('maxUploads', { count: MAX_UPLOAD_COUNT }));
            return;
        }

        setIsLoading(true);
        setLoadingMessage(t('processingAndPacking').replace('...',''));
        setError(null);
        
        try {
            const newImages: UploadedImage[] = await Promise.all(
                Array.from(files).slice(0, MAX_UPLOAD_COUNT - uploadedImages.length).map(async (file: File) => {
                    const base64Image = await toBase64(file);
                    const croppedImage = await cropImageToSquare(base64Image);
                    return { base64: croppedImage, name: file.name };
                })
            );
            setUploadedImages(prev => [...prev, ...newImages]);
        } catch (err) {
            setError(t('errorImageProcessing'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
        processFiles(event.target.files);
        event.target.value = ''; // Allow re-uploading the same file
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(false);
        processFiles(event.dataTransfer.files);
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleStickerTypeChange = (type: StickerType) => {
        const spec = STICKER_SPECS[type];
        if (!spec) return;

        let newStickerCount = stickerCount;
        if (!spec.countOptions.includes(newStickerCount)) {
            newStickerCount = spec.countOptions[0];
        }
        setStickerType(type);
        setStickerCount(newStickerCount);
    };

    const handleNextStep = async () => {
        if (uploadedImages.length === 0) {
            setError(t('errorNoCharacterImage'));
            return;
        }
        setError(null);
        await onGeneratePreviews();
    };

    const handleStyleSelect = (id: string) => {
        if (isMultiStyleMode && id === 'original') {
            return; // Don't allow selecting 'original' in multi-select mode.
        }
    
        if (id === 'original') {
            setSelectedStyleIds(['original']);
            setIsMultiStyleMode(false); // Force single mode
            return;
        }
    
        if (isMultiStyleMode) {
            setSelectedStyleIds(prev => {
                const isSelected = prev.includes(id);
                if (isSelected) {
                    return prev.filter(styleId => styleId !== id);
                }
                if (prev.length < 3) {
                    return [...prev, id];
                }
                setError(t('maxStylesWarning'));
                return prev;
            });
        } else {
            setSelectedStyleIds([id]);
        }
    };
    
    const handleMultiStyleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setIsMultiStyleMode(checked);
    
        if (checked) {
            // When switching to multi-mode, remove 'original' if it was selected
            setSelectedStyleIds(prev => prev.filter(id => id !== 'original'));
        } else {
            // When switching to single-mode, keep only the last selected item if multiple were selected
            if (selectedStyleIds.length > 1) {
                setSelectedStyleIds(prev => [prev[prev.length - 1]]);
            }
        }
    };
    
    const lastSelectedStyleId = selectedStyleIds.length > 0 ? selectedStyleIds[selectedStyleIds.length - 1] : 'anime';
    const selectedStyleKey = `style${lastSelectedStyleId.charAt(0).toUpperCase() + lastSelectedStyleId.slice(1)}` as any;

    return (
        <div className="w-full max-w-7xl p-6 sm:p-8 rounded-3xl shadow-xl border mx-auto" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--card-border-color)', backdropFilter: 'blur(10px)' }}>
            <h2 className="text-2xl font-bold mb-6 text-green-600 dark:text-primary flex items-center gap-2">{t('step1Title')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="flex flex-col lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-3 text-center">{t('characterReference')}</h3>
                    
                    <label
                        htmlFor="file-upload-dropzone"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`group cursor-pointer w-full mx-auto aspect-square border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-4 transition-all duration-300 shadow-inner relative overflow-hidden
                            ${isDragging ? 'border-green-500 bg-green-50 dark:bg-green-900/30 ring-4 ring-green-500/20' : 'border-gray-300 dark:border-gray-600'}
                            ${uploadedImages.length > 0 ? 'border-solid p-3' : ''}
                        `}
                        style={{ backgroundColor: 'var(--card-hover-bg)' }}
                    >
                        <input id="file-upload-dropzone" type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        
                        {uploadedImages.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 w-full h-full">
                                {uploadedImages.map((img, index) => (
                                    <div key={index} className="relative w-full h-full aspect-square group/image">
                                        <img src={img.base64} className="w-full h-full object-cover rounded-2xl" alt={`角色參考圖 ${index + 1}`} />
                                        <button 
                                            onClick={(e) => { e.preventDefault(); handleRemoveImage(index); }} 
                                            className="absolute top-1 right-1 bg-red-600/80 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs hover:bg-red-500 transition shadow-md opacity-0 group-hover/image:opacity-100 backdrop-blur-sm"
                                        >
                                            <RemoveIcon />
                                        </button>
                                    </div>
                                ))}
                                {uploadedImages.length < MAX_UPLOAD_COUNT && (
                                     <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-400 dark:border-gray-500 group-hover:border-green-500 text-gray-400 group-hover:text-green-500 transition-colors">
                                        <PlusIcon />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center pointer-events-none" style={{ color: 'var(--text-muted-color)' }}>
                                <UploadIcon className="h-16 w-16 text-gray-400 group-hover:text-green-500 transition-colors" />
                                <p className="mt-4 text-lg font-semibold">{t('uploadPrompt')}</p>
                                <p className="text-sm mt-1">{t('uploadPlaceholder')}</p>
                            </div>
                        )}
                    </label>

                    <div className="w-full mx-auto mt-4 grid grid-cols-2 gap-3">
                        <label htmlFor="file-upload-button" className="btn-secondary px-4 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-base text-center">
                            <UploadIcon className="h-6 w-6" />
                            <span>{t('uploadFromFile')}</span>
                            <input id="file-upload-button" type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        <button onClick={() => setIsCameraOpen(true)} className="btn-secondary px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-base">
                            <CameraIcon />
                            <span>{t('openCamera')}</span>
                        </button>
                    </div>

                    <p className="text-sm mt-2 text-center" style={{ color: 'var(--text-muted-color)' }}>{t('maxUploads', { count: MAX_UPLOAD_COUNT })}</p>

                    <div className="mt-4">
                        <button onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className="flex justify-between items-center w-full text-left font-semibold py-2 text-base">
                           {t('advancedSettings')}
                           <ChevronDownIcon className={`transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isAdvancedOpen && (
                             <div className="mt-2">
                                <label htmlFor="character-description" className="block text-base font-medium mb-2">{t('characterNotes')}</label>
                                <textarea id="character-description" value={characterDescription} onChange={(e) => setCharacterDescription(e.target.value)} placeholder={t('characterNotesPlaceholder')} className="w-full border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-base text-gray-900 dark:text-white" rows={3} style={{ backgroundColor: 'var(--input-bg-color)', borderColor: 'var(--input-border-color)' }} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">{t('stickerTypeSelection')}</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(STICKER_SPECS).map(([type, spec]) => (
                                <div key={type} onClick={() => handleStickerTypeChange(type as StickerType)} className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${stickerType === type ? 'style-card-active' : 'hover:border-green-400'}`} style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--input-border-color)' }}>
                                    <p className="font-semibold text-base truncate">{t(spec.labelKey)}</p>
                                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted-color)' }}>{t(spec.descKey)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">{t('styleSelection')}</h3>
                            <div className="flex items-center gap-2">
                                <label htmlFor="multi-style-toggle" className="text-sm font-medium cursor-pointer" style={{color: 'var(--text-muted-color)'}}>{t('multiSelectStyles')}</label>
                                <input 
                                    id="multi-style-toggle"
                                    type="checkbox" 
                                    className="form-checkbox h-5 w-5 rounded border-2 border-gray-300 dark:border-white/60 bg-white dark:bg-white/10 text-primary checked:bg-primary checked:border-transparent focus:ring-primary focus:ring-offset-0 cursor-pointer transition-colors"
                                    checked={isMultiStyleMode} 
                                    onChange={handleMultiStyleToggle}
                                />
                            </div>
                        </div>
                        <p className="text-base mb-4" style={{ color: 'var(--text-muted-color)' }}>{t('stylePrompt')}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[22rem] overflow-y-auto pr-2 style-grid">
                            {STYLE_IDS.map(id => (
                                <div key={id} onClick={() => handleStyleSelect(id)} className={`p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col items-center text-center ${selectedStyleIds.includes(id) ? 'style-card-active' : 'hover:border-green-400'} ${isMultiStyleMode && id === 'original' ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--input-border-color)' }}>
                                    <img src={STYLE_CARD_THUMBNAILS[id]} alt={t(`style${id.charAt(0).toUpperCase() + id.slice(1)}Label`)} className="w-full h-auto aspect-[15/8] rounded-md mb-2 object-cover"/>
                                    <p className="font-semibold text-base leading-tight">{t(`style${id.charAt(0).toUpperCase() + id.slice(1)}Label`)}</p>
                                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted-color)' }}>{t(`style${id.charAt(0).toUpperCase() + id.slice(1)}ShortDesc`)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 rounded-lg border flex items-center gap-4" style={{ backgroundColor: 'var(--input-bg-color)', borderColor: 'var(--input-border-color)' }}>
                            <div className="flex-1">
                                <p className="font-semibold text-base">{t(`${selectedStyleKey}Label`)}</p>
                                <p className="text-sm mt-1" style={{ color: 'var(--text-muted-color)' }}>{t(`${selectedStyleKey}Desc`)}</p>
                            </div>
                            <img src={STYLE_DESCRIPTION_IMAGES[lastSelectedStyleId] ?? STYLE_CARD_THUMBNAILS[lastSelectedStyleId]} alt="Style Thumbnail" className="w-24 h-24 rounded-md object-cover flex-shrink-0" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="style-strength" className="block text-base font-medium mb-1">{t('styleStrength')}</label>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-muted-color)' }}>{t('styleStrengthDesc')}</p>
                        <div className="flex items-center gap-4">
                            <span className="text-sm" style={{ color: 'var(--text-muted-color)' }}>{t('moreFaithful')}</span>
                            <input
                                id="style-strength"
                                type="range"
                                min="1"
                                max="5"
                                value={styleStrength}
                                onChange={(e) => setStyleStrength(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                            <span className="text-sm" style={{ color: 'var(--text-muted-color)' }}>{t('moreStylized')}</span>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="sticker-count" className="block text-base font-medium mb-2">{t('stickerCount')}</label>
                            <select id="sticker-count" value={stickerCount} onChange={(e) => setStickerCount(Number(e.target.value))} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-base text-gray-900 dark:text-white" style={{ backgroundColor: 'var(--input-bg-color)', borderColor: 'var(--input-border-color)' }}>
                                {(STICKER_SPECS[stickerType]?.countOptions || []).map((c: number) => {
                                    let label = `${c} ${t('stickerUnit')}`;
                                    if (c === 2 && (stickerType === 'static' || stickerType === 'emoji')) {
                                        label += ` ${t('betaLabel')}`;
                                    }
                                    return <option key={c} value={c}>{label}</option>
                                })}
                            </select>
                            <p className="text-xs mt-2" style={{ color: 'var(--text-muted-color)' }}>{t('quotaWarning')}</p>
                        </div>
                         <div>
                            <label className="block text-base font-medium mb-2">{t('outlineSelection')}</label>
                            <div className="flex gap-2">
                                {['black', 'white', 'none'].map(style => (
                                    <button key={style} onClick={() => setOutlineStyle(style as OutlineStyle)} className={`flex-1 px-3 py-2 text-base font-semibold rounded-lg border-2 transition-all ${outlineStyle === style ? 'radio-selected bg-green-500 text-white border-green-500' : ''}`} style={{ backgroundColor: outlineStyle !== style ? 'var(--input-bg-color)' : '', borderColor: 'var(--input-border-color)' }}>{t(`outline${style.charAt(0).toUpperCase() + style.slice(1)}`)}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-base font-medium mb-2">{t('textOptions')}</label>
                            <div className="flex gap-2">
                                <button onClick={() => setTextMode('none')} className={`flex-1 px-4 py-2 rounded-lg border-2 font-semibold text-base transition-all ${textMode === 'none' ? 'radio-selected bg-green-500 text-white border-green-500' : 'hover:bg-gray-100'}`} style={{ backgroundColor: textMode !== 'none' ? 'var(--input-bg-color)' : '', borderColor: 'var(--input-border-color)' }}>{t('noText')}</button>
                                <button onClick={() => setTextMode('with_text')} className={`flex-1 px-4 py-2 rounded-lg border-2 font-semibold text-base transition-all ${textMode === 'with_text' ? 'radio-selected bg-green-500 text-white border-green-500' : 'hover:bg-gray-100'}`} style={{ backgroundColor: textMode !== 'with_text' ? 'var(--input-bg-color)' : '', borderColor: 'var(--input-border-color)' }}>{t('withText')}</button>
                            </div>
                             {textMode === 'with_text' && (
                                <div className="mt-4">
                                    <label htmlFor="text-language" className="block text-base font-medium mb-2">{t('textLanguage')}</label>
                                    <select id="text-language" value={textLanguage} onChange={(e) => setTextLanguage(e.target.value)} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-base text-gray-900 dark:text-white" style={{ backgroundColor: 'var(--input-bg-color)', borderColor: 'var(--input-border-color)' }}>
                                        {TEXT_LANGUAGE_OPTIONS_I18N[language].map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={handleNextStep} disabled={uploadedImages.length === 0 || selectedStyleIds.length === 0} className="w-full text-lg mt-8 py-3 rounded-xl btn-primary text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:bg-gray-400 disabled:from-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-1">{t('nextPreviewAndCustomize')}</button>
                </div>
            </div>
        </div>
    );
};

export default Step1CharacterStyle;
